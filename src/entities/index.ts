import { entityHistory } from '../entityHistory'
import {
	getPairRelationFromId,
	getPairTargetFromId,
	isPairId,
	type RawId,
} from '../id'
import { getActivePluginEntity } from '../scheduler/pluginContext'
import type { Flatten, Nullable, OneUpToFour, WrapLuaTuple } from '../util'
import { getAllComponentIdsIn, world } from '../world'
import { getBuiltin } from './builtinRegistry'
import { type Pair, pair } from './pair'
import { hasThirdPartyCaller } from './thirdParty'

/**
 * Extracts the value type from a component/resource/pair type.
 *
 * @group Types
 */
export type InferValue<T> = T extends { [VALUE_SYMBOL]: infer V } ? V : never

/**
 * Extracts the value types from a tuple of component/resource/pair types.
 *
 * @group Types
 */
export type InferValues<Ts> = { [K in keyof Ts]: InferValue<Ts[K]> }

type GetComponentValues<Args extends unknown[]> = WrapLuaTuple<
	Flatten<Nullable<InferValues<Args>>>
>

// We use this as a key to a "phantom property" on Id subclasses to represent
// their value type. With this, we:
// 1. Allow Typescript to infer the value type of Id subclasses with `InferValue`;
// 2. Hide the property from the user.
export declare const VALUE_SYMBOL: unique symbol

/**
 * Returns the appropriate entity-like value for `rawId`, or `undefined` if it does not exist in the world.
 *
 * @group Core
 */
export function resolveId(
	rawId: RawId,
): Entity | Component | Resource | undefined {
	if (!world.contains(rawId)) {
		return
	}

	if (world.has(rawId, getBuiltin('Component').id)) {
		return new Component(rawId)
	} else if (world.has(rawId, getBuiltin('Resource').id)) {
		return new Resource(rawId)
	} else if (world.has(rawId, getBuiltin('Entity').id)) {
		return new Entity(rawId)
	}

	// Every entity created through Toucan has exactly one of `Entity`,
	// `Component` or `Resource`. Jecs internals have none of them,
	// so they're intentionally ignored here.
	return undefined
}

// -----------------------------------------------------------------------------
// EntityLike
// -----------------------------------------------------------------------------

/**
 * A generic entity-like type inherited by {@link Entity}, {@link Component}
 * and {@link Resource}.
 *
 * @example
 * ```ts
 * const Person = component()
 * const bob = entity().set(Person)
 *
 * query(Person).forEach((entityLike) => {
 *     // If we know for certain everything with Person
 *     // is a regular entity, we can cast it like one.
 *     const entity = entityLike as Entity
 * })
 * ```
 *
 * @group Types
 */
export abstract class EntityLike {
	constructor(
		/**
		 * A numerical entity identifier used internally.
		 *
		 * Useful when you cannot pass the entire entity-like value to something, but can pass
		 * its numerical ID instead. For example, storing an entity's ID in an
		 * instance's attribute, which cannot hold complex data structures.
		 *
		 * In order to get back the appropriate entity-like value from an ID, use the
		 * {@link resolveId} function.
		 */
		public readonly id: RawId,
	) {
		const mt = getmetatable(this) as {
			__eq?: (a: EntityLike, b: EntityLike) => boolean
		}
		mt.__eq = (a, b) => a.id === b.id
	}

	/**
	 * Assigns a tag component to this entity.
	 *
	 * @example
	 * ```ts
	 * const IsAlive = component()
	 * myEntity.set(IsAlive)
	 * ```
	 */
	set(tagComponent: Component<undefined>): this
	/**
	 * Assigns a component and its value to this entity.
	 *
	 * @example
	 * ```ts
	 * const Health = component<number>()
	 * const Stamina = component<number>()
	 *
	 * entity()
	 *     .set(Health, 100)
	 *     .set(Stamina, 50)
	 * ```
	 */
	set<V>(component: Component<V>, value: NoInfer<V>): this
	/**
	 * Assigns a relationship pair to this entity.
	 *
	 * @example
	 * ```ts
	 * const Likes = component()
	 *
	 * const bob = entity()
	 * const alice = entity()
	 *     .set(pair(Likes, bob))
	 * ```
	 */
	set(tagPair: Pair<undefined>): this
	/**
	 * Assigns a relationship pair and its value to this entity.
	 *
	 * @example
	 * ```ts
	 * const Owns = component<number>()
	 *
	 * const car = entity()
	 * const perfume = entity()
	 *
	 * const alice = entity()
	 *     .set(pair(Owns, car), 2)
	 *     .set(pair(Owns, perfume), 5)
	 * ```
	 */
	set<P extends Pair>(pair: P, value: InferValue<P>): this
	set(term: Component | Pair, value?: unknown) {
		if (value === undefined) {
			world.add(this.id, term.id)
		} else {
			world.set(this.id, term.id, value)
		}

		entityHistory.set(this.id, term.id, value)

		return this
	}

	/**
	 * Retrieves the values of up to 4 components or relationship pairs on
	 * this entity.
	 *
	 * Missing components or pairs will return `undefined`.
	 *
	 * @example
	 * ```ts
	 * const name = myEntity.get(Name)
	 *
	 * const [position, velocity] = myEntity.get(Position, Velocity)
	 *
	 * const carCount = myEntity.get(pair(Owns, car))
	 * ```
	 */
	get<Args extends OneUpToFour<Component | Pair>>(
		...componentsOrPairs: Args
	): GetComponentValues<Args> {
		return world.get(
			this.id,
			...(componentsOrPairs.map((c) => c.id) as OneUpToFour<RawId>),
		) as GetComponentValues<Args>
	}

	/**
	 * Returns `true` if this entity has _all_ of the specified components or
	 * relationship pairs.
	 *
	 * A maximum of 4 components or pairs can be checked at once.
	 *
	 * @example
	 * ```ts
	 * const IsDead = component()
	 * const Owns = component()
	 *
	 * const house = entity()
	 * const bob = entity()
	 *     .set(IsDead)
	 *     .set(pair(Owns, house))
	 *
	 * if (bob.has(IsDead, pair(Owns, house))) {
	 *     // Why don't we rob Bob's house?
	 * }
	 * ```
	 */
	has(...componentsOrPairs: OneUpToFour<Component | Pair>): boolean {
		return world.has(
			this.id,
			...(componentsOrPairs.map((c) => c.id) as OneUpToFour<RawId>),
		)
	}

	/**
	 * Removes a component or relationship pair from this entity.
	 *
	 * Throws an error if trying to remove a component or relationship pair
	 * with the {@link Builtin.Persistent} component (i.e. most built-in components).
	 */
	remove(componentOrPair: Component | Pair): this {
		const targetId = isPairId(componentOrPair.id)
			? getPairRelationFromId(componentOrPair.id, world)
			: componentOrPair.id

		if (world.has(targetId, getBuiltin('Persistent').id)) {
			error(
				`Cannot remove component '${componentOrPair}' from entity '${this}' because it is marked as persistent\n\n` +
					`Tip: check if the component has the 'Persistent' component itself, or, in extreme cases, remove it first`,
			)
		}

		world.remove(this.id, componentOrPair.id)
		entityHistory.deleteComponent(this.id, componentOrPair.id)
		return this
	}

	/**
	 * Clears all components and relationship pairs from this entity,
	 * but does not despawn the entity.
	 *
	 * Components and relationship pairs with the {@link Builtin.Persistent} component
	 * (i.e. most built-in components) will not be removed.
	 */
	clear(): this {
		this.components()
			.filter((c) => !world.has(c.id, getBuiltin('Persistent').id))
			.forEach((c) => this.remove(c))

		this.relationships()
			.filter(
				(p) =>
					!world.has(
						getPairRelationFromId(p.id, world),
						getBuiltin('Persistent').id,
					),
			)
			.forEach((p) => this.remove(p))

		entityHistory.clearComponents(this.id)
		return this
	}

	/**
	 * Returns all components associated with this entity.
	 */
	components(): Component[] {
		const comps: Component[] = []

		getAllComponentIdsIn(this.id).forEach((compId_) => {
			const compId = compId_ as RawId
			if (isPairId(compId)) return
			const component = resolveId(compId as RawId)
			if (component) {
				comps.push(component as Component)
			}
		})

		return comps
	}

	/**
	 * Returns all relationship pairs associated with this entity.
	 */
	relationships(): Pair[] {
		const rels: Pair[] = []

		getAllComponentIdsIn(this.id).forEach((compId_) => {
			const compId = compId_ as RawId
			if (!isPairId(compId)) return

			const relationId = getPairRelationFromId(compId, world)
			const targetId = getPairTargetFromId(compId, world)

			const relationEntity = resolveId(relationId)
			const targetEntity = resolveId(targetId)

			if (relationEntity && targetEntity) {
				rels.push(pair(relationEntity as Entity, targetEntity as Entity))
			}
		})

		return rels
	}

	/**
	 * Gets the label assigned to this entity.
	 *
	 * @remarks
	 * If the entity has been despawned, it will return a label indicating that.
	 */
	toString(): string {
		const label = this.get(getBuiltin('Label'))
		if (label !== undefined) return label

		return this.exists()
			? `Entity #${this.id}`
			: `Entity #${this.id} (despawned)`
	}

	/**
	 * Gets the parent (the target of a {@link Builtin.ChildOf} relationship) for this entity, if such a relationship exists.
	 *
	 * @example
	 * ```ts
	 * const alice = entity()
	 * const charlie = entity().set(pair(ChildOf, alice))
	 *
	 * const parent = charlie.parent() // alice
	 * ```
	 */
	parent(): EntityLike | undefined {
		const parentId = world.parent(this.id)
		return parentId ? resolveId(parentId)! : undefined
	}

	/**
	 * Gets all children (the sources of {@link Builtin.ChildOf} relationships) for this entity.
	 *
	 * @example
	 * ```ts
	 * const alice = entity()
	 * const charlie = entity().set(pair(ChildOf, alice))
	 * const bob = entity().set(pair(ChildOf,  alice))
	 *
	 * const children = alice.children() // [charlie, bob]
	 * ```
	 */
	children(): EntityLike[] {
		// Jecs uses (ChildOf, Wildcard) as an internal index for every ChildOf pair,
		// so world.children(Wildcard) would return all children in the world.
		if (this.id === getBuiltin('Wildcard').id) return []

		const childIds = []
		for (const id of world.children(this.id)) {
			childIds.push(resolveId(id)!)
		}
		return childIds
	}

	/**
	 * Returns `true` if this entity exists in the world.
	 */
	exists(): boolean {
		return world.contains(this.id)
	}

	/**
	 * Returns the target entity of a relationship pair from this entity.
	 *
	 * If there are multiple targets for the given relationship, the `nth` index
	 * can be specified (starting at 0).
	 *
	 * @example
	 * ```ts
	 * const Likes = component()
	 *
	 * const bob = entity()
	 * const charlie = entity()
	 * const alice = entity()
	 *     .set(pair(Likes, bob))
	 *     .set(pair(Likes, charlie))
	 *
	 * // The order of targets is not guaranteed.
	 * const maybeBob = alice.targetOf(Likes, 0)
	 * const maybeCharlie = alice.targetOf(Likes, 1)
	 * ```
	 */
	targetOf(relation: Component, nth = 0): EntityLike | undefined {
		const t = world.target(this.id, relation.id, nth)
		return t ? resolveId(t)! : undefined
	}

	/**
	 * Returns all target entities of a relationship pair from this entity.
	 *
	 * @example
	 * ```ts
	 * const Likes = component()
	 *
	 * const bob = entity()
	 * const charlie = entity()
	 * const alice = entity()
	 *     .set(pair(Likes, bob))
	 *     .set(pair(Likes, charlie))
	 *
	 * const likedEntities = alice.targetsOf(Likes)
	 * ```
	 */
	targetsOf(relation: Component): EntityLike[] {
		const targets: EntityLike[] = []
		let nth = 0
		while (true) {
			const t = world.target(this.id, relation.id, nth)
			if (!t) {
				break
			}
			targets.push(resolveId(t)!)
			nth++
		}

		return targets
	}

	// TODO! Find a way to implement this.
	// Example usage:
	// ```ts
	// const Name = component<string>()
	// const Likes = component()
	// const Hates = component()
	// const Loves = component()

	// const alice = entity().set(Name, 'Alice')

	// const bob = entity().set(Name, 'Bob').set(pair(Likes, alice))
	// const charlie = entity().set(Name, 'Charlie').set(pair(Hates, alice))
	// const dave = entity().set(Name, 'Dave').set(pair(Loves, alice))

	// query(pair(Wildcard, alice)).forEach((relatedToAlice) => {
	//     const relations = relatedToAlice.relationsTo(alice)
	// }
	// ```
	// relationTo(target: Id, nth = 0): Component | undefined {
	// 	error('Not implemented')
	// }

	// TODO! Same as `relationTo`.
	// relationsTo(target: Id): Component[] {
	// 	error('Not implemented')
	// }

	/**
	 * Completely deletes this entity from the world.
	 *
	 * Throws an error if the entity is marked as persistent.
	 */
	despawn(): void {
		if (this.has(getBuiltin('Persistent'))) {
			error(
				`Cannot despawn entity '${this}' because it is marked as persistent\n\n` +
					`Tip: check if the entity has the 'Persistent' component, or, in extreme cases, remove it first`,
			)
		}

		world.delete(this.id)
		entityHistory.deleteEntity(this.id)
	}
}

// -----------------------------------------------------------------------------
// Entity
// -----------------------------------------------------------------------------

/**
 * An entity spawned with {@link entity}.
 *
 * @group Types
 */
export class Entity extends EntityLike {
	protected declare readonly __brand: 'entity'
}

/**
 * Spawns a new, empty {@link Entity} and returns it.
 *
 * Additionally, a `label` can be provided for easier identification.
 *
 * @group Core
 */
export function entity(label?: string): Entity {
	const rawId = world.entity()
	const e = new Entity(rawId)
		.set(getBuiltin('Entity'))
		.set(getBuiltin('Label'), label ?? `Entity #${rawId}`)

	if (hasThirdPartyCaller()) {
		e.set(getBuiltin('ThirdParty'))
	}

	const activePlugin = getActivePluginEntity()
	if (activePlugin !== undefined) {
		e.set(pair(getBuiltin('AddedByPlugin'), activePlugin))
	}

	return e
}

/**
 * Shared implementation for `onChanged` on components and resources.
 *
 * @internal
 */
function subscribeToChanges<Value>(
	componentId: RawId,
	callback: (entity: EntityLike, newValue: Value, oldValue: Value) => void,
): () => void {
	return world.changed(componentId, (id, _, value) => {
		const e = resolveId(id)
		if (!e) return

		callback(e, value as Value, entityHistory.get(id, componentId)! as Value)
	})
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

/**
 * A component spawned with {@link component}.
 *
 * @group Types
 */
export class Component<Value = unknown> extends EntityLike {
	declare [VALUE_SYMBOL]: Value

	/**
	 * Registers a callback that fires whenever this component is added to an entity.
	 *
	 * @example
	 * ```ts
	 * const Health = component<number>()
	 *
	 * Health.onAdded((entity, health) => {
	 *     print(`${health}hp was added to entity ${entity.id}!`)
	 * })
	 * ```
	 */
	onAdded(callback: (entity: EntityLike, value: Value) => void): () => void {
		return world.added(this.id, (id, _, value) => {
			const e = resolveId(id)
			if (!e) return

			callback(e, value as Value)
		})
	}

	/**
	 * Registers a callback that fires whenever this component's value changes on an entity.
	 *
	 * @example
	 * ```ts
	 * const Health = component<number>()
	 *
	 * Health.onChanged((entity, newHealth, oldHealth) => {
	 *     print(`Entity ${entity.id}'s health changed from ${oldHealth} to ${newHealth}!`)
	 * })
	 * ```
	 */
	onChanged(
		callback: (entity: EntityLike, newValue: Value, oldValue: Value) => void,
	): () => void {
		return subscribeToChanges(this.id, callback)
	}

	/**
	 * Registers a callback that fires whenever this component is removed from an
	 * entity, or when the entity itself is despawned.
	 *
	 * @example
	 * ```ts
	 * const Health = component<number>()
	 *
	 * Health.onRemoved((entity, oldHealth, despawned) => {
	 *     if (despawned) {
	 *         print(`Entity ${entity.id} had ${oldHealth}hp before being despawned.`)
	 *     } else {
	 *         print(`Entity ${entity.id} had ${oldHealth}hp before losing Health.`)
	 *     }
	 * })
	 * ```
	 */
	onRemoved(
		callback: (entity: EntityLike, oldValue: Value, despawned: boolean) => void,
	): () => void {
		return world.removed(this.id, (id, _, despawned) => {
			const e = resolveId(id)
			if (!e) return

			callback(e, entityHistory.get(id, this.id)! as Value, despawned ?? false)
		})
	}
}

/**
 * Creates a new {@link Component}.
 *
 * Additionally, a `label` can be provided for easier identification.
 *
 * @example
 * ```ts
 * // A component with a value.
 * const Health = component<number>()
 *
 * // A tag component.
 * const IsAlive = component()
 * ```
 *
 * @group Core
 */
export function component<Value = undefined>(label?: string): Component<Value> {
	const rawId = world.component<Value>()
	return addDefaultComponentMetadata(
		new Component<Value>(rawId),
		label ?? `Component #${rawId}`,
	)
}

/**
 * Adds metadata components that **every** component should have.
 */
export function addDefaultComponentMetadata<C extends Component>(
	comp: C,
	label: string,
): C {
	comp.set(getBuiltin('Component')).set(getBuiltin('Label'), label)
	if (hasThirdPartyCaller()) {
		comp.set(getBuiltin('ThirdParty'))
	}
	return comp
}

// -----------------------------------------------------------------------------
// Resource
// -----------------------------------------------------------------------------

/**
 * A resource spawned with {@link resource}.
 *
 * @group Types
 */
export class Resource<Value = unknown> extends EntityLike {
	declare [VALUE_SYMBOL]: Value

	/**
	 * Returns the current value of this resource.
	 *
	 * Not to be confused with {@link EntityLike.get}, which can be used to retrieve the value of
	 * components attached to resources, just like with entities.
	 */
	read(): Value {
		return world.get(this.id, this.id) as Value
	}

	/**
	 * Updates the value of the resource.
	 *
	 * Not to be confused with {@link EntityLike.set}, which can be used to set the value of
	 * components attached to resources, just like with entities.
	 */
	write(value: Value): this {
		world.set(this.id, this.id, value)
		entityHistory.set(this.id, this.id, value)
		return this
	}

	/**
	 * Registers a callback that fires whenever this resource's value changes.
	 *
	 * @example
	 * ```ts
	 * const GameState = resource('lobby')
	 *
	 * GameState.onChanged((resource, newState, oldState) => {
	 *     print(`Game state changed from ${oldState} to ${newState}!`)
	 * })
	 * ```
	 */
	onChanged(callback: (newValue: Value, oldValue: Value) => void): () => void {
		return subscribeToChanges<Value>(this.id, (_e, newV, oldV) =>
			callback(newV, oldV),
		)
	}
}

/**
 * Creates a new {@link Resource} with the given initial `value`.
 *
 * Resources exist independently of entities (and cannot be attached to them).
 * They are useful to represent global state, such as game state, settings and so on.
 *
 * Additionally, a `label` can be provided for easier identification.
 *
 * @example
 * ```ts
 * const GameState = resource('lobby')
 *
 * function startGame() {
 *     // `read` and `write` are used instead of `get` and `set` when it comes to
 *     // interacting with the value of a resource.
 *     print(`Game state transitioning from ${GameState.read()} to in-game.`)
 *     GameState.write('in-game')
 * }
 * ```
 *
 * @group Core
 */
export function resource<Value extends NonNullable<unknown>>(
	value: Value,
	label?: string,
): Resource<Value> {
	const rawId = world.component<Value>()
	world.set(rawId, rawId, value)
	entityHistory.set(rawId, rawId, value)

	const r = new Resource<Value>(rawId)
		.set(getBuiltin('Resource'))
		.set(getBuiltin('Label'), label ?? `Resource #${rawId}`)
	if (hasThirdPartyCaller()) {
		r.set(getBuiltin('ThirdParty'))
	}
	return r
}
