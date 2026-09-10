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
 * Returns the appropriate handle for `rawId`, or `undefined` if it does not exist in the world.
 *
 * @group Core
 */
export function resolveId(
	rawId: RawId,
): EntityHandle | ComponentHandle | ResourceHandle | undefined {
	if (!world.contains(rawId)) {
		return
	}

	if (world.has(rawId, getBuiltin('Component').id)) {
		return new ComponentHandle(rawId)
	} else if (world.has(rawId, getBuiltin('Resource').id)) {
		return new ResourceHandle(rawId)
	} else if (world.has(rawId, getBuiltin('Label').id)) {
		// Every entity created through Toucan has a Label, the ones that
		// don't are Jecs internals that we intentionally ignore.
		// Because we ignore them, the user doesn't even know they exist.
		return new EntityHandle(rawId)
	}
}

let simulatingThirdParty = false
/** @internal */
export function _simulateThirdParty(callback: () => void): void {
	simulatingThirdParty = true
	try {
		callback()
	} finally {
		simulatingThirdParty = false
	}
}
function hasThirdPartyCaller(): boolean {
	if (simulatingThirdParty) return true

	let level = 1

	while (true) {
		const callerPath = debug.info(level, 's')[0]
		if (callerPath === undefined) break

		const isInPackage = callerPath.match('node_modules')[0] !== undefined
		if (isInPackage) {
			const isToucan =
				callerPath.match('%.toucan%.')[0] !== undefined ||
				string.match(callerPath, '%.toucan$')[0] !== undefined
			if (!isToucan) return true
		} else {
			return false
		}

		level++
	}

	return false
}

// -----------------------------------------------------------------------------
// Handle
// -----------------------------------------------------------------------------

/**
 * A generic handle that represents any special kind of entity, such as a component or a resource.
 *
 * Although the type means Typescript doesn't know the exact kind of entity,
 * it is known at runtime. Because of this, if you already know the kind, you
 * can simply type cast it:
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
 *
 * @group Types
 */
export abstract class Handle {
	constructor(
		/**
		 * A numerical entity identifier used internally.
		 *
		 * Useful when you cannot pass the entire handle to something, but can pass
		 * its numerical ID instead. For example, storing an entity's ID in an
		 * instance's attribute, which cannot hold complex data structures.
		 *
		 * In order to get back the appropriate handle from an ID, use the
		 * `resolveId` function.
		 */
		public readonly id: RawId,
	) {
		const mt = getmetatable(this) as {
			__eq?: (a: Handle, b: Handle) => boolean
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
	has(...componentsOrPairs: OneUpToFour<ComponentHandle | Pair>): boolean {
		return world.has(
			this.id,
			...(componentsOrPairs.map((c) => c.id) as OneUpToFour<RawId>),
		)
	}

	/**
	 * Removes a component or relationship pair from this entity.
	 *
	 * Throws an error if trying to remove a component or relationship pair
	 * with the `Persistent` component (i.e. most built-in components).
	 */
	remove(componentOrPair: ComponentHandle | Pair): this {
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
	 * Components and relationship pairs with the `Persistent` component
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
	components(): ComponentHandle[] {
		const comps: ComponentHandle[] = []

		getAllComponentIdsIn(this.id).forEach((compId_) => {
			const compId = compId_ as RawId
			if (isPairId(compId)) return
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

		getAllComponentIdsIn(this.id).forEach((compId_) => {
			const compId = compId_ as RawId
			if (!isPairId(compId)) return

			const relationId = getPairRelationFromId(compId, world)
			const targetId = getPairTargetFromId(compId, world)

			const relationHandle = resolveId(relationId)
			const targetHandle = resolveId(targetId)

			if (relationHandle && targetHandle) {
				rels.push(
					pair(relationHandle as EntityHandle, targetHandle as EntityHandle),
				)
			}
		})

		return rels
	}

	/**
	 * Gets the label assigned to this entity.
	 */
	toString(): string {
		return this.get(getBuiltin('Label'))!
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
 * A handle for entities spawned with `entity()`.
 *
 * @group Types
 */
export class EntityHandle extends Handle {
	protected declare readonly __brand: 'entity'
}

/**
 * Spawns a new, empty {@link EntityHandle} and returns it.
 *
 * Additionally, a `label` can be provided for easier identification.
 *
 * @group Core
 */
export function entity(label?: string): EntityHandle {
	const rawId = world.entity()
	const handle = new EntityHandle(rawId).set(
		getBuiltin('Label'),
		label ?? `Entity #${rawId}`,
	)

	if (hasThirdPartyCaller()) {
		handle.set(getBuiltin('ThirdParty'))
	}

	const activePlugin = getActivePluginEntity()
	if (activePlugin !== undefined) {
		handle.set(pair(getBuiltin('AddedByPlugin'), activePlugin))
	}

	return handle
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

/**
 * A handle for components spawned with `component()`.
 *
 * @group Types
 */
export class ComponentHandle<Value = unknown> extends Handle {
	declare [VALUE_SYMBOL]: Value
}

/**
 * Creates a new {@link ComponentHandle}.
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
export function component<Value = undefined>(
	label?: string,
): ComponentHandle<Value> {
	const rawId = world.component<Value>()
	return addDefaultComponentMetadata(
		new ComponentHandle<Value>(rawId),
		label ?? `Component #${rawId}`,
	)
}

/**
 * Adds metadata components that **every** component should have.
 */
export function addDefaultComponentMetadata<C extends ComponentHandle>(
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
 * A handle for resources spawned with `resource()`.
 *
 * @group Types
 */
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
 * Creates a new {@link ResourceHandle} with the given initial `value`.
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
): ResourceHandle<Value> {
	const rawId = world.component<Value>()
	world.set(rawId, rawId, value)

	const handle = new ResourceHandle<Value>(rawId)
		.set(getBuiltin('Resource'))
		.set(getBuiltin('Label'), label ?? `Resource #${rawId}`)
	if (hasThirdPartyCaller()) {
		handle.set(getBuiltin('ThirdParty'))
	}
	return handle
}
