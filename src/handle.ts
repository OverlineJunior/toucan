import { world } from './world'
import {
	Entity as JecsEntity,
	Wildcard as JecsWildcard,
	ChildOf as JecsChildOf,
} from '@rbxts/jecs'
import { Flatten, Nullable, OneUpToFour } from './util'
import { getPairRelation, getPairTarget, isPair, pair, type Pair } from './pair'
import { Phase } from '@rbxts/planck'
import type { Plugin as PluginBuildFn } from './scheduler'

/**
 * The raw Jecs ID type.
 */
export type RawId = JecsEntity

export type InferValue<T> = T extends { [VALUE_SYMBOL]: infer V } ? V : never

export type InferValues<Ts> = { [K in keyof Ts]: InferValue<Ts[K]> }

// We use this as a key to a "phantom property" on Id subclasses to represent
// their value type. With this, we:
// 1. Allow Typescript to infer the value type of Id subclasses with `InferValue`;
// 2. Hide the property from the user.
export declare const VALUE_SYMBOL: unique symbol

// Used to store the previous component values for a specific entity when they are updated.
class EntityHistory {
	// Reads as `EntityId -> ComponentId -> PreviousValue`.
	private readonly history = new Map<RawId, Map<RawId, unknown>>()

	get(entityId: RawId, componentId: RawId): unknown | undefined {
		return this.history.get(entityId)?.get(componentId)
	}

	set(entityId: RawId, componentId: RawId, value: unknown): void {
		let hist = this.history.get(entityId)
		if (!hist) {
			hist = new Map<RawId, unknown>()
			this.history.set(entityId, hist)
		}
		hist.set(componentId, value)
	}

	deleteComponent(entityId: RawId, componentId: RawId): void {
		this.history.get(entityId)?.delete(componentId)
	}

	clearComponents(entityId: RawId): void {
		this.history.get(entityId)?.clear()
	}

	deleteEntity(entityId: RawId): void {
		this.history.delete(entityId)
	}
}

export const entityHistory = new EntityHistory()

/**
 * Returns the appropriate handle for `rawId`, or `undefined` if it does not exist in the world.
 */
export function resolveId(rawId: RawId): EntityHandle | ComponentHandle | ResourceHandle | undefined {
	if (!world.contains(rawId)) {
		return
	}

	if (world.has(rawId, Component.id)) {
		return new ComponentHandle(rawId)
	} else if (world.has(rawId, Resource.id)) {
		return new ResourceHandle(rawId)
	} else if (world.has(rawId, Label.id)) {
		// Every entity created through Toucan has a Label, the ones that
		// don't are Jecs internals that we intentionally ignore.
		// Because we ignore them, the user doesn't even know they exist.
		return new EntityHandle(rawId)
	}
}

function isInternal(): boolean {
	const callerScriptPath = debug.info(2, 's')[0]
	return callerScriptPath.match('node_modules.@rbxts.toucan')[0] !== undefined
}

function isExternal(): boolean {
	const callerScriptPath = debug.info(2, 's')[0]
	return callerScriptPath.match('node_modules')[0] !== undefined
}

// -----------------------------------------------------------------------------
// Handle
// -----------------------------------------------------------------------------

/**
 * The base class that represents any kind of entity, may it be a simple entity,
 * a component, or any other variation.
 *
 * Although the type means Typescript doesn't know the exact entity variation,
 * it is known at runtime. Because of this, one that knows the exact variation
 * can simply type cast it, like so:
 * ```ts
 * const Person = component()
 * const bob = entity().set(Person)
 *
 * query(Person).forEach((handle) => {
 *     // We know for sure that we won't be giving the `Person` component to anything
 *     // other than simple entities, so we can safely type cast it as one.
 *     const entity = handle as EntityHandle
 * })
 * ```
 */
export abstract class Handle {
	constructor(
		/**
		 * The numeric ID underlying this handle.
		 *
		 * Meant to be used when one cannot use the higher-level abstractions
		 * provided by Toucan, such as storing an entity's ID in an
		 * instance's attribute, which cannot hold complex data structures.
		 *
		 * In order to get back the high-level handle from an ID, use the
		 * `resolveId` function.
		 */
		public readonly id: RawId,
	) {
		const mt = getmetatable(this) as { __eq?: (a: Handle, b: Handle) => boolean }
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
	set(tagComponent: ComponentHandle<undefined>): this
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
	set<V>(component: ComponentHandle<V>, value: NoInfer<V>): this
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
	set(term: ComponentHandle | Pair, value?: unknown) {
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
	get<Args extends OneUpToFour<ComponentHandle | Pair>>(
		...componentsOrPairs: Args
	): Flatten<Nullable<InferValues<Args>>> {
		return world.get(this.id, ...(componentsOrPairs.map((c) => c.id) as OneUpToFour<RawId>)) as Flatten<
			Nullable<InferValues<Args>>
		>
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
	has(...componentsOrPairs: OneUpToFour<ComponentHandle | Pair>): boolean {
		return world.has(this.id, ...(componentsOrPairs.map((c) => c.id) as OneUpToFour<RawId>))
	}

	/**
	 * Removes a component or relationship pair from this entity.
	 */
	remove(componentOrPair: ComponentHandle | Pair): this {
		world.remove(this.id, componentOrPair.id)
		entityHistory.deleteComponent(this.id, componentOrPair.id)
		return this
	}

	/**
	 * Clears all components and relationship pairs from this entity, but
	 * does not despawn the entity.
	 */
	clear(): this {
		world.clear(this.id)
		entityHistory.clearComponents(this.id)
		return this
	}

	/**
	 * Returns all components associated with this entity.
	 */
	components(): ComponentHandle[] {
		const comps: ComponentHandle[] = []
		const record = world.entity_index.sparse_array[this.id - 1]
		if (!record) return comps

		record.archetype.types.forEach((compId_) => {
			const compId = compId_ as RawId
			if (isPair(compId)) return

			const handle = resolveId(compId as RawId)
			if (handle) {
				comps.push(handle as ComponentHandle)
			}
		})

		return comps
	}

	/**
	 * Returns all relationship pairs associated with this entity.
	 */
	relationships(): Pair[] {
		const rels: Pair[] = []
		const record = world.entity_index.sparse_array[this.id - 1]
		if (!record) return rels

		record.archetype.types.forEach((compId_) => {
			const compId = compId_ as RawId
			if (!isPair(compId)) return

			const relationHandle = resolveId(getPairRelation(compId))
			const targetHandle = resolveId(getPairTarget(compId))

			if (relationHandle && targetHandle) {
				rels.push(pair(relationHandle as EntityHandle, targetHandle as EntityHandle))
			}
		})

		return rels
	}

	/**
	 * Gets the label assigned to this entity.
	 */
	toString(): string {
		return this.get(Label)!
	}

	/**
	 * Gets the parent (the target of a `ChildOf` relationship) for this entity, if such a relationship exists.
	 *
	 * @example
	 * ```ts
	 * const alice = entity()
	 * const charlie = entity().set(pair(ChildOf, alice))
	 *
	 * const parent = charlie.parent() // alice
	 * ```
	 */
	parent(): Handle | undefined {
		const parentId = world.parent(this.id)
		return parentId ? resolveId(parentId)! : undefined
	}

	/**
	 * Gets all children (the sources of `ChildOf` relationships) for this entity.
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
	children(): Handle[] {
		const childIds = []
		for (const id of world.children(this.id)) {
			childIds.push(resolveId(id)!)
		}
		return childIds
	}

	/**
	 * Returns `true` if this entity exists.
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
	targetOf(relation: ComponentHandle, nth = 0): Handle | undefined {
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
	targetsOf(relation: ComponentHandle): Handle[] {
		const targets: Handle[] = []
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
	 */
	despawn(): void {
		world.delete(this.id)
		entityHistory.deleteEntity(this.id)
	}
}

// -----------------------------------------------------------------------------
// Entity
// -----------------------------------------------------------------------------

export class EntityHandle extends Handle {
	declare protected readonly __brand: 'entity'
}

/**
 * Spawns a new, empty entity and returns it.
 *
 * Additionally, a `label` can be provided for easier identification during debugging.
 */
export function entity(label?: string): EntityHandle {
	const rawId = world.entity()
	const handle = new EntityHandle(rawId).set(Label, label ?? `Entity #${rawId}`)

	if (isInternal()) {
		handle.set(Internal)
	} else if (isExternal()) {
		handle.set(External)
	}

	return handle
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export class ComponentHandle<Value = unknown> extends Handle {
	declare [VALUE_SYMBOL]: Value
}

/**
 * Creates a new component.
 *
 * Additionally, a `label` can be provided for easier identification during debugging.
 *
 * @exampl
 * ```ts
 * // A component with a value.
 * const Health = component<number>()
 *
 * // A tag component.
 * const IsAlive = component()
 * ```
 */
export function component<Value = undefined>(label?: string): ComponentHandle<Value> {
	const rawId = world.component<Value>()
	const handle = new ComponentHandle<Value>(rawId).set(Component).set(Label, label ?? `Component #${rawId}`)

	if (isInternal()) {
		handle.set(Internal)
	} else if (isExternal()) {
		handle.set(External)
	}

	return handle
}

// -----------------------------------------------------------------------------
// Resource
// -----------------------------------------------------------------------------

export class ResourceHandle<Value = unknown> extends Handle {
	declare [VALUE_SYMBOL]: Value

	/**
	 * Returns the current value of this resource.
	 *
	 * Not to be confused with `get`, which can be used to retrieve the value of
	 * components attached to resources, just like with entities.
	 */
	read(): Value {
		return this.get(this) as Value
	}

	/**
	 * Updates the value of the resource.
	 *
	 * Not to be confused with `set`, which can be used to set the value of
	 * components attached to resources, just like with entities.
	 */
	write(value: Value): this {
		this.set(this, value)
		return this
	}

	/**
	 * Registers a listener that is called whenever the value of this resource changes.
	 *
	 * The returned function can be called to unregister the listener.
	 */
	changed(listener: (newValue: Value) => void): () => void {
		return world.changed(this.id, (_a, _b, v) => {
			listener(v as Value)
		})
	}
}

/**
 * Creates a new resource with the given initial `value`.
 *
 * Resources exist independently of entities (and cannot be attached to them).
 * They are useful to represent global state, such as game state, settings and so on.
 *
 * Additionally, a `label` can be provided for easier identification during debugging.
 *
 * @exampl
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
 */
export function resource<Value extends NonNullable<unknown>>(value: Value, label?: string): ResourceHandle<Value> {
	const rawId = world.component<Value>()
	world.set(rawId, rawId, value)

	const handle = new ResourceHandle<Value>(rawId).set(Resource).set(Label, label ?? `Resource #${rawId}`)

	if (isInternal()) {
		handle.set(Internal)
	} else if (isExternal()) {
		handle.set(External)
	}

	return handle
}

// -----------------------------------------------------------------------------
// Bootstrapped Standards
// -----------------------------------------------------------------------------

/**
 * Built-in component used to distinguish entities created internally by Toucan.
 */
export const Internal = new ComponentHandle<undefined>(world.component())

/**
 * Built-in component used to distinguish entities created externally by packages.
 */
export const External = new ComponentHandle<undefined>(world.component())

/**
 * Built-in component used to assign human-readable labels to entities.
 *
 * Assigned to all entities, even if a custom label is not provided.
 */
export const Label = new ComponentHandle<string>(world.component())

/**
 * Built-in component used to distinguish entities that represent components.
 */
export const Component = new ComponentHandle<undefined>(world.component())

// We reuse Jecs' built-in Wildcard component because it uses it internally.
/**
 * Built-in component that acts as a wildcard in queries. It has two use cases:
 * 1. To query for all entities, including variations, such as components, systems and so on;
 * 2. To query for all sources or targets of a relationship, without caring about the other end of the relationship.
 *
 * @exampl
 * ```ts
 * // 1. Query all simple entities (entities that are not also components, systems, resources or plugins):
 * query(Wildcard).withoutAny(Component, System, Resource, Plugin).forEach((id) => {
 *     ...
 * })
 *
 * // 2. Query all entities that are children of any other entity:
 * query(pair(ChildOf, Wildcard)).forEach((child) => {
 *     const parent = child.targetOf(ChildOf)
 * })
 * ```
 */
export const Wildcard = new ComponentHandle<unknown>(JecsWildcard)

// TODO! Consider making a standard system that removes previous ChildOf
// ! relationships when setting a new one.
/**
 * Built-in component used to represent parent-child relationships between entities.
 *
 * @exampl
 * ```ts
 * const alice = entity()
 * const bob = entity().set(pair(ChildOf, alice))
 * assert(bob.parent() === alice)
 * ```
 */
export const ChildOf = new ComponentHandle<undefined>(JecsChildOf)

Internal.set(Component)
Internal.set(Label, 'Internal')
Internal.set(Internal)

External.set(Component)
External.set(Label, 'External')
External.set(Internal)

Label.set(Component)
Label.set(Label, 'Label')
Label.set(Internal)

Component.set(Component)
Component.set(Label, 'Component')
Component.set(Internal)

Wildcard.set(Component)
Wildcard.set(Label, 'Wildcard')
Wildcard.set(Internal)

ChildOf.set(Component)
ChildOf.set(Label, 'ChildOf')
ChildOf.set(Internal)

// -----------------------------------------------------------------------------
// Other Standards
// -----------------------------------------------------------------------------

/**
 * Built-in component used to distinguish entities that represent resources.
 */
export const Resource = component('Resource')

/**
 * Built-in component used to distinguish entities that represent systems.
 */
export const System = component<{
	callback: (...args: defined[]) => void
	phase: Phase
	args: defined[]
	scheduled: boolean
	lastDeltaTime: number
}>('System')

/**
 * Built-in component used to distinguish entities that represent plugins.
 */
export const Plugin = component<{
	build: PluginBuildFn<defined[]>
	built: boolean
	args: defined[]
}>('Plugin')
