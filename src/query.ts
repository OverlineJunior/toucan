import { Handle, RawId, InferValues, resolveId, ComponentHandle, Wildcard, entityHistory, InferValue } from './handle'
import { Pair } from './pair'
import { System } from './scheduler'
import { ZeroUpToEight } from './util'
import { world } from './world'
import * as jecs from '@rbxts/jecs'

export type QueryResult<Cs extends (ComponentHandle | Pair)[]> = [Handle, ...InferValues<Cs>]

type DisconnectFn = () => void

/**
 * Created with {@link query}, it represents a set of criteria used to filter and iterate over entities based on their components.
 *
 * Queries provide a fluent, chainable API to define strict matching rules (such as requiring or
 * excluding specific components) and offer various ways to consume the matching entities. You can
 * iterate over them (`forEach`, `map`), listen to their lifecycle events (`onAdded`, `onChanged`),
 * or bind them directly into optimized system callbacks (`bind`).
 *
 * @example
 * ```ts
 * // 1. Define the query.
 * const healthyMovers = query(Health, Position)
 *     .with(Velocity)
 *     .without(Stunned)
 *     .filter((_entity, health, _position) => health > 0)
 *
 * // 2. Consume the query.
 * healthyMovers.forEach((entity, health, position) => {
 *     print(`Entity ${entity.id} is moving with ${health}hp at ${position}!`)
 * })
 * ```
 *
 * @group Core ECS
 */
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
	 * Adds a filter predicate to the query that entities must satisfy in order to be queried.
	 */
	filter(predicate: (entity: Handle, ...components: InferValues<Cs>) => boolean): Query<Cs> {
		this.filters.push(predicate)
		return this
	}

	/**
	 * Iterates over each entity that matches the query, calling the provided `callback`
	 * with the entity itself and its corresponding component values.
	 */
	forEach(callback: (entity: Handle, ...componentValues: InferValues<Cs>) => void): void {
		const fn = callback as unknown as (e: Handle, ...args: unknown[]) => void

		this.iterate(this.makeRawQuery(), (e, v1, v2, v3, v4, v5, v6, v7, v8) => {
			fn(e, v1, v2, v3, v4, v5, v6, v7, v8)
		})
	}

	/**
	 * Finds the first entity that matches the query _and_ satisfies the provided
	 * `predicate` function, returning the entity itself and its corresponding
	 * component values, or `undefined` if no such entity exists.
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
	 * Maps each entity that matches the query to a new value using the provided
	 * `mapper` function, returning an array of the resulting values.
	 *
	 * @remarks
	 * ⚠️ This method allocates memory for all entities that match the query, so it should be
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
	 * Reduces the entities that match the query to a single value using the provided
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
	 * Collects all entities that match the query, returning an array of the entities
	 * themselves and their corresponding component values.
	 *
	 * @remarks
	 * ⚠️ This method allocates memory for all entities that match the query, so it should be
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
	 * #### Pros:
	 * - It's cached, so it's more performant when called multiple times,
	 *   such as in a system scheduled to run every frame;
	 * - Removes the need of an extra layer of indentation in systems.
	 *
	 * #### Cons:
	 * - Cannot be passed optional arguments by `Scheduler.useSystem()`.
	 * - Cannot easily infer a label from function name, requiring it to be manually given by `Scheduler.useSystem()`.
	 *
	 * @example
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
	 * Registers a callback that fires whenever the specified component is added to an
	 * entity that matches this query.
	 *
	 * The callback receives the entity, the values of the queried components, and the
	 * newly added component's value.
	 *
	 * @example
	 * ```ts
	 * query(Player).onAdded(Health, (entity, player, health) => {
	 *     print(`${health}hp was added to ${player}!`)
	 * })
	 * ```
	 */
	onAdded<C extends ComponentHandle>(
		component: C,
		callback: (entity: Handle, ...componentValues: InferValues<[...Cs, C]>) => void,
	): DisconnectFn {
		return world.added(component.id, (id, _, value) => {
			const e = resolveId(id)
			if (!e) return

			const requiredValues = this.match(e)
			if (!requiredValues) return

			// Roblox-TS doesn't allow spreading function arguments unless they're last, and we wanna preserve order.
			callback(e, ...[...requiredValues, value as InferValue<C>])
		})
	}

	/**
	 * Registers a callback that fires whenever the specified component's value changes
	 * on an entity that matches this query.
	 *
	 * The callback receives the entity, the values of the queried components, the
	 * new value of the changed component, and its previous value.
	 *
	 * @example
	 * ```ts
	 * query(Player).onChanged(Health, (entity, player, newHealth, oldHealth) => {
	 *     print(`${player}'s health changed from ${oldHealth} to ${newHealth}!`)
	 * })
	 * ```
	 */
	onChanged<C extends ComponentHandle>(
		component: C,
		callback: (entity: Handle, ...componentValues: InferValues<[...Cs, C, C]>) => void,
	): DisconnectFn {
		return world.changed(component.id, (id, _, value) => {
			const e = resolveId(id)
			if (!e) return

			const requiredValues = this.match(e)
			if (!requiredValues) return

			callback(
				e,
				...[...requiredValues, value as InferValue<C>, entityHistory.get(id, component.id)! as InferValue<C>],
			)
		})
	}

	/**
	 * Registers a callback that fires whenever the specified component is removed from
	 * an entity that matches this query, or when the entity itself is despawned.
	 *
	 * The callback receives the entity, the values of the queried components, the
	 * component's last known value before removal, and a boolean indicating if the
	 * removal was caused by the entity despawning.
	 *
	 * @example
	 * ```ts
	 * query(Player).onRemoved(Health, (entity, player, oldHealth, despawned) => {
	 *     if (despawned) {
	 *         print(`${player} had ${oldHealth}hp before their entity was completely annihilated.`)
	 *     } else {
	 *         print(`${player} had ${oldHealth}hp before their Health component was removed.`)
	 *     }
	 * })
	 * ```
	 */
	onRemoved<C extends ComponentHandle>(
		component: C,
		callback: (entity: Handle, ...componentValues: [...InferValues<Cs>, InferValue<C>, boolean]) => void,
	): DisconnectFn {
		return world.removed(component.id, (id, _, despawned) => {
			const e = resolveId(id)
			if (!e) return

			const requiredValues = this.match(e)
			if (!requiredValues) return

			callback(
				e,
				...[...requiredValues, entityHistory.get(id, component.id)! as InferValue<C>, despawned ?? false],
			)
		})
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

	private match(e: Handle): InferValues<Cs> | undefined {
		const requiredValues: defined[] = []

		for (const compId of this.requiredIds) {
			const v = world.get(e.id, compId)
			if (v === undefined) return undefined

			requiredValues.push(v as defined)
		}

		for (const compId of this.includedIds) {
			if (!world.has(e.id, compId)) return undefined
		}

		for (const compId of this.excludedIds) {
			if (world.has(e.id, compId)) return undefined
		}

		if (!this.useFilters(e, ...requiredValues)) return undefined

		return requiredValues as unknown as InferValues<Cs>
	}
}

/**
 * Creates a new query for the specified components and/or pairs.
 *
 * @example
 * ```ts
 * const Position = component<Vector3>()
 * const Velocity = component<Vector3>()
 *
 * function updatePositions() {
 *     query(Position, Velocity).forEach((entity, position, velocity) => {
 *         entity.set(Position, position.add(velocity))
 *     })
 * }
 * ```
 *
 * @group Core ECS
 */
export function query<Cs extends ZeroUpToEight<ComponentHandle | Pair>>(...components: Cs): Query<Cs> {
	return new Query<Cs>(...components)
}
