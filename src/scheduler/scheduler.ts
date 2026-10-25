import { RunService } from '@rbxts/services'
import {
	type Entity,
	type EntityLike,
	entity,
	type InferValue,
} from '../entities'
import { Builtin } from '../entities/builtins'
import { pair } from '../entities/pair'
import { clearStaleMessages } from '../message'
import { query } from '../query'
import { deepEqual, joinUnknown } from '../util'
import { setActivePluginEntity } from './pluginContext'
import { Schedule } from './schedule'
import type {
	SetConfig,
	SystemConfig,
	SystemData,
	SystemFn,
	SystemSet,
} from './system'
import { setActiveSystemEntity } from './systemContext'

/**
 * A function that represents a plugin.
 *
 * @group Types
 */
export type PluginFn<Args extends unknown[] = unknown[]> = (
	scheduler: Scheduler,
	...args: Args
) => void

/**
 * @group Types
 */
export type StartupSchedules = 'preStartup' | 'startup' | 'postStartup'
/**
 * @group Types
 */
export type UpdateSchedules =
	| 'first'
	| 'preUpdate'
	| 'update'
	| 'postUpdate'
	| 'last'
/**
 * @group Types
 */
export type RunServiceSchedules =
	| 'preRender'
	| 'preAnimation'
	| 'preSimulation'
	| 'postSimulation'
/**
 * @group Types
 */
export type Schedules = StartupSchedules | UpdateSchedules | RunServiceSchedules

let existingScheduler: Scheduler | undefined

function findParentPlugin(): Entity | undefined {
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

	return query(Builtin.Plugin).find((_, p) => hasFnInCallStack(p.fn))?.[0] as
		| Entity
		| undefined
}

/**
 * The type for the scheduler created with {@link scheduler}.
 *
 * @group Types
 */
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
		if (existingScheduler) {
			error('There can only be one scheduler instance')
		}

		existingScheduler = this

		this.useSystem('first', clearStaleMessages)
	}

	/**
	 * Schedules a system to run in the specified `schedule` with the provided arguments.
	 *
	 * Optionally, a `SystemConfig` can be passed to configure the system, such as specifying when it should run or
	 * in which system set it should belong.
	 *
	 * @remarks
	 * It cannot be assumed that two systems scheduled in the same phase will run in the order they were registered.
	 * Instead, consider using `useSystemChain`.
	 *
	 * @example
	 * ```ts
	 * scheduler()
	 *     .useSystem('update', runsFirst)
	 *     .useSystem('update', runsSecond, { after: runsFirst })
	 *     .run()
	 * ```
	 *
	 * #### Introspection
	 *
	 * After a system is scheduled, it becomes an entity with the `System` component.
	 * This allows you to inspect metadata about the system and manipulate it.
	 *
	 * Additionally, the system is automatically made a child of its schedule
	 * (i.e. `pair(ChildOf, scheduleEntity)`).
	 */
	useSystem<Args extends unknown[]>(
		schedule: Schedules,
		systemFn: SystemFn<Args>,
		config?: SystemConfig<Args>,
	): this {
		this.assertNotRunning('useSystem')
		this.scheduleMap.get(schedule)!.useSystem(systemFn as SystemFn, config)
		return this
	}

	/**
	 * Schedules a chain of systems to run in order in the specified `schedule`,
	 * with an optional `SystemConfig` for each system.
	 *
	 * @example
	 * ```ts
	 * scheduler()
	 *     .useSystemChain('update', [
	 *         gatherInput, // Implicitly runs before `drawUI`.
	 *         [drawUI, { runIf: !inCinematicMode }],
	 *     ])
	 *     .run()
	 * ```
	 */
	useSystemChain<T extends unknown[][]>(
		schedule: Schedules,
		systemFns: {
			[K in keyof T]: [] extends T[K]
				? SystemFn<T[K]> | [SystemFn<T[K]>, SystemConfig<NoInfer<T[K]>>]
				: [SystemFn<T[K]>, SystemConfig<NoInfer<T[K]>>]
		},
	): this {
		this.assertNotRunning('useSystemChain')
		this.scheduleMap.get(schedule)!.useSystemChain(systemFns)
		return this
	}

	/**
	 * Configures a `SystemSet` for the specified `schedule` with the given `config`.
	 *
	 * @remarks
	 * System set configuration is per schedule, meaning the same system set can be configured
	 * differently for each schedule.
	 *
	 * @example
	 * ```ts
	 * const sense = new SystemSet('sense')
	 * const think = new SystemSet('think')
	 * const act = new SystemSet('act')
	 *
	 * scheduler()
	 *     // System sets that don't need configuration don't need to be configured.
	 *     .configureSet('update', think, { after: sense })
	 *     .configureSet('update', act, { after: think })
	 *     .run()
	 * ```
	 */
	configureSet(schedule: Schedules, set: SystemSet, config: SetConfig): this {
		this.assertNotRunning('configureSet')
		this.scheduleMap.get(schedule)!.configureSet(set, config)
		return this
	}

	/**
	 * Registers a plugin function to be run before the scheduler starts. This function is
	 * given the scheduler and anything else passed in `...args`.
	 *
	 * @remarks
	 * Throws when given an arrow function, as plugins strictly require an inferable name.
	 *
	 * @example
	 * ```ts
	 * function physics(scheduler: Scheduler, gravity: number) {
	 *     scheduler.useSystem('update', updatePhysics, { args: gravity })
	 * }
	 *
	 * scheduler()
	 *    .usePlugin(physics, 196.2)
	 *    .run()
	 * ```
	 *
	 * #### Introspection
	 *
	 * After a plugin is built, it becomes an entity with the `Plugin` component.
	 * This allows you to inspect metadata about the plugin and manipulate it.
	 *
	 * Additionally, every entity spawned within a plugin is automatically given
	 * the `pair(AddedByPlugin, pluginEntity)` relationship.
	 */
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

		const pluginEntity = entity(label).set(Builtin.Plugin, {
			fn: pluginFn as PluginFn,
			args,
			built: false,
		})

		const parentPlugin = findParentPlugin()
		if (parentPlugin) {
			pluginEntity.set(pair(Builtin.ChildOf, parentPlugin))
		}

		return this
	}

	/**
	 * Builds all plugins and then initializes every schedule.
	 *
	 * @remarks
	 * Throws if `run` is called while the scheduler is already running.
	 *
	 * When a schedule is initialized, an entity representing it is spawned and all
	 * related systems are made children of it.
	 */
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

	/**
	 * Simulates a single run of the specified `schedule`.
	 *
	 * @remarks
	 * This is primarily used for testing - use at your own risk.
	 */
	__runSchedule(schedule: Schedules): void {
		this.runSchedule(schedule)
	}

	/**
	 * Simulates a `first -> preUpdate -> update -> postUpdate -> last` tick of the scheduler.
	 *
	 * @remarks
	 * This is primarily used for testing - use at your own risk.
	 */
	__tick() {
		this.runSchedule('first')
		this.runSchedule('preUpdate')
		this.runSchedule('update')
		this.runSchedule('postUpdate')
		this.runSchedule('last')
	}

	/** @internal */
	__despawn() {
		existingScheduler = undefined

		this.connections.forEach((c) => c.Disconnect())

		const forceDespawn = (e: EntityLike) => {
			e.remove(Builtin.Persistent)
			e.despawn()
		}
		query(Builtin.System).forEach(forceDespawn)
		query(Builtin.Plugin).forEach(forceDespawn)
		query(Builtin.Schedule).forEach(forceDespawn)
	}

	private runSchedule(schedule: Schedules): void {
		this.scheduleMap
			.get(schedule)!
			.getSortedSystems()
			.forEach((sys) => {
				const data = sys.get(Builtin.System)!
				if (data.runIfs.every((cond) => cond())) this.runSystem(sys, data)
			})
	}

	private runSystem(sysEntt: Entity, sysData: SystemData): void {
		const start = os.clock()

		setActiveSystemEntity(sysEntt)

		// We use a try-finally block to ensure the active system entity is always cleared, even if the system throws an error.
		try {
			sysData.fn(...sysData.args)
		} finally {
			setActiveSystemEntity(undefined)
		}

		const runtimeMs = (os.clock() - start) * 1000
		sysEntt.set(Builtin.System, {
			...sysData,
			runtimeMs,
		})
	}

	private buildPlugins(): void {
		let pendingPlugins = query(Builtin.Plugin)
			.collect()
			.filter(([, p]) => !p.built)

		const sortUserFirst = (a: EntityLike, b: EntityLike) => {
			const isAThirdParty = a.has(Builtin.ThirdParty)
			const isBThirdParty = b.has(Builtin.ThirdParty)
			return isAThirdParty === isBThirdParty ? false : !isAThirdParty
		}

		const shouldBuild = (
			_incomingEnt: EntityLike,
			_incomingData: InferValue<typeof Builtin.Plugin>,
		): boolean => {
			const _existing = query(Builtin.Plugin)
				.collect()
				.find(([, p]) => p.built === true && p.fn === _incomingData.fn)
			if (!_existing) return true

			const [existingEnt, existingData] = _existing
			// From here on, we know incoming is a duplicate.
			const [duplicateEnt, duplicateData] = [_incomingEnt, _incomingData]

			const existingOrigin = existingEnt.has(Builtin.ThirdParty)
				? 'third-party'
				: existingEnt.has(Builtin.Internal)
					? 'internal'
					: 'user'
			if (existingOrigin === 'internal') {
				error(`Internal plugin duplication found - this should never happen`)
			}
			const duplicateOrigin = duplicateEnt.has(Builtin.ThirdParty)
				? 'third-party'
				: 'user'

			// user <- user: should error, as the user likely forgot they've added the same plugin already.
			// user <- third-party: should skip third-party's registration, as user registration takes precedence.
			// third-party <- user: should never happen, as user plugins are built first.
			// third-party <- third-party:
			//      if arguments are the same: should skip, as the shared plugin would be built the same way by both third-party plugins.
			//      if arguments differ: should error, as the user didn't register the plugin themselves in order to resolve the conflict.
			if (existingOrigin === 'user' && duplicateOrigin === 'user') {
				error(
					`User plugin '${existingEnt}' has already been registered\n\n` +
						`Tip: ensure '${duplicateEnt}' is only registered once`,
				)
			} else if (
				existingOrigin === 'user' &&
				duplicateOrigin === 'third-party'
			) {
				return false
			} else if (
				existingOrigin === 'third-party' &&
				duplicateOrigin === 'user'
			) {
				error(
					`User plugin '${duplicateEnt}' being built after third-party plugin should never happen, as user plugins are meant to be built first`,
				)
			} else if (
				existingOrigin === 'third-party' &&
				duplicateOrigin === 'third-party'
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

		const buildPlugin = (
			e: EntityLike,
			p: InferValue<typeof Builtin.Plugin>,
		) => {
			if (!shouldBuild(e, p)) {
				e.despawn()
				return
			}

			setActivePluginEntity(e as Entity)
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

			pendingPlugins = query(Builtin.Plugin)
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

/**
 * Returns a new {@link Scheduler}, the starting point of a game made with Toucan.
 *
 * It is responsible for running systems, building plugins and configuring system sets.
 *
 * @remarks
 * Only one scheduler can exist at a time. Calling `scheduler()` multiple times will throw an error.
 *
 * @example
 * ```ts
 * const Person = component()
 * const Age = component<number>()
 *
 * function spawnPeople() {
 *     entity('Alice').set(Age, 25)
 *     entity('Bob').set(Age, 30)
 * }
 *
 * const greetPeople = query(Age).with(Person).bind((entity, age) => {
 *     print(`Hello, ${entity}! I can magically sense that you're ${age} years old!`)
 * })
 *
 * scheduler()
 *     .useSystem('startup', spawnPeople)
 *     .useSystem('update', greetPeople)
 *     .run()
 * ```
 *
 * @group Core
 */
export function scheduler(): Scheduler {
	return new Scheduler()
}

/**
 * Fully despawns an existing scheduler, which in turn despawns every system,
 * plugin and schedule, allowing a new scheduler to be created.
 *
 * @remarks
 * This is primarily used for testing - use at your own risk.
 */
export function __despawnScheduler(): void {
	if (!existingScheduler) return

	existingScheduler.__despawn()
}
