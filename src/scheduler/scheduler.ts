import { RunService } from '@rbxts/services'
import {
	ChildOf,
	component,
	type EntityHandle,
	External,
	entity,
	type Handle,
	type InferValue,
	Internal,
	Persistent,
} from '../handle'
import { pair } from '../pair'
import { query } from '../query'
import { deepEqual, joinUnknown } from '../util'
import { setActivePluginEntity } from './pluginContext'
import { Schedule, ScheduleComponent, System } from './schedule'
import type { SetConfig, SystemConfig, SystemFn, SystemSet } from './system'

export type PluginFn<Args extends unknown[] = unknown[]> = (
	scheduler: Scheduler,
	...args: Args
) => void

export type StartupSchedules = 'preStartup' | 'startup' | 'postStartup'
export type UpdateSchedules =
	| 'first'
	| 'preUpdate'
	| 'update'
	| 'postUpdate'
	| 'last'
export type RunServiceSchedules =
	| 'preRender'
	| 'preAnimation'
	| 'preSimulation'
	| 'postSimulation'
export type Schedules = StartupSchedules | UpdateSchedules | RunServiceSchedules

export const Plugin = component<{
	fn: PluginFn
	args: unknown[]
	built: boolean
}>('Plugin')
	.set(Internal)
	.set(Persistent)

let schedulerAlreadyCreated = false

function findParentPlugin(): EntityHandle | undefined {
	// Traverses the call stack to find the first function matching the given callback.
	function hasFnInCallStack(fn: Callback): boolean {
		let depth = 2
		while (true) {
			const f = debug.info(depth, 'f')[0]
			if (f === undefined) {
				return false
			} else if (f === fn) {
				return true
			}
			depth++
		}
	}

	return query(Plugin).find((_, p) => hasFnInCallStack(p.fn))?.[0] as
		| EntityHandle
		| undefined
}

export class Scheduler {
	private readonly scheduleMap = new Map<Schedules, Schedule>([
		// Startup schedules.
		['preStartup', new Schedule('preStartup')],
		['startup', new Schedule('startup')],
		['postStartup', new Schedule('postStartup')],

		// Update schedules.
		['first', new Schedule('first')],
		['preUpdate', new Schedule('preUpdate')],
		['update', new Schedule('update')],
		['postUpdate', new Schedule('postUpdate')],
		['last', new Schedule('last')],

		// RunService schedules.
		['preRender', new Schedule('preRender')],
		['preAnimation', new Schedule('preAnimation')],
		['preSimulation', new Schedule('preSimulation')],
		['postSimulation', new Schedule('postSimulation')],
	])
	private readonly connections: RBXScriptConnection[] = []
	private running = false

	constructor() {
		if (schedulerAlreadyCreated) {
			error('There can only be one scheduler instance')
		}

		schedulerAlreadyCreated = true
	}

	useSystem(
		schedule: Schedules,
		systemFn: SystemFn,
		config?: SystemConfig,
	): this {
		this.assertNotRunning('useSystem')
		this.scheduleMap.get(schedule)!.useSystem(systemFn, config)
		return this
	}

	useSystemChain(
		schedule: Schedules,
		...systemFns: (SystemFn | [SystemFn, SystemConfig])[]
	): this {
		this.assertNotRunning('useSystemChain')
		this.scheduleMap.get(schedule)!.useSystemChain(...systemFns)
		return this
	}

	configureSet(schedule: Schedules, set: SystemSet, config: SetConfig): this {
		this.assertNotRunning('configureSet')
		this.scheduleMap.get(schedule)!.configureSet(set, config)
		return this
	}

	usePlugin<Args extends unknown[]>(
		pluginFn: PluginFn<Args>,
		...args: Args
	): this {
		this.assertNotRunning('usePlugin')

		const label = debug.info(pluginFn, 'n')[0]!
		if (label === '') {
			error(
				'Failed to register plugin because its function has no name\n\n' +
					"Tip: find your plugin's anonymous function and replace it with a named function",
			)
		}

		const pluginEntity = entity(label).set(Plugin, {
			fn: pluginFn as PluginFn,
			args,
			built: false,
		})

		const parentPlugin = findParentPlugin()
		if (parentPlugin) {
			pluginEntity.set(pair(ChildOf, parentPlugin))
		}

		return this
	}

	run() {
		this.assertNotRunning('run')

		this.buildPlugins()

		this.running = true

		this.runSchedule('preStartup')
		this.runSchedule('startup')
		this.runSchedule('postStartup')

		const c1 = RunService.Heartbeat.Connect((_dt) => {
			this.runSchedule('first')
			this.runSchedule('preUpdate')
			this.runSchedule('update')
			this.runSchedule('postUpdate')
			this.runSchedule('last')
		})

		const c2 = RunService.PreRender.Connect((_dt) =>
			this.runSchedule('preRender'),
		)
		const c3 = RunService.PreAnimation.Connect((_dt) =>
			this.runSchedule('preAnimation'),
		)
		const c4 = RunService.PreSimulation.Connect((_dt) =>
			this.runSchedule('preSimulation'),
		)
		const c5 = RunService.PostSimulation.Connect((_dt) =>
			this.runSchedule('postSimulation'),
		)

		this.connections.push(c1, c2, c3, c4, c5)
	}

	// Scheduler isn't allowed to be instantiated more than once, but our test suite needs to be able to reset it.
	/** @internal */
	_despawn() {
		schedulerAlreadyCreated = false
		this.connections.forEach((c) => c.Disconnect())
		query(System).forEach((e) => e.despawn())
		query(Plugin).forEach((e) => e.despawn())
		query(ScheduleComponent).forEach((e) => e.despawn())
	}

	private runSchedule(schedule: Schedules): void {
		this.scheduleMap
			.get(schedule)!
			.getSortedSystems()
			.forEach(({ systemFn, runIf }) => {
				if (runIf.every((cond) => cond())) this.runSystem(systemFn)
			})
	}

	private runSystem(systemFn: SystemFn): void {
		systemFn()
	}

	private buildPlugins(): void {
		let pendingPlugins = query(Plugin)
			.collect()
			.filter(([, p]) => !p.built)

		const sortUserFirst = (a: Handle, b: Handle) => {
			const isAExternal = a.has(External)
			const isBExternal = b.has(External)
			return isAExternal === isBExternal ? false : !isAExternal
		}

		const shouldBuild = (
			_incomingEnt: Handle,
			_incomingData: InferValue<typeof Plugin>,
		): boolean => {
			const _existing = query(Plugin)
				.collect()
				.find(([, p]) => p.built === true && p.fn === _incomingData.fn)
			if (!_existing) return true

			const [existingEnt, existingData] = _existing
			// From here on, we know incoming is a duplicate.
			const [duplicateEnt, duplicateData] = [_incomingEnt, _incomingData]

			const existingOrigin = existingEnt.has(External)
				? 'external'
				: existingEnt.has(Internal)
					? 'internal'
					: 'user'
			if (existingOrigin === 'internal') {
				error(`Internal plugin duplication found - this should never happen`)
			}
			const duplicateOrigin = duplicateEnt.has(External) ? 'external' : 'user'

			// user <- user: should error, as the user likely forgot they've added the same plugin already.
			// user <- external: should skip external's registration, as user registration takes precedence.
			// external <- user: should never happen, as user plugins are built first.
			// external <- external:
			//      if arguments are the same: should skip, as the shared plugin would be built the same way by both external plugins.
			//      if arguments differ: should error, as the user didn't register the plugin themselves in order to resolve the conflict.
			if (existingOrigin === 'user' && duplicateOrigin === 'user') {
				error(
					`User plugin '${existingEnt}' has already been registered\n\n` +
						`Tip: ensure '${duplicateEnt}' is only registered once`,
				)
			} else if (existingOrigin === 'user' && duplicateOrigin === 'external') {
				return false
			} else if (existingOrigin === 'external' && duplicateOrigin === 'user') {
				error(
					`User plugin '${duplicateEnt}' being built after external plugin should never happen, as user plugins are meant to be built first`,
				)
			} else if (
				existingOrigin === 'external' &&
				duplicateOrigin === 'external'
			) {
				if (deepEqual(existingData.args, duplicateData.args)) return false

				const args1 = joinUnknown(existingData.args)
				const args2 = joinUnknown(duplicateData.args)
				error(
					`Two libraries are registering the same plugin '${existingEnt}' with different arguments (${args1} vs ${args2})\n\n` +
						`Tip: this conflict can be resolved by registering the plugin yourself, ensuring a sane set of arguments are provided`,
				)
			}

			error('Unreachable')
		}

		const buildPlugin = (e: Handle, p: InferValue<typeof Plugin>) => {
			if (!shouldBuild(e, p)) {
				e.despawn()
				return
			}

			setActivePluginEntity(e as EntityHandle)
			// We use a try-finally block to ensure the active plugin entity is always cleared, even if the plugin throws an error.
			try {
				p.fn(this, ...p.args)
			} finally {
				setActivePluginEntity(undefined)
				p.built = true
			}
		}

		// We use a while loop to ensure that if a plugin registers another plugin, the child plugin is also fully built during this exact step.
		while (!pendingPlugins.isEmpty()) {
			pendingPlugins
				.sort(([p1], [p2]) => sortUserFirst(p1, p2))
				.forEach(([e, p]) => buildPlugin(e, p))

			pendingPlugins = query(Plugin)
				.collect()
				.filter(([, p]) => !p.built)
		}
	}

	private assertNotRunning(methodName: string): void {
		assert(
			!this.running,
			`${methodName} cannot be called when the scheduler is already running`,
		)
	}
}

export function scheduler(): Scheduler {
	return new Scheduler()
}
