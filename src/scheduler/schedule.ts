import { flatMap, getOrInit } from '../util'
import {
	type AddEdgeResult,
	DirectedAcyclicGraph,
} from './directedAcyclicGraph'
import { isSystemSet, type SetConfig, type SystemSet } from './systemSet'
import type { RunCondition, System, SystemConfig } from './types'

// While a system config is a more user-readable format, a system descriptor
// is a more implementation-specific format for the scheduler to use.
export interface SystemDescriptor {
	system: System
	before: (System | SystemSet)[]
	after: (System | SystemSet)[]
	inSets: SystemSet[]
	runIf: RunCondition[]
}

// Same as SystemDescriptor.
export interface SetDescriptor {
	before: SystemSet[]
	after: SystemSet[]
	runIf: RunCondition[]
}

interface ResolvedSystem {
	system: System
	runIf: RunCondition[]
}

function getSystemName(system: System): string {
	return debug.info(system, 'n')[0] || 'Unlabelled System'
}

function assertAddEdgeResult(res: AddEdgeResult<System>): void {
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
	value?: System | SystemSet | (System | SystemSet)[],
): (System | SystemSet)[] {
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
	private readonly systemDescriptors = new Map<System, SystemDescriptor>()
	private readonly setDescriptors = new Map<SystemSet, SetDescriptor>()
	private sortedCache?: ResolvedSystem[]

	constructor(public readonly name: string) {}

	useSystem(system: System, config?: SystemConfig): this {
		this.sortedCache = undefined
		const desc = getOrInit(this.systemDescriptors, system, () => ({
			system,
			before: [],
			after: [],
			inSets: [],
			runIf: [],
		}))
		normalizeOrderingItems(config?.before).forEach((v) => desc.before.push(v))
		normalizeOrderingItems(config?.after).forEach((v) => desc.after.push(v))
		normalizeSetItems(config?.inSet).forEach((v) => desc.inSets.push(v))
		normalizeConditions(config?.runIf).forEach((v) => desc.runIf.push(v))
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

	useSystemChain(...systems: (System | [System, SystemConfig])[]): this {
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
		const systemsInSet = new Map<SystemSet, System[]>()
		this.systemDescriptors.forEach((desc) => {
			desc.inSets.forEach((set) =>
				getOrInit(systemsInSet, set, () => []).push(desc.system),
			)
		})

		// Step 2: Create a fresh DAG and add all registered systems as nodes.
		const graph = new DirectedAcyclicGraph<System>()
		this.systemDescriptors.forEach((_, system) => graph.tryAddNode(system))

		// Expands a mixed target list into concrete systems.
		const resolveTargets = (targets: (System | SystemSet)[]): System[] =>
			flatMap(targets, (target) =>
				typeIs(target, 'function')
					? [target]
					: (systemsInSet.get(target) ?? []),
			)

		// Step 3: Add system-level ordering edges.
		this.systemDescriptors.forEach((desc) => {
			resolveTargets(desc.before).forEach((t) => {
				assertAddEdgeResult(graph.addEdge(desc.system, t))
			})
			resolveTargets(desc.after).forEach((t) =>
				assertAddEdgeResult(graph.addEdge(t, desc.system)),
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
		this.sortedCache = graph.sorted().map((system) => {
			const desc = this.systemDescriptors.get(system)
			const setRunIfs = flatMap(
				desc?.inSets ?? [],
				(set) => this.setDescriptors.get(set)?.runIf ?? [],
			)
			return { system, runIf: [...(desc?.runIf ?? []), ...setRunIfs] }
		})

		return this.sortedCache
	}
}
