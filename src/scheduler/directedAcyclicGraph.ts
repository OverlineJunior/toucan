import { cloneMap } from '../util'

export type AddEdgeResult<T> =
	| { ok: true }
	| { ok: false; reason: 'cycle'; path: T[] }
	| { ok: false; reason: 'undefinedNode'; node: T }

export class DirectedAcyclicGraph<T extends defined> {
	private readonly adjacency = new Map<defined, Set<defined>>()
	private readonly inDegree = new Map<defined, number>()
	private readonly nodeData = new Map<defined, T>()

	public constructor(
		// By default, just returns the node itself (reference equality).
		private readonly getKey: (node: T) => defined = (node) => node,
	) {}

	tryAddNode(node: T): void {
		const key = this.getKey(node)
		if (!this.adjacency.has(key)) {
			this.adjacency.set(key, new Set())
			this.inDegree.set(key, 0)
			this.nodeData.set(key, node)
		}
	}

	addEdge(from: T, to: T): AddEdgeResult<T> {
		if (!this.hasNode(from)) {
			return { ok: false, reason: 'undefinedNode', node: from }
		}
		if (!this.hasNode(to)) {
			return { ok: false, reason: 'undefinedNode', node: to }
		}

		const fromKey = this.getKey(from)
		const toKey = this.getKey(to)

		const neighbors = this.adjacency.get(fromKey)!
		if (!neighbors.has(toKey)) {
			const cyclePath = this.findCyclePath(toKey, fromKey)
			if (cyclePath !== undefined) {
				return {
					ok: false,
					reason: 'cycle',
					path: [from, ...cyclePath.map((key) => this.nodeData.get(key)!)],
				}
			}

			neighbors.add(toKey)
			this.inDegree.set(toKey, this.inDegree.get(toKey)! + 1)
		}

		return { ok: true }
	}

	hasNode(node: T): boolean {
		return this.adjacency.has(this.getKey(node))
	}

	hasEdge(from: T, to: T): boolean {
		return this.adjacency.get(this.getKey(from))?.has(this.getKey(to)) ?? false
	}

	nodes(): T[] {
		const result: T[] = []
		for (const [key] of this.adjacency) {
			result.push(this.nodeData.get(key)!)
		}
		return result
	}

	neighbors(node: T): T[] {
		const result: T[] = []
		const set = this.adjacency.get(this.getKey(node))
		if (set !== undefined) {
			for (const neighborKey of set) {
				result.push(this.nodeData.get(neighborKey)!)
			}
		}
		return result
	}

	sorted(): T[] {
		const inDegree = cloneMap(this.inDegree)
		const queue: defined[] = []
		const result: T[] = []

		for (const [key, degree] of inDegree) {
			if (degree === 0) queue.push(key)
		}

		while (queue.size() > 0) {
			const key = queue.shift()!
			result.push(this.nodeData.get(key)!)

			for (const neighborKey of this.adjacency.get(key)!) {
				const updated = inDegree.get(neighborKey)! - 1
				inDegree.set(neighborKey, updated)
				if (updated === 0) queue.push(neighborKey)
			}
		}

		return result
	}

	private findCyclePath(
		start: defined,
		target: defined,
	): defined[] | undefined {
		const visited = new Set<defined>()
		const stack: Array<{ node: defined; path: defined[] }> = [
			{ node: start, path: [start] },
		]

		while (stack.size() > 0) {
			const { node: current, path } = stack.pop()!
			if (current === target) return path
			if (visited.has(current)) continue
			visited.add(current)

			for (const neighbor of this.adjacency.get(current)!) {
				stack.push({ node: neighbor, path: [...path, neighbor] })
			}
		}

		return undefined
	}
}
