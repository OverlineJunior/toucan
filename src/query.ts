import { Component } from './entity/component'
import { ComponentOrPair, Entity, InferValues } from './entity'
import { UpToEight } from './util'
import { world } from './world'
import { Entity as RawEntity, Query as RawQuery } from '@rbxts/jecs'

export type QueryResult<Cs extends UpToEight<ComponentOrPair> | []> = [Entity, ...InferValues<Cs>]

// We use the Flyweight pattern here to avoid creating a new Entity instance for
// every entity in a query, almost doubling performance.
//
// This does come with the caveat of the user having to `collect` if they want
// to retain references to entities outside of the scope of the query iteration.
class ReusableEntity extends Entity {
	constructor(public id: RawEntity = -1 as RawEntity) {
		super(id)
	}
}

const sharedEntity = new ReusableEntity()

export class Query<Cs extends UpToEight<ComponentOrPair> | []> {
	private readonly isEmpty: boolean
	private readonly rawQuery: RawQuery<RawEntity[]>
	private readonly filters: ((entity: Entity, ...components: InferValues<Cs>) => boolean)[] = []
	private readonly excludedIds: RawEntity[] = []

	constructor(...components: Cs) {
		this.isEmpty = components.size() === 0
		this.rawQuery = world.query(...components.map((c) => (c as Component).id))
	}

	/**
	 * Excludes _entities_ with the specified _components_ from the _query_ results.
	 */
	without(...components: Component[]): Query<Cs> {
		components.forEach((c) => this.excludedIds.push(c.id))
		return this
	}

	/**
	 * Adds a filter predicate to the _query_ that _entities_ must satisfy in order
	 * to be included in the results.
	 */
	filter(predicate: (entity: Entity, ...components: InferValues<Cs>) => boolean): Query<Cs> {
		this.filters.push(predicate)
		return this
	}

	/**
	 * Iterates over each _entity_ in the _query_, calling the provided `callback`
	 * with the _entity_ and its corresponding _component_ values.
	 */
	forEach(callback: (entity: Entity, ...componentValues: InferValues<Cs>) => void): void {
		const fn = callback as unknown as (e: Entity, ...args: unknown[]) => void
		const filters = this.filters as unknown as ((e: Entity, ...args: unknown[]) => boolean)[]
		const hasFilters = filters.size() > 0

		// Empty queries are a special case where we want all entities.
		if (this.isEmpty) {
			world.entity_index.dense_array.forEach((e) => {
				sharedEntity.id = e

				if (hasFilters && !this.useFilters(sharedEntity)) {
					return
				}

				fn(sharedEntity)
			})

			return
		}

		// Roblox-TS won't allow spreading tuples from iterators, so we have to do it manually.
		for (const [e, v1, v2, v3, v4, v5, v6, v7, v8] of this.rawQuery.without(...this.excludedIds)) {
			sharedEntity.id = e

			if (hasFilters && !this.useFilters(sharedEntity, v1, v2, v3, v4, v5, v6, v7, v8)) {
				continue
			}

			fn(sharedEntity, v1, v2, v3, v4, v5, v6, v7, v8)
		}
	}

	/**
	 * Maps each _entity_ in the _query_ to a new value using the provided
	 * `mapper` function, returning an array of the resulting values.
	 *
	 * # Warning
	 *
	 * This method allocates memory for all _entities_ in the _query_ and should be
	 * used sparingly in performance-critical code.
	 */
	map<R extends defined>(mapper: (entity: Entity, ...componentValues: InferValues<Cs>) => R): R[] {
		const results: R[] = []

		this.forEach((e, ...components) => {
			results.push(mapper(e, ...components))
		})

		return results
	}

	/**
	 * Reduces the _entities_ in the _query_ to a single value using the provided
	 * `reducer` function and `initialValue`.
	 */
	reduce<R>(reducer: (accumulator: R, entity: Entity, ...componentValues: InferValues<Cs>) => R, initialValue: R): R {
		let accumulator = initialValue

		this.forEach((e, ...components) => {
			accumulator = reducer(accumulator, e, ...components)
		})

		return accumulator
	}

	// We duplicate a lot of code from `forEach` here so can early exit, resulting in great performance improvements.
	/**
	 * Finds the first _entity_ in the _query_ that satisfies the provided
	 * `predicate` function, returning the _entity_ and its corresponding
	 * _component_ values, or `undefined` if no such _entity_ exists.
	 */
	find(predicate: (entity: Entity, ...componentValues: InferValues<Cs>) => boolean): QueryResult<Cs> | undefined {
		const filters = this.filters as unknown as ((e: Entity, ...args: unknown[]) => boolean)[]
		const pred = predicate as unknown as (e: Entity, ...args: unknown[]) => boolean
		const hasFilters = filters.size() > 0

		if (this.isEmpty) {
			for (const e of world.entity_index.dense_array) {
				sharedEntity.id = e

				if (hasFilters && !this.useFilters(sharedEntity)) {
					continue
				}

				if (pred(sharedEntity)) {
					return [new Entity(sharedEntity.id)] as unknown as QueryResult<Cs>
				}
			}

			return undefined
		}

		for (const [e, v1, v2, v3, v4, v5, v6, v7, v8] of this.rawQuery.without(...this.excludedIds)) {
			sharedEntity.id = e

			if (hasFilters && !this.useFilters(sharedEntity, v1, v2, v3, v4, v5, v6, v7, v8)) {
				continue
			}

			if (pred(sharedEntity, v1, v2, v3, v4, v5, v6, v7, v8)) {
				return [new Entity(sharedEntity.id), v1, v2, v3, v4, v5, v6, v7, v8] as unknown as QueryResult<Cs>
			}
		}
	}

	/**
	 * Collects all _entities_ in the _query_, returning an array of the _entities_
	 * and their corresponding _component_ values.
	 *
	 * # Warning
	 *
	 * This method allocates memory for all _entities_ in the _query_ and should be
	 * used sparingly in performance-critical code.
	 */
	collect(): QueryResult<Cs>[] {
		const results: [Entity, ...unknown[]][] = []

		this.forEach((e, ...components) => {
			results.push([new Entity((e as ReusableEntity).id), ...components])
		})

		return results as QueryResult<Cs>[]
	}

	private useFilters(
		e: Entity,
		v1?: unknown,
		v2?: unknown,
		v3?: unknown,
		v4?: unknown,
		v5?: unknown,
		v6?: unknown,
		v7?: unknown,
		v8?: unknown,
	): boolean {
		const filters = this.filters as unknown as ((e: Entity, ...args: unknown[]) => boolean)[]

		let passed = true
		for (const filter of filters) {
			if (!filter(e, v1, v2, v3, v4, v5, v6, v7, v8)) {
				passed = false
				break
			}
		}

		return passed
	}
}

/**
 * Creates a new _query_ for _entities_ that have all of the specified
 * _components_ or relationship _pairs_.
 *
 * Special cases:
 * - Queries with no _components_ will match all _entities_;
 * - The `Wildcard` standard component can be used in queries with relationship
 * _pairs_ to match any `relation` or `target`.
 *
 * # Example
 *
 * ```ts
 * // Query for entities with Position and Velocity components.
 * const Position = component<Vector3>()
 * const Velocity = component<Vector3>()
 * query(Position, Velocity).forEach((entity, pos, vel) => { ... })
 *
 * // Query for all entities.
 * query().forEach((entity) => { ... })
 *
 * // Query for entities that like `car`.
 * const Likes = component()
 * const car = entity()
 * query(pair(Likes, car)).forEach((entity) => { ... })
 *
 * // Query for entities that like anything.
 * query(pair(Likes, Wildcard)).forEach((entity) => { ... })
 * ```
 */
export function query<Cs extends UpToEight<ComponentOrPair> | []>(...components: Cs): Query<Cs> {
	return new Query<Cs>(...components)
}
