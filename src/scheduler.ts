import * as Planck from '@rbxts/planck'
import { RunService } from '@rbxts/services'
import {
	ABSOLUTE_FIRST,
	POST_SIMULATION,
	PRE_ANIMATION,
	PRE_RENDER,
	PRE_SIMULATION,
	STARTUP_PIPELINE,
	UPDATE_PIPELINE,
} from './std/phases'
import { ChildOf, entity, EntityHandle, Internal, Label, Plugin, System, External } from './id'
import { query } from './query'
import { deepEqual } from './util'
import { pair } from './pair'
import { STANDARD_PLUGINS } from './std/plugins'

export type System<Args extends defined[]> = (...args: Args) => void
export type Plugin<Args extends defined[]> = (scheduler: Scheduler, ...args: Args) => void

function isInternal(): boolean {
	const callerScriptPath = debug.info(2, 's')[0]
	return callerScriptPath.match('node_modules.@rbxts.toucan')[0] !== undefined
}

function isExternal(): boolean {
	const callerScriptPath = debug.info(2, 's')[0]
	return callerScriptPath.match('node_modules')[0] !== undefined
}

function findPluginInCallStack(): EntityHandle | undefined {
	function hasBuildInCallStack(build: Callback): boolean {
		let depth = 2
		while (true) {
			const f = debug.info(depth, 'f')[0]
			if (f === undefined) {
				return false
			} else if (f === build) {
				return true
			}
			depth++
		}
	}

	return query(Plugin).find((_, p) => hasBuildInCallStack(p.build))?.[0] as EntityHandle | undefined
}

function validatePluginConflict(
	existing: EntityHandle,
	build: (...args: any[]) => void,
	newArgs: defined[],
	incomingParent: EntityHandle | undefined,
	inferredName: string,
) {
	// If the plugin takes no extra arguments, there can't be a conflict.
	const argCount = debug.info(build, 'a')[0]!
	if (argCount === 1) return

	const existingParent = existing.parent()
	const isIncomingExternal = incomingParent !== undefined && incomingParent.has(External)
	const isExistingExternal = existingParent !== undefined && existingParent.has(External)

	// We can safely ignore this case, as user-defined plugins take precedence.
	if (!isExistingExternal && isIncomingExternal) {
		return
	}

	// Both plugins being initialized with the same arguments is not a conflict.
	const existingArgs = existing.get(Plugin)!.args
	if (deepEqual(existingArgs, newArgs)) {
		return
	}

	const existingSource = isExistingExternal
		? `external plugin '${existingParent!.label() ?? 'Unknown'}'`
		: 'user code'

	const incomingSource = isIncomingExternal
		? `external plugin '${incomingParent!.label() ?? 'Unknown'}'`
		: 'user code'

	const fix = isExistingExternal
		? `Initialize '${inferredName}' manually in your codebase to establish a single source of truth.`
		: `Ensure '${inferredName}' is only initialized once in your codebase.`

	error(
		`\nPlugin Conflict: '${inferredName}' was initialized multiple times with different parameters, ` +
			`so Toucan cannot determine which configuration to use.\n` +
			`    1. Already registered by ${existingSource} with [${existingArgs.join(', ')}]\n` +
			`    2. Attempted register by ${incomingSource} with [${newArgs.join(', ')}]\n` +
			`Fix: ${fix}`,
	)
}

function spawnSystem<Args extends defined[]>(callback: System<Args>, phase: Planck.Phase, args?: Args): EntityHandle {
	const handle = entity()
	const inferredName = debug.info(callback, 'n')[0]!

	handle
		.set(System, {
			callback: callback as (...args: defined[]) => void,
			phase,
			args: args ?? [],
			scheduled: false,
			lastDeltaTime: 0,
		})
		.set(Label, inferredName === '' ? `System #${handle.id}` : inferredName)

	if (isInternal()) {
		handle.set(Internal)
	} else if (isExternal()) {
		handle.set(External)
	}

	const parentPlugin = findPluginInCallStack()
	if (parentPlugin) {
		handle.set(pair(ChildOf, parentPlugin))
	}

	return handle
}

function spawnPlugin<Args extends defined[]>(build: Plugin<Args>, ...args: Args): EntityHandle {
	const inferredName = debug.info(build, 'n')[0]!
	const parentPlugin = findPluginInCallStack()

	const existing = query(Plugin).find((_, p) => p.build === build)?.[0] as EntityHandle | undefined
	if (existing) {
		validatePluginConflict(existing, build, args, parentPlugin, inferredName)
		return new EntityHandle(existing.id)
	}

	const handle = entity()

	handle
		.set(Plugin, { build: build as Plugin<defined[]>, built: false, args })
		.set(Label, inferredName === '' ? `Plugin #${handle.id}` : inferredName)

	if (isInternal()) {
		handle.set(Internal)
	} else if (isExternal()) {
		handle.set(External)
	}

	if (parentPlugin) {
		handle.set(pair(ChildOf, parentPlugin))
	}

	return handle
}

export class Scheduler {
	useSystem<Args extends defined[]>(system: System<Args>, phase: Planck.Phase, ...args: Args): this {
		spawnSystem(system, phase, args)
		return this
	}

	usePlugin<Args extends defined[]>(plugin: Plugin<Args>, ...args: Args): this {
		spawnPlugin(plugin, ...args)
		return this
	}

	run(): this {
		const scheduler = new Planck.Scheduler()
			.insert(STARTUP_PIPELINE)
			.insert(UPDATE_PIPELINE, RunService, 'Heartbeat')
			.insert(PRE_RENDER, RunService, 'PreRender')
			.insert(PRE_ANIMATION, RunService, 'PreAnimation')
			.insert(PRE_SIMULATION, RunService, 'PreSimulation')
			.insert(POST_SIMULATION, RunService, 'PostSimulation')

		const buildPlugins = () => {
			query(Plugin)
				.collect()
				.filter(([, p]) => !p.built)
				.sort(([p1], [p2]) => {
					const a = p1.has(External)
					const b = p2.has(External)
					return a === b ? false : !a
				})
				.forEach(([, p]) => {
					p.built = true
					p.build(this, ...p.args)
				})
		}

		function scheduleSystems() {
			query(System)
				.filter((_, system) => !system.scheduled)
				.forEach((e, system) => {
					const wrappedCallback = () => {
						debug.profilebegin(e.label())
						const t = os.clock()

						system.callback(...system.args)

						debug.profileend()
						system.lastDeltaTime = os.clock() - t
					}

					system.scheduled = true
					scheduler.addSystem(wrappedCallback, system.phase)
				})
		}

		// TODO! Consider if we should guarantee plugin building before system scheduling.
		this.useSystem(buildPlugins, ABSOLUTE_FIRST)
		this.useSystem(scheduleSystems, ABSOLUTE_FIRST)

		STANDARD_PLUGINS.forEach((plugin) => this.usePlugin(plugin))

		// Bootstrap the scheduler to run all systems.
		scheduleSystems()

		scheduler.runAll()

		return this
	}
}

export function scheduler() {
	return new Scheduler()
}
