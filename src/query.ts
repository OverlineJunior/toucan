import { Handle, RawId, InferValues, resolveId, ComponentHandle, component, Wildcard } from './handle'
import { Pair } from './pair'
import { System } from './scheduler'
import { ZeroUpToEight } from './util'
import { world } from './world'
import * as jecs from '@rbxts/jecs'

export type QueryResult<Cs extends (ComponentHandle | Pair)[]> = [Handle, ...InferValues<Cs>]

export const Previous = component('Previous')
export const Observed = component('Observed')

export class Query<Cs extends (ComponentHandle | Pair)[]> {
	private readonly requiredIds: RawId[]
	private readonly includedIds: RawId[] = []
	private readonly excludedIds: RawId[] = []
	private readonly filters: ((entity: Handle, ...components: InferValues<Cs>) => boolean)[] = []

	constructor(...components: Cs) {
		this.requiredIds = components.map((c) => c.id)
	}

	/**
	 * Includes only entities with _all_ of the specified components in the query's results.
	 *
	 * Does not append the values of these components to the results.
	 */
	with(...components: (ComponentHandle | Pair)[]): Query<Cs> {
		components.forEach((c) => this.includedIds.push(c.id))
		return this
	}

	/**
	 * Includes entities with _any_ of the specified components in the query's results.
	 *
	 * Does not append the values of these components to the results.
	 */
	withAny(...components: (ComponentHandle | Pair)[]): Query<Cs> {
		this.filters.push((e, ..._args) => components.some((c) => e.has(c)))
		return this
	}

	/**
	 * Excludes entities with _all_ of the specified components from the query's results.
	 */
	without(...components: (ComponentHandle | Pair)[]): Query<Cs> {
		components.forEach((c) => this.excludedIds.push(c.id))
		return this
	}

	/**
	 * Excludes entities with _any_ of the specified components from the query's results.
	 */
	withoutAny(...components: (ComponentHandle | Pair)[]): Query<Cs> {
		this.filters.push((e, ..._args) => components.every((c) => !e.has(c)))
		return this
	}

	/**
	 * Adds a filter predicate to the _query_ that _entities_ must satisfy in order
	 * to be included in the results.
	 */
	filter(predicate: (entity: Handle, ...components: InferValues<Cs>) => boolean): Query<Cs> {
		this.filters.push(predicate)
		return this
	}

	/*
	TODO! The way observers are currently implemented, the example below won't trigger them:
	```ts
	function cleanupModel() {
		query().removed(Model).forEach((e, model) => {
			model.Destroy()
		})
	}

	entity.set(Model, makeModel())
	entity.remove(Model)

	scheduler().useSystem(cleanupModel, UPDATE).run()
	```
	! To fix this, we could try...
	! 1. Mixing our observerPlugin with Jecs's world observers;
	! 2. Scrapping our observerPlugin, but still using Previous in the set methods & related, and then using Jecs's
	!    observers normally, but checking for Previous.
	*/
	/**
	 * Queries for _ids_ that have had `component` added since the last frame,
	 * with its value appended to the _query_'s results.
	 *
	 * # Example
	 *
	 * ```ts
	 * function unitSelectionSound() {
	 *     query(Unit).added(Selected).forEach((unitId) => {
	 *         // Play sound effect.
	 *     })
	 * }
	 * ```
	 */
	added<C extends ComponentHandle>(component: C): Query<[...Cs, C]> {
		const prevPair = jecs.pair(Previous.id, component.id)
		this.requiredIds.push(component.id)
		this.excludedIds.push(prevPair as unknown as RawId)

		component.set(Observed)

		return this as unknown as Query<[...Cs, C]>
	}

	// TODO! Not firing when the entity with `component` is despawned.
	/**
	 * Queries for _ids_ that have had `component` removed since the last frame,
	 * with its previous value appended to the _query_'s results.
	 *
	 * # Example
	 *
	 * ```ts
	 * function handleItemUnequipped() {
	 *     query(Item).removed(Equipped).forEach((itemId) => {
	 *         // Handle item being unequipped.
	 *     })
	 * }
	 * ```
	 */
	removed<C extends ComponentHandle>(component: C): Query<[...Cs, C]> {
		const prevPair = jecs.pair(Previous.id, component.id)
		this.requiredIds.push(prevPair as unknown as RawId)
		this.excludedIds.push(component.id)

		component.set(Observed)

		return this as unknown as Query<[...Cs, C]>
	}

	/**
	 * Queries for _ids_ that have had `component` changed since the last frame,
	 * with both its new and previous values appended to the _query_'s results.
	 *
	 * # Example
	 *
	 * ```ts
	 * function updateHealthBar() {
	 *     query(Client).changed(Health).forEach((clientId, _, newHealth, oldHealth) => {
	 *         // Update health bar UI.
	 *     })
	 * }
	 * ```
	 */
	changed<C extends ComponentHandle>(component: C): Query<[...Cs, C, C]> {
		// Indices where these values will appear in the arguments list.
		const newIndex = this.requiredIds.size()
		const oldIndex = newIndex + 1

		const prevPair = jecs.pair(Previous.id, component.id)
		this.requiredIds.push(component.id)
		this.requiredIds.push(prevPair as unknown as RawId)

		component.set(Observed)

		this.filters.push((_, ...args) => {
			const newVal = args[newIndex]
			const oldVal = args[oldIndex]
			return newVal !== oldVal
		})

		return this as unknown as Query<[...Cs, C, C]>
	}

	/**
	 * Iterates over each _id_ in the _query_, calling the provided `callback`
	 * with the _id_ and its corresponding _component_ values.
	 */
	forEach(callback: (entity: Handle, ...componentValues: InferValues<Cs>) => void): void {
		const fn = callback as unknown as (e: Handle, ...args: unknown[]) => void

		this.iterate(this.makeRawQuery(), (e, v1, v2, v3, v4, v5, v6, v7, v8) => {
			fn(e, v1, v2, v3, v4, v5, v6, v7, v8)
		})
	}

	// We duplicate a lot of code from `forEach` here so can early exit, resulting in great performance improvements.
	/**
	 * Finds the first _id_ in the _query_ that satisfies the provided
	 * `predicate` function, returning the _id_ and its corresponding
	 * _component_ values, or `undefined` if no such _id_ exists.
	 */
	find(predicate: (entity: Handle, ...componentValues: InferValues<Cs>) => boolean): QueryResult<Cs> | undefined {
		const pred = predicate as unknown as (e: Handle, ...args: unknown[]) => boolean
		let result: QueryResult<Cs> | undefined = undefined

		this.iterate(this.makeRawQuery(), (e, v1, v2, v3, v4, v5, v6, v7, v8) => {
			if (pred(e, v1, v2, v3, v4, v5, v6, v7, v8)) {
				result = [e, v1, v2, v3, v4, v5, v6, v7, v8] as unknown as QueryResult<Cs>
				return true
			}
		})

		return result
	}

	/**
	 * Maps each _id_ in the _query_ to a new value using the provided
	 * `mapper` function, returning an array of the resulting values.
	 *
	 * # Warning
	 *
	 * This method allocates memory for all _ids_ in the _query_ and should be
	 * used sparingly in performance-critical code.
	 */
	map<R extends defined>(mapper: (entity: Handle, ...componentValues: InferValues<Cs>) => R): R[] {
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
	reduce<R>(reducer: (accumulator: R, entity: Handle, ...componentValues: InferValues<Cs>) => R, initialValue: R): R {
		let accumulator = initialValue

		this.forEach((e, ...components) => {
			accumulator = reducer(accumulator, e, ...components)
		})

		return accumulator
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
		const results: [Handle, ...unknown[]][] = []

		this.forEach((e, ...components) => {
			results.push([resolveId(e.id)!, ...components])
		})

		return results as QueryResult<Cs>[]
	}

	/**
	 * Converts the query into a callback that can be scheduled just like a regular system function.
	 *
	 * # Pros
	 *
	 * - It's cached, so it's more performant when called multiple times,
	 *   such as in a system scheduled to run every frame;
	 * - Removes the need of an extra layer of indentation in systems.
	 *
	 * # Cons
	 *
	 * - If a label is desired, requires it being manually given in `Scheduler.useSystem()`.
	 *
	 * # Example
	 *
	 * ```ts
	 * const greetPeople = query(Name, Person).bind((_e, name) => {
	 *     print(`Hello, ${name}!`)
	 * })
	 *
	 * scheduler()
	 *     .useSystem(greetPeople, UPDATE, [], 'greetPeople')
	 *     .run()
	 *
	 * // Equivalent to...
	 *
	 * function greetPeople() {
	 *     query(Name, Person).forEach((_e, name) => {
	 *         print(`Hello, ${name}!`)
	 *     })
	 * }
	 *
	 * scheduler()
	 *     .useSystem(greetPeople, UPDATE)
	 *     .run()
	 * ```
	 */
	bind(callback: (entity: Handle, ...componentValues: InferValues<Cs>) => void): System<[]> {
		const fn = callback as unknown as (e: Handle, ...args: unknown[]) => void

		return () => {
			this.iterate(this.makeRawQuery().cached(), (e, v1, v2, v3, v4, v5, v6, v7, v8) => {
				fn(e, v1, v2, v3, v4, v5, v6, v7, v8)
			})
		}
	}

	/**
	 * Iterates over each id in the query, calling the provided `callback`
	 * with the id and its corresponding component values. Returns early
	 * if `callback` returns `true`.
	 */
	private iterate(
		rawQuery: jecs.Query<RawId[]> | jecs.CachedQuery<RawId[]>,
		callback: (
			id: Handle,
			v1?: unknown,
			v2?: unknown,
			v3?: unknown,
			v4?: unknown,
			v5?: unknown,
			v6?: unknown,
			v7?: unknown,
			v8?: unknown,
		) => boolean | void,
	): void {
		// TODO! Optimize this by adding a flag when we add Wildcard to the query.
		// Wildcard queries are a special case where we want all entities.
		if (this.requiredIds.includes(Wildcard.id) || this.includedIds.includes(Wildcard.id)) {
			for (const rawId of world.entity_index.dense_array) {
				const id = resolveId(rawId)
				if (!id || !this.useFilters(id)) continue

				if (callback(id)) return
			}

			return
		}

		// Roblox-TS won't allow spreading tuples from iterators, so we have to do it manually.
		for (const [rawId, v1, v2, v3, v4, v5, v6, v7, v8] of rawQuery) {
			const id = resolveId(rawId)!
			if (!this.useFilters(id, v1, v2, v3, v4, v5, v6, v7, v8)) continue

			if (callback(id, v1, v2, v3, v4, v5, v6, v7, v8)) return
		}
	}

	private makeRawQuery(): jecs.Query<RawId[]> {
		return world
			.query(...this.requiredIds)
			.with(...this.includedIds)
			.without(...this.excludedIds)
	}

	private useFilters(
		e: Handle,
		v1?: unknown,
		v2?: unknown,
		v3?: unknown,
		v4?: unknown,
		v5?: unknown,
		v6?: unknown,
		v7?: unknown,
		v8?: unknown,
	): boolean {
		const filters = this.filters as unknown as ((e: Handle, ...args: unknown[]) => boolean)[]

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
 * Creates a new query for the specified components and/or pairs.
 *
 * # Example
 *
 * ```ts
 * const Position = component<Vector3>()
 * const Velocity = component<Vector3>()
 *
 * function updatePositions() {
 *     query(Position, Velocity).forEach((entity, position, velocity) => {
 *         entity.set(Position, position.add(velocity))
 *     })
 * }
 */
export function query<Cs extends ZeroUpToEight<ComponentHandle | Pair>>(...components: Cs): Query<Cs> {
	return new Query<Cs>(...components)
}
