import {
	type AddEdgeResult,
	DirectedAcyclicGraph,
} from './directedAcyclicGraph'
import type { System, SystemConfig } from './types'

function getSystemName(system: System): string {
	const inferred = debug.info(system, 'n')[0]!
	return inferred === '' ? 'Unlabelled System' : inferred
}

function assertAddEdgeResult(res: AddEdgeResult<System>): void {
	if (res.ok) return

	if (res.reason === 'cycle') {
		const cycleStr = res.path.map((s) => getSystemName(s)).join(' -> ')
		error(`Cycle detected when scheduling systems: ${cycleStr}`)
	}
}

export class Schedule {
	private readonly graph = new DirectedAcyclicGraph<System>()

	constructor(public readonly name: string) {}

	useSystem(system: System, config?: SystemConfig): this {
		this.graph.addNode(system)

		if (config?.before) {
			if (typeIs(config.before, 'function')) {
				assertAddEdgeResult(this.graph.addEdge(system, config.before))
			} else {
				config.before.forEach((bef) =>
					assertAddEdgeResult(this.graph.addEdge(system, bef)),
				)
			}
		}

		if (config?.after) {
			if (typeIs(config.after, 'function')) {
				assertAddEdgeResult(this.graph.addEdge(config.after, system))
			} else {
				config.after.forEach((aft) =>
					assertAddEdgeResult(this.graph.addEdge(aft, system)),
				)
			}
		}

		if (config?.inSet) {
			error('inSet not yet implemented')
		}

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
				// The current system must run before the next, plus before what
				// its config says - `a.before = b ∪ a.config.before`.
				const union = a[1].before
					? typeIs(a[1].before, 'function')
						? [bSys, a[1].before]
						: [bSys, ...a[1].before]
					: bSys

				this.useSystem(a[0], { ...a[1], before: union })
			}
		}

		// Makes sure we also use last's config, if it exists.
		const last = systems[systems.size() - 1]
		if (!typeIs(last, 'function')) {
			this.useSystem(last[0], last[1])
		}

		return this
	}

	getSortedSystems(): System[] {
		return this.graph.sorted()
	}

	debug() {
		print(
			this.graph
				.sorted()
				.map((fn) => debug.info(fn, 'n')[0]!)
				.join(' -> '),
		)
	}
}
