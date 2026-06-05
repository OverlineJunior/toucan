import {
	component,
	type EntityHandle,
	entity,
	Internal,
	Persistent,
} from '../handle'
import { pair } from '../pair'
import { query } from '../query'
import { flatMap, getOrInit } from '../util'
import {
	type AddEdgeResult,
	DirectedAcyclicGraph,
} from './directedAcyclicGraph'
import { isSystemSet, type SetConfig, type SystemSet } from './systemSet'
import type { RunCondition, Schedules, SystemConfig, SystemFn } from './types'

// While `SetConfig` is a more user-readable format, `SetDescriptor`
// is a more implementation-specific format for the scheduler to use.
export interface SetDescriptor {
	before: SystemSet[]
	after: SystemSet[]
	runIf: RunCondition[]
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

function normalizeOrderingItems(
	value?: SystemFn | SystemSet | (SystemFn | SystemSet)[],
): (SystemFn | SystemSet)[] {
	if (value === undefined) return []
	if (typeIs(value, 'function') || isSystemSet(value)) return [value]
	return value
}
function normalizeSetItems(value?: SystemSet | SystemSet[]): SystemSet[] {
	if (value === undefined) return []
	if (isSystemSet(value)) return [value]
	return value
}
function normalizeConditions(
	value?: RunCondition | RunCondition[],
): RunCondition[] {
	if (value === undefined) return []
	if (typeIs(value, 'function')) return [value]
	return value
}

export class Schedule {
	public readonly name: Schedules
	private readonly entity: EntityHandle
	private readonly setDescriptors = new Map<SystemSet, SetDescriptor>()
	private sortedCache?: ResolvedSystem[]

	constructor(name: Schedules) {
		this.name = name
		this.entity = entity(`${name}Schedule`)
			.set(ScheduleComponent, { kind: name })
			.set(Internal)
			.set(Persistent)
	}

	useSystem(systemFn: SystemFn, config?: SystemConfig): this {
		const normalizedBefore = normalizeOrderingItems(config?.before)
		const normalizedAfter = normalizeOrderingItems(config?.after)
		const normalizedRunIfs = normalizeConditions(config?.runIf)
		const normalizedInSets = normalizeSetItems(config?.inSet)

		const [prevSysEntity, prevSysData] = query(System).find(
			(_e, sys) => sys.fn === systemFn,
		) ?? [undefined, undefined]

		if (prevSysEntity === undefined) {
			entity(getSystemName(systemFn))
				.set(System, {
					fn: systemFn,
					schedule: this.name,
					before: normalizedBefore,
					after: normalizedAfter,
					runIfs: normalizedRunIfs,
					_inSets: normalizedInSets,
				})
				.set(pair(InSchedule, this.entity))
		} else {
			prevSysEntity.set(System, {
				fn: systemFn,
				schedule: this.name,
				before: [...prevSysData.before, ...normalizedBefore],
				after: [...prevSysData.after, ...normalizedAfter],
				runIfs: [...prevSysData.runIfs, ...normalizedRunIfs],
				_inSets: [...prevSysData._inSets, ...normalizedInSets],
			})
		}

		return this
	}

	configureSet(set: SystemSet, config: SetConfig): this {
		this.sortedCache = undefined
		const desc = getOrInit(this.setDescriptors, set, () => ({
			before: [],
			after: [],
			runIf: [],
		}))
		normalizeSetItems(config.before).forEach((v) => desc.before.push(v))
		normalizeSetItems(config.after).forEach((v) => desc.after.push(v))
		normalizeConditions(config.runIf).forEach((v) => desc.runIf.push(v))
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
					before: [bSys, ...normalizeOrderingItems(a[1].before)],
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
		this.setDescriptors.forEach((desc, thisSet) => {
			desc.before.forEach((befSet) => addEdgesBetweenSets(thisSet, befSet))
			desc.after.forEach((aftSet) => addEdgesBetweenSets(aftSet, thisSet))
		})

		// Steps 5-6: Topological sort, then merge each system's own run conditions
		// with those inherited from every set it belongs to.
		this.sortedCache = graph.sorted().map((systemFn) => {
			const [_e, system] = query(System).find((_e, s) => s.fn === systemFn)!
			const setRunIfs = flatMap(
				system._inSets,
				(set) => this.setDescriptors.get(set)?.runIf ?? [],
			)
			return { systemFn, runIf: [...system.runIfs, ...setRunIfs] }
		})

		return this.sortedCache
	}
}
