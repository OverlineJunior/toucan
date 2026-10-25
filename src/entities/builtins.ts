import * as Jecs from '@rbxts/jecs'
import { world } from '../world'
import { addDefaultComponentMetadata, Component as ComponentClass } from '.'
import { bootstrapBuiltins, registerBuiltin } from './builtinRegistry'

export interface BuiltinComponentMap {
	Component: ComponentClass<undefined>
	Resource: ComponentClass<undefined>
	Label: ComponentClass<string>
	Internal: ComponentClass<undefined>
	ThirdParty: ComponentClass<undefined>
	Persistent: ComponentClass<undefined>
	Wildcard: ComponentClass<undefined>
	ChildOf: ComponentClass<undefined>
	AddedByPlugin: ComponentClass<undefined>
	MessageSequence: ComponentClass<number>
	Entity: ComponentClass<undefined>
	QueryHidden: ComponentClass<undefined>
}

export type BuiltinComponentLabels = keyof BuiltinComponentMap

const BUILTINS_WITHOUT_PERSISTENT: BuiltinComponentLabels[] = [
	'Persistent',
	'ChildOf',
]

const Persistent = registerBuiltin(
	'Persistent',
	new ComponentClass<undefined>(world.component()),
)

const Internal = registerBuiltin(
	'Internal',
	new ComponentClass<undefined>(world.component()),
)

const QueryHidden = registerBuiltin(
	'QueryHidden',
	new ComponentClass<undefined>(world.component()),
)

const ThirdParty = registerBuiltin(
	'ThirdParty',
	new ComponentClass<undefined>(world.component()),
)

const Label = registerBuiltin(
	'Label',
	new ComponentClass<string>(world.component()),
)

const Component = registerBuiltin(
	'Component',
	new ComponentClass<undefined>(world.component()),
).set(QueryHidden)

// We reuse Jecs' built-in Wildcard component because it uses it internally.
const Wildcard = registerBuiltin(
	'Wildcard',
	new ComponentClass<undefined>(Jecs.Wildcard),
)

// TODO! Consider making a standard system that removes previous ChildOf
// ! relationships when setting a new one.
const ChildOf = registerBuiltin(
	'ChildOf',
	new ComponentClass<undefined>(Jecs.ChildOf),
)

const Resource = registerBuiltin(
	'Resource',
	new ComponentClass<undefined>(world.component()),
).set(QueryHidden)

const AddedByPlugin = registerBuiltin(
	'AddedByPlugin',
	new ComponentClass<undefined>(world.component()),
)

const MessageSequence = registerBuiltin(
	'MessageSequence',
	new ComponentClass(world.component()),
).set(QueryHidden)

const Entity = registerBuiltin(
	'Entity',
	new ComponentClass<undefined>(world.component()),
)

/**
 * A collection of built-in {@link EntityLike}s.
 */
export const Builtin = {
	/**
	 * Built-in component used to represent parent-child relationships between entities.
	 *
	 * @example
	 * ```ts
	 * const alice = entity()
	 * const bob = entity().set(pair(ChildOf, alice))
	 * assert(bob.parent() === alice)
	 * ```
	 */
	ChildOf,

	/**
	 * Built-in component used to distinguish entities that represent components.
	 */
	Component,

	/**
	 * Built-in component used to distinguish entities created by third-party packages.
	 */
	ThirdParty,

	/**
	 * Built-in component used to distinguish entities created internally by Toucan.
	 */
	Internal,

	/**
	 * Built-in component used by Toucan to assign human-readable labels to entities.
	 */
	Label,

	/**
	 * Built-in component used to...
	 * 1. Mark entities that cannot be despawned by any means;
	 * 2. Mark components that cannot be removed by any means.
	 */
	Persistent,

	/**
	 * Built-in component used to distinguish entities that represent resources.
	 */
	Resource,

	/**
	 * Built-in component that acts as a wildcard in relationship pairs.
	 *
	 *
	 * It can be used to query for all sources or targets of a relationship without caring about the other end of it.
	 *
	 * @example
	 * ```ts
	 * // Query all entities that are children of any other entity.
	 * query(pair(ChildOf, Wildcard)).forEach((child) => {
	 *     const parent = child.targetOf(ChildOf)
	 * })
	 * ```
	 */
	Wildcard,

	/**
	 * Built-in component used as a relation for entities spawned within plugins.
	 */
	AddedByPlugin,

	/**
	 * Built-in component that marks an entity as a message and stores its monotonic
	 * sequence number, used to guarantee emission order.
	 *
	 * Messages are excluded from queries by default. Requiring this component opts
	 * into reading them as regular entities:
	 *
	 * @example
	 * ```ts
	 * query(Builtin.MessageSequence).forEach((message, sequence) => {
	 *     print(`Message #${sequence}`)
	 * })
	 * ```
	 *
	 * @remarks
	 * Prefer `on()` to read messages, as it handles frame lifetime and per-system
	 * cursors for you.
	 */
	MessageSequence,

	/**
	 * Built-in component used to distinguish regular entities from components and resources.
	 */
	Entity,

	/**
	 * Built-in component that marks other components as hidden from queries.
	 *
	 * Entities with a component marked with `QueryHidden` are excluded from queries
	 * by default. Use {@link Query.allow} or {@link Query.allowAll} to include them.
	 *
	 * The default hidden components are `Component`, `Resource` and `MessageSequence`.
	 * That means queries can only see regular entities by default.
	 *
	 * @example
	 * ```ts
	 * const Marker = component()
	 * const Hidden = component().set(Builtin.QueryHidden)
	 *
	 * entity().set(Marker).set(Hidden)
	 *
	 * query(Marker) // Excluded by default.
	 * query(Marker).allow(Hidden) // Included.
	 * ```
	 */
	QueryHidden,
}

bootstrapBuiltins((component, label) => {
	addDefaultComponentMetadata(component, label)

	// Built-in components are defined in the source code, so they are always internal.
	component.set(Internal)

	if (!BUILTINS_WITHOUT_PERSISTENT.includes(label)) {
		component.set(Persistent)
	}
})
