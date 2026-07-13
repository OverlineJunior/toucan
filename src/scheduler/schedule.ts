import {
	ChildOf,
	component,
	type EntityHandle,
	entity,
	Internal,
	Label,
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
	inferSystemName,
	type NormalizedSetConfig,
	normalizeSetConfig,
	normalizeSystemConfig,
	type SetConfig,
	System,
	type SystemConfig,
	type SystemData,
	type SystemFn,
	type SystemSet,
} from './system'

/**
 * Built-in component used to distinguish entities that represent schedules.
 *
 * @group Built-ins
 */
export const ScheduleComponent = component<{ kind: Schedules }>('Schedule')
	.set(Internal)
	.set(Persistent)

function assertAddEdgeResult(res: AddEdgeResult<SystemFn>): void {
	if (res.ok) return
	if (res.reason === 'cycle') {
		const cycleStr = res.path.map((fn) => inferSystemName(fn)).join(' -> ')
		error(
			`Cycle detected when scheduling systems: ${cycleStr}\n\n` +
				`Tip: check your system dependencies. If they inherently depend on each other, consider combining them or splitting one into 'pre' and 'post' systems`,
		)
	} else if (res.reason === 'undefinedNode') {
		error(
			`System '${inferSystemName(res.node)}' is referenced as a dependency, but hasn't been scheduled\n\n` +
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
	private sortedCache?: SystemData[]

	constructor(name: Schedules) {
		this.name = name
		this.entity = entity(`${name}Schedule`)
			.set(ScheduleComponent, { kind: name })
			.set(Internal)
			.set(Persistent)
	}

	useSystem(systemFn: SystemFn, config?: SystemConfig): this {
		this.sortedCache = undefined

		const existing = query(System).find((_e, sys) => sys.fn === systemFn)
		if (existing !== undefined) {
			error(
				`System '${config?.label ?? systemFn}' has already registered in schedule '${this.name}'`,
			)
		}

		const { label, args, before, after, runIfs, inSets } =
			normalizeSystemConfig(config)

		const systemEntity = entity()
		systemEntity
			.set(System, {
				fn: systemFn,
				args,
				schedule: this.name,
				before,
				after,
				runIfs,
				_inSets: inSets,
			})
			.set(Label, label ?? inferSystemName(systemFn, systemEntity))
			.set(pair(ChildOf, this.entity))

		return this
	}

	configureSet(set: SystemSet, config: SetConfig): this {
		this.sortedCache = undefined

		const existing = this.setConfigs.get(set)
		if (existing !== undefined) {
			error(
				`Set '${set.name}' has already been configured in schedule '${this.name}'`,
			)
		}

		const { before, after, runIf } = normalizeSetConfig(config)
		this.setConfigs.set(set, { before, after, runIf })

		return this
	}

	useSystemChain(systems: (SystemFn | [SystemFn, SystemConfig])[]): this {
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

	getSortedSystems(): SystemData[] {
		if (this.sortedCache !== undefined) return this.sortedCache

		// Step 1: Group systems by their set membership.
		const systemsInSet = new Map<SystemSet, SystemFn[]>()
		query(System, pair(ChildOf, this.entity)).forEach((_e, sys) => {
			sys._inSets.forEach((set) =>
				getOrInit(systemsInSet, set, () => []).push(sys.fn),
			)
		})

		// Step 2: Create a fresh DAG and add all registered systems as nodes.
		const graph = new DirectedAcyclicGraph<SystemFn>()
		query(System, pair(ChildOf, this.entity)).forEach((_e, sys) =>
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
		query(System, pair(ChildOf, this.entity)).forEach((_e, sys) => {
			resolveTargets(sys.before).forEach((t) => {
				assertAddEdgeResult(graph.addEdge(sys.fn, t))
			})
			resolveTargets(sys.after).forEach((t) =>
				assertAddEdgeResult(graph.addEdge(t, sys.fn)),
			)
		})

		// Step 4: Expand set-level ordering into system-to-system edges.
		this.setConfigs.forEach((cfg, thisSet) => {
			const setMembers = systemsInSet.get(thisSet) ?? []

			resolveTargets(cfg.before).forEach((toSystem) =>
				setMembers.forEach((fromSystem) =>
					assertAddEdgeResult(graph.addEdge(fromSystem, toSystem)),
				),
			)

			resolveTargets(cfg.after).forEach((afterSystem) =>
				setMembers.forEach((fromSystem) =>
					assertAddEdgeResult(graph.addEdge(afterSystem, fromSystem)),
				),
			)
		})

		// Steps 5-6: Topological sort, then merge each system's own run conditions
		// with those inherited from every set it belongs to.
		this.sortedCache = graph.sorted().map((systemFn) => {
			const [sysEnt, sysData] = query(System).find(
				(_e, s) => s.fn === systemFn,
			)!

			const setRunIfs = flatMap(
				sysData._inSets,
				(set) => this.setConfigs.get(set)?.runIf ?? [],
			)
			const newData = {
				...sysData,
				runIfs: [...sysData.runIfs, ...setRunIfs],
			}
			sysEnt.set(System, newData)

			return newData
		})

		return this.sortedCache
	}
}
