import type * as jecs from '@rbxts/jecs'
import { entityHistory } from './entityHistory'
import {
	type ComponentHandle,
	type Handle,
	type InferValue,
	type InferValues,
	resolveId,
} from './handle'
import { MessageSequence } from './handle/builtins'
import type { Pair } from './handle/pair'
import type { RawId } from './id'
import { advanceMessageCursor, getCurrentMessageSequence } from './message'
import type { SystemFn } from './scheduler'
import { getActiveSystemEntity } from './scheduler/systemContext'
import type { OneUpToEight, ZeroUpToEight } from './util'
import { world } from './world'

export type QueryResult<
	Cs extends (ComponentHandle | Pair)[],
	Ms extends (ComponentHandle | Pair)[] = [],
> = [] extends Ms
	? [Handle, ...InferValues<Cs>]
	: [] extends Cs
		? [Handle, ...InferValues<Ms>]
		: [Handle, ...InferValues<Cs>, Handle, ...InferValues<Ms>]

/**
 * The type of the callback passed to a query's consumers (e.g. {@link Query.forEach}).
 *
 * For queries that read messages with {@link Query.on}, the message entity and the
 * values of the message's terms are appended after the query's own values.
 *
 * @group Types
 */
export type QueryCallback<
	Cs extends (ComponentHandle | Pair)[],
	Ms extends (ComponentHandle | Pair)[] = [],
	Ret = void,
> = (...args: QueryResult<Cs, Ms>) => Ret

type IterateFn = (
	id: Handle,
	v1?: unknown,
	v2?: unknown,
	v3?: unknown,
	v4?: unknown,
	v5?: unknown,
	v6?: unknown,
	v7?: unknown,
	v8?: unknown,
) => boolean | void

type AnyIterateFn = (id: Handle, ...args: unknown[]) => boolean | void

type RawQuery = jecs.Query<RawId[]> | jecs.CachedQuery<RawId[]>

type DisconnectFn = () => void

interface MessageSnapshot {
	entity: Handle
	sequence: number
	values: unknown[]
}

/**
 * The type for queries created with {@link query}.
 *
 * `Cs` are the components and pairs that entities must have, and `Ms` are the
 * terms passed to {@link Query.on} (empty when the query doesn't read messages).
 *
 * @group Types
 */
export class Query<
	Cs extends (ComponentHandle | Pair)[],
	Ms extends (ComponentHandle | Pair)[] = [],
> {
	private readonly requiredIds: RawId[]
	private readonly includedIds: RawId[] = []
	private readonly excludedIds: RawId[] = []
	private readonly filters: ((
		entity: Handle,
		...components: unknown[]
	) => boolean)[] = []
	private onTermIds: RawId[] = []
	private onSignature?: string

	constructor(...components: Cs) {
		this.requiredIds = components.map((c) => c.id)
	}

	/**
	 * Includes only entities with _all_ of the specified components in the query's results.
	 *
	 * Does not append the values of these components to the results.
	 */
	with(...components: (ComponentHandle | Pair)[]): Query<Cs, Ms> {
		components.forEach((c) => this.includedIds.push(c.id))
		return this
	}

	/**
	 * Includes entities with _any_ of the specified components in the query's results.
	 *
	 * Does not append the values of these components to the results.
	 */
	withAny(...components: (ComponentHandle | Pair)[]): Query<Cs, Ms> {
		this.filters.push((e) => components.some((c) => e.has(c)))
		return this
	}

	/**
	 * Excludes entities with _all_ of the specified components from the query's results.
	 */
	without(...components: (ComponentHandle | Pair)[]): Query<Cs, Ms> {
		components.forEach((c) => this.excludedIds.push(c.id))
		return this
	}

	/**
	 * Excludes entities with _any_ of the specified components from the query's results.
	 */
	withoutAny(...components: (ComponentHandle | Pair)[]): Query<Cs, Ms> {
		this.filters.push((e) => components.every((c) => !e.has(c)))
		return this
	}

	/**
	 * Adds a filter predicate to the query that entities must satisfy in order to be queried.
	 */
	filter(
		predicate: (entity: Handle, ...components: InferValues<Cs>) => boolean,
	): Query<Cs, Ms> {
		this.filters.push(
			predicate as unknown as (
				entity: Handle,
				...components: unknown[]
			) => boolean,
		)
		return this
	}

	/**
	 * Reads messages that have _all_ of the specified components or pairs, pairing
	 * each one with every entity that matches this query.
	 *
	 * The callback receives `(entity, ...entityValues, message, ...messageValues)`.
	 * With no required components (`query().on(...)`), it receives only
	 * `(message, ...messageValues)`.
	 *
	 * Messages can be read even by systems that run before they're emitted, at the cost of a one-frame delay.
	 *
	 * @remarks
	 * - The query's own terms never match message entities unless `MessageSequence`
	 *   is explicitly required; `on()` is the cursor-aware way to read them.
	 * - Calling `on()` more than once will throw an error.
	 * - Iterating a query with `on()` outside of a system will throw an error.
	 *
	 * @example
	 * ```ts
	 * const Health = component<number>()
	 * const Damaged = component<number>()
	 *
	 * function applyDamage() {
	 *     query(Health).on(Damaged).forEach((e, health, _msg, damage) => {
	 *         e.set(Health, health - damage)
	 *     })
	 * }
	 * ```
	 *
	 * @example
	 * ```ts
	 * function announceDamage() {
	 *     query().on(Damaged).forEach((_msg, damage) => {
	 *         print(`Ouch! ${damage} damage!`)
	 *     })
	 * }
	 * ```
	 */
	on<NewMs extends OneUpToEight<ComponentHandle | Pair>>(
		...terms: NewMs
	): Query<Cs, NewMs> {
		if (this.onSignature !== undefined)
			error("'on' can only be called once per query")

		this.onTermIds = terms.map((t) => t.id)
		this.onSignature = this.onTermIds.join(',')

		return this as unknown as Query<Cs, NewMs>
	}

	/**
	 * Iterates over each entity that matches the query, calling the provided `callback`
	 * with the entity itself and its corresponding component values.
	 */
	forEach(callback: QueryCallback<Cs, Ms>): void {
		this.runQuery(callback as unknown as AnyIterateFn)
	}

	/**
	 * Finds the first entity that matches the query _and_ satisfies the provided
	 * `predicate` function, returning the entity itself and its corresponding
	 * component values, or `undefined` if no such entity exists.
	 *
	 * @remarks
	 * With {@link Query.on}, only the first matching message is read.
	 */
	find(
		predicate: QueryCallback<Cs, Ms, boolean>,
	): QueryResult<Cs, Ms> | undefined {
		const fn = predicate as unknown as (
			e: Handle,
			...args: unknown[]
		) => boolean
		let result: [Handle, ...unknown[]] | undefined

		this.runQuery((e, ...args) => {
			if (!fn(e, ...args)) return

			result = [e, ...args]
			return true
		})

		return result as QueryResult<Cs, Ms> | undefined
	}

	/**
	 * Maps each entity that matches the query to a new value using the provided
	 * `mapper` function, returning an array of the resulting values.
	 *
	 * @remarks
	 * ⚠️ This method allocates memory for all entities that match the query, so it should be
	 * used sparingly in performance-critical code.
	 */
	map<const R extends defined>(mapper: QueryCallback<Cs, Ms, R>): R[] {
		const fn = mapper as unknown as (e: Handle, ...args: unknown[]) => R
		const results: R[] = []

		this.runQuery((e, ...args) => {
			results.push(fn(e, ...args))
		})

		return results
	}

	/**
	 * Reduces the entities that match the query to a single value using the provided
	 * `reducer` function and `initialValue`.
	 */
	reduce<R>(
		reducer: (accumulator: R, ...args: QueryResult<Cs, Ms>) => R,
		initialValue: R,
	): R {
		const fn = reducer as unknown as (
			acc: R,
			e: Handle,
			...args: unknown[]
		) => R
		let accumulator = initialValue

		this.runQuery((e, ...args) => {
			accumulator = fn(accumulator, e, ...args)
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
	collect(): QueryResult<Cs, Ms>[] {
		const results: [Handle, ...unknown[]][] = []

		this.runQuery((e, ...args) => {
			results.push([e, ...args])
		})

		return results as unknown as QueryResult<Cs, Ms>[]
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
	 * - Cannot be passed optional arguments in {@link SystemConfig}.
	 * - Better used with arrow functions, meaning labels cannot be automatically inferred from function names.
	 *
	 * @example
	 * ```ts
	 * const greetPeople = query(Name, Person).bind((_e, name) => {
	 *     print(`Hello, ${name}!`)
	 * })
	 *
	 * scheduler()
	 *     .useSystem('update', greetPeople, { label: 'greetPeople' })
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
	 *     .useSystem('update', greetPeople)
	 *     .run()
	 * ```
	 */
	bind(callback: QueryCallback<Cs, Ms>): SystemFn<[]> {
		if (this.onTermIds.isEmpty()) {
			const hoistedQuery = this.makeRawQuery().cached()

			return () => {
				this.iterateEntities(hoistedQuery, callback as unknown as IterateFn)
			}
		}

		const hoistedBaseQuery = this.requiredIds.isEmpty()
			? undefined
			: this.makeRawQuery().cached()
		const hoistedMsgQuery = this.makeMessageRawQuery().cached()

		return () => {
			this.iterateEntitiesWithMessages(
				hoistedBaseQuery,
				hoistedMsgQuery,
				callback as unknown as AnyIterateFn,
			)
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
		callback: (
			entity: Handle,
			...componentValues: InferValues<[...Cs, C]>
		) => void,
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
		callback: (
			entity: Handle,
			...componentValues: InferValues<[...Cs, C, C]>
		) => void,
	): DisconnectFn {
		return world.changed(component.id, (id, _, value) => {
			const e = resolveId(id)
			if (!e) return

			const requiredValues = this.match(e)
			if (!requiredValues) return

			callback(
				e,
				...[
					...requiredValues,
					value as InferValue<C>,
					entityHistory.get(id, component.id)! as InferValue<C>,
				],
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
		callback: (
			entity: Handle,
			...componentValues: [...InferValues<Cs>, InferValue<C>, boolean]
		) => void,
	): DisconnectFn {
		return world.removed(component.id, (id, _, despawned) => {
			const e = resolveId(id)
			if (!e) return

			const requiredValues = this.match(e)
			if (!requiredValues) return

			callback(
				e,
				...[
					...requiredValues,
					entityHistory.get(id, component.id)! as InferValue<C>,
					despawned ?? false,
				],
			)
		})
	}

	/**
	 * Iterates the query, using the message-aware path when `on()` was called.
	 */
	private runQuery(callback: AnyIterateFn): void {
		if (this.onTermIds.isEmpty()) {
			this.iterateEntities(this.makeRawQuery(), callback)
			return
		}

		this.iterateEntitiesWithMessages(
			this.requiredIds.isEmpty() ? undefined : this.makeRawQuery(),
			this.makeMessageRawQuery(),
			callback,
		)
	}

	private makeMessageRawQuery(): jecs.Query<RawId[]> {
		return world.query(...this.onTermIds).with(MessageSequence.id)
	}

	/**
	 * Iterates over each entity in the query, calling the provided `callback`
	 * with the entity and its corresponding component values.
	 *
	 * Stops early if `callback` returns `true`.
	 *
	 * @returns `true` if the iteration was stopped early by `callback`, or `false`
	 * if every id was visited.
	 */
	private iterateEntities(
		rawQuery: jecs.Query<RawId[]> | jecs.CachedQuery<RawId[]>,
		callback: IterateFn,
	): boolean {
		// Roblox-TS won't allow spreading tuples from iterators, so we have to do it manually.
		for (const [rawId, v1, v2, v3, v4, v5, v6, v7, v8] of rawQuery) {
			const id = resolveId(rawId)!
			if (!this.passesFilters(id, v1, v2, v3, v4, v5, v6, v7, v8)) continue

			if (callback(id, v1, v2, v3, v4, v5, v6, v7, v8) === true) return true
		}

		return false
	}

	/**
	 * Reads the messages this system hasn't read yet that have _all_ of the query's
	 * `on()` terms, in emission order, calling `callback` for each one:
	 * - `query().on(...)`: `callback` receives the message and its values.
	 * - `query(...).on(...)`: `callback` is called for every entity that matches the
	 *   base query, receiving the entity, its values, the message, and its values.
	 *
	 * The system's cursor is advanced past every message emitted so far, matching or
	 * not, so no message is read twice. Stops early if `callback` returns `true`.
	 */
	private iterateEntitiesWithMessages(
		baseRawQuery: RawQuery | undefined,
		msgRawQuery: RawQuery,
		callback: AnyIterateFn,
	): void {
		const systemEntt = getActiveSystemEntity()
		if (systemEntt === undefined)
			error('Messages can only be read from within a system')

		const now = getCurrentMessageSequence()
		const cursor = advanceMessageCursor(systemEntt.id, this.onSignature!, now)

		// Collected up front so callbacks can safely emit messages or despawn entities.
		const messageSnapshots = this.collectMessages(msgRawQuery, cursor, now)
		const baseCount = this.requiredIds.size()

		for (const { entity, values: mv } of messageSnapshots) {
			// `query().on(...)`: only the message is passed.
			if (baseRawQuery === undefined) {
				// biome-ignore format: keeps each argument on a single line.
				const result = callback(entity, mv[0], mv[1], mv[2], mv[3], mv[4], mv[5], mv[6], mv[7])
				if (result === true) return
				continue
			}

			// `query(...).on(...)`: every matching entity is paired with the message.
			// biome-ignore format: keeps each case on a single line.
			const stopped = this.iterateEntities(baseRawQuery, (e, v1, v2, v3, v4, v5, v6, v7, v8) => {
    			// Roblox-TS can't spread in the middle of an argument list, so this switch replaces:
    			// this.iterateEntities(baseRawQuery, (e, ...values) => callback(e, ...values, entity, ...mv))
				switch (baseCount) {
					case 1: return callback(e, v1, entity, mv[0], mv[1], mv[2], mv[3], mv[4], mv[5], mv[6], mv[7])
					case 2: return callback(e, v1, v2, entity, mv[0], mv[1], mv[2], mv[3], mv[4], mv[5], mv[6], mv[7])
					case 3: return callback(e, v1, v2, v3, entity, mv[0], mv[1], mv[2], mv[3], mv[4], mv[5], mv[6], mv[7])
					case 4: return callback(e, v1, v2, v3, v4, entity, mv[0], mv[1], mv[2], mv[3], mv[4], mv[5], mv[6], mv[7])
					case 5: return callback(e, v1, v2, v3, v4, v5, entity, mv[0], mv[1], mv[2], mv[3], mv[4], mv[5], mv[6], mv[7])
					case 6: return callback(e, v1, v2, v3, v4, v5, v6, entity, mv[0], mv[1], mv[2], mv[3], mv[4], mv[5], mv[6], mv[7])
					case 7: return callback(e, v1, v2, v3, v4, v5, v6, v7, entity, mv[0], mv[1], mv[2], mv[3], mv[4], mv[5], mv[6], mv[7])
					default: return callback(e, v1, v2, v3, v4, v5, v6, v7, v8, entity, mv[0], mv[1], mv[2], mv[3], mv[4], mv[5], mv[6], mv[7])
				}
			})
			if (stopped) return
		}
	}

	/**
	 * Collects the messages with _all_ of the query's `on()` terms that were emitted
	 * in `[cursor, now)`, sorted by emission order.
	 */
	private collectMessages(
		msgRawQuery: RawQuery,
		cursor: number,
		now: number,
	): MessageSnapshot[] {
		const snapshots: MessageSnapshot[] = []

		for (const [rawId, v1, v2, v3, v4, v5, v6, v7, v8] of msgRawQuery) {
			const sequence = world.get(rawId, MessageSequence.id) as number
			if (sequence < cursor || sequence >= now) continue

			snapshots.push({
				entity: resolveId(rawId)!,
				sequence,
				values: [v1, v2, v3, v4, v5, v6, v7, v8],
			})
		}

		snapshots.sort((a, b) => a.sequence < b.sequence)
		return snapshots
	}

	private makeRawQuery(): jecs.Query<RawId[]> {
		return (
			world
				.query(...this.requiredIds)
				.with(...this.includedIds)
				// Messages are only readable through `on()` or by explicitly
				// requiring `MessageSequence`.
				.without(
					...(this.isMessageQuery()
						? this.excludedIds
						: [...this.excludedIds, MessageSequence.id]),
				)
		)
	}

	private isMessageQuery(): boolean {
		return (
			this.requiredIds.includes(MessageSequence.id) ||
			this.includedIds.includes(MessageSequence.id)
		)
	}

	/**
	 * Checks whether `e` satisfies _all_ of the query's criteria (required,
	 * included and excluded ids, plus filters) outside of a jecs query iteration,
	 * returning the values of the required components if it does.
	 */
	private match(e: Handle): InferValues<Cs> | undefined {
		// Messages are only readable through `on()` or by requiring `MessageSequence`.
		if (!this.isMessageQuery() && world.has(e.id, MessageSequence.id))
			return undefined

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

		if (!this.passesFilters(e, ...requiredValues)) return undefined

		return requiredValues as unknown as InferValues<Cs>
	}

	private passesFilters(
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
		for (const filter of this.filters) {
			if (!filter(e, v1, v2, v3, v4, v5, v6, v7, v8)) return false
		}
		return true
	}
}

/**
 * Creates a {@link Query}, which represents a set of criteria used to filter and iterate over entities based on their components.
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
 * @group Core
 */
export function query<Cs extends ZeroUpToEight<ComponentHandle | Pair>>(
	...components: Cs
): Query<Cs> {
	return new Query<Cs>(...components)
}
