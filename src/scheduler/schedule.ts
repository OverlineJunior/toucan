import {
	component,
	type EntityHandle,
	entity,
	Internal,
	Persistent,
} from '../handle'
import { pair } from '../pair'
import { query } from '../query'
import { flatMap, getOrInit, normalizeToArray } from '../util'
import {
	type AddEdgeResult,
	DirectedAcyclicGraph,
} from './directedAcyclicGraph'
import type { Schedules } from './scheduler'
import {
	type NormalizedSetConfig,
	normalizeSetConfig,
	normalizeSystemConfig,
	type RunCondition,
	type SetConfig,
	type SystemFn,
	type SystemSet,
} from './system'

export interface SystemConfig {
	before?: SystemFn | SystemSet | (SystemFn | SystemSet)[]
	after?: SystemFn | SystemSet | (SystemFn | SystemSet)[]
	inSet?: SystemSet | SystemSet[]
	runIf?: RunCondition | RunCondition[]
}

export interface NormalizedSystemConfig {
	before: (SystemSet | SystemFn)[]
	after: (SystemSet | SystemFn)[]
	inSets: SystemSet[]
	runIfs: RunCondition[]
}

interface ResolvedSystem {
	systemFn: SystemFn
	runIf: RunCondition[]
}

export const System = component<{
	fn: SystemFn
	schedule: Schedules
	before: (SystemFn | SystemSet)[]
	after: (SystemFn | SystemSet)[]
	runIfs: RunCondition[]
	// System sets are ephemeral information for the scheduler - they all get reduced into systems at runtime.
	/** @internal */
	_inSets: SystemSet[]
}>('System')
	.set(Internal)
	.set(Persistent)

export const ScheduleComponent = component<{ kind: Schedules }>('Schedule')
	.set(Internal)
	.set(Persistent)

export const InSchedule = component('InSchedule').set(Internal).set(Persistent)

function getSystemName(system: SystemFn): string {
	return debug.info(system, 'n')[0] || 'Unlabelled System'
}

function assertAddEdgeResult(res: AddEdgeResult<SystemFn>): void {
	if (res.ok) return
	if (res.reason === 'cycle') {
		const cycleStr = res.path.map(getSystemName).join(' -> ')
		error(
			`Cycle detected when scheduling systems: ${cycleStr}\n\n` +
				`Tip: check your system dependencies. If they inherently depend on each other, consider combining them or splitting one into 'pre' and 'post' systems`,
		)
	} else if (res.reason === 'undefinedNode') {
		error(
			`System '${getSystemName(res.node)}' is referenced as a dependency, but hasn't been scheduled\n\n` +
				`Tip: schedule the system with 'Scheduler.useSystem()'`,
		)
	} else {
		error('Unreachable')
	}
}

export class Schedule {
	public readonly name: Schedules
	private readonly entity: EntityHandle
	private readonly setConfigs = new Map<SystemSet, NormalizedSetConfig>()
	private sortedCache?: ResolvedSystem[]

	constructor(name: Schedules) {
		this.name = name
		this.entity = entity(`${name}Schedule`)
			.set(ScheduleComponent, { kind: name })
			.set(Internal)
			.set(Persistent)
	}

	useSystem(systemFn: SystemFn, config?: SystemConfig): this {
		const existing = query(System).find((_e, sys) => sys.fn === systemFn)
		if (existing !== undefined) {
			error(
				`System '${getSystemName(systemFn)}' has already registered in schedule '${this.name}'`,
			)
		}

		const { before, after, runIfs, inSets } = normalizeSystemConfig(config)
		entity(getSystemName(systemFn))
			.set(System, {
				fn: systemFn,
				schedule: this.name,
				before,
				after,
				runIfs,
				_inSets: inSets,
			})
			.set(pair(InSchedule, this.entity))

		return this
	}

	configureSet(set: SystemSet, config: SetConfig): this {
		this.sortedCache = undefined

		const entry = getOrInit(this.setConfigs, set, () => ({
			before: [],
			after: [],
			runIf: [],
		}))

		const normalized = normalizeSetConfig(config)
		normalized.before.forEach((v) => entry.before.push(v))
		normalized.after.forEach((v) => entry.after.push(v))
		normalized.runIf.forEach((v) => entry.runIf.push(v))

		return this
	}

	useSystemChain(...systems: (SystemFn | [SystemFn, SystemConfig])[]): this {
		for (let i = 0; i <= systems.size() - 2; i++) {
			const a = systems[i]
			const b = systems[i + 1]
			const aIsFn = typeIs(a, 'function')
			const bSys = typeIs(b, 'function') ? b : b[0]

			if (aIsFn) {
				this.useSystem(a, { before: bSys })
			} else {
				this.useSystem(a[0], {
					...a[1],
					before: [bSys, ...normalizeToArray(a[1].before)],
				})
			}
		}

		// Always register the last element so it is present in the descriptor map.
		// This also covers the edge case of a single-element chain.
		const last = systems[systems.size() - 1]
		if (typeIs(last, 'function')) {
			this.useSystem(last)
		} else {
			this.useSystem(last[0], last[1])
		}

		return this
	}

	getSortedSystems(): ResolvedSystem[] {
		if (this.sortedCache !== undefined) return this.sortedCache

		// Step 1: Group systems by their set membership.
		const systemsInSet = new Map<SystemSet, SystemFn[]>()
		query(System, pair(InSchedule, this.entity)).forEach((_e, sys) => {
			sys._inSets.forEach((set) =>
				getOrInit(systemsInSet, set, () => []).push(sys.fn),
			)
		})

		// Step 2: Create a fresh DAG and add all registered systems as nodes.
		const graph = new DirectedAcyclicGraph<SystemFn>()
		query(System, pair(InSchedule, this.entity)).forEach((_e, sys) =>
			graph.tryAddNode(sys.fn),
		)

		// Expands a mixed target list into concrete systems.
		const resolveTargets = (targets: (SystemFn | SystemSet)[]): SystemFn[] =>
			flatMap(targets, (target) =>
				typeIs(target, 'function')
					? [target]
					: (systemsInSet.get(target) ?? []),
			)

		// Step 3: Add system-level ordering edges.
		query(System, pair(InSchedule, this.entity)).forEach((_e, sys) => {
			resolveTargets(sys.before).forEach((t) => {
				assertAddEdgeResult(graph.addEdge(sys.fn, t))
			})
			resolveTargets(sys.after).forEach((t) =>
				assertAddEdgeResult(graph.addEdge(t, sys.fn)),
			)
		})

		const addEdgesBetweenSets = (fromSet: SystemSet, toSet: SystemSet) => {
			const from = systemsInSet.get(fromSet) ?? []
			const to = systemsInSet.get(toSet) ?? []
			from.forEach((a) =>
				to.forEach((b) => assertAddEdgeResult(graph.addEdge(a, b))),
			)
		}

		// Step 4: Expand set-level ordering into system-to-system edges.
		this.setConfigs.forEach((desc, thisSet) => {
			desc.before.forEach((befSet) => addEdgesBetweenSets(thisSet, befSet))
			desc.after.forEach((aftSet) => addEdgesBetweenSets(aftSet, thisSet))
		})

		// Steps 5-6: Topological sort, then merge each system's own run conditions
		// with those inherited from every set it belongs to.
		this.sortedCache = graph.sorted().map((systemFn) => {
			const [_e, system] = query(System).find((_e, s) => s.fn === systemFn)!
			const setRunIfs = flatMap(
				system._inSets,
				(set) => this.setConfigs.get(set)?.runIf ?? [],
			)
			return { systemFn, runIf: [...system.runIfs, ...setRunIfs] }
		})

		return this.sortedCache
	}
}
