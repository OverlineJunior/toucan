import * as Jecs from '@rbxts/jecs'
import { world } from '../world'
import { addDefaultComponentMetadata, ComponentHandle } from '.'
import { bootstrapBuiltins, registerBuiltin } from './builtinRegistry'

export interface BuiltinComponentHandleMap {
	Component: ComponentHandle<undefined>
	Resource: ComponentHandle<undefined>
	Label: ComponentHandle<string>
	Internal: ComponentHandle<undefined>
	ThirdParty: ComponentHandle<undefined>
	Persistent: ComponentHandle<undefined>
	Wildcard: ComponentHandle<undefined>
	ChildOf: ComponentHandle<undefined>
	AddedByPlugin: ComponentHandle<undefined>
}

export type BuiltinComponentLabels = keyof BuiltinComponentHandleMap

const BUILTINS_WITHOUT_PERSISTENT: BuiltinComponentLabels[] = [
	'Persistent',
	'ChildOf',
]

/**
 * Built-in component used to...
 * 1. Mark entities that cannot be despawned by any means;
 * 2. Mark components that cannot be removed by any means.
 *
 * @group Built-ins
 */
export const Persistent = registerBuiltin(
	'Persistent',
	new ComponentHandle<undefined>(world.component()),
)

/**
 * Built-in component used to distinguish entities created internally by Toucan.
 *
 * @group Built-ins
 */
export const Internal = registerBuiltin(
	'Internal',
	new ComponentHandle<undefined>(world.component()),
)

/**
 * Built-in component used to distinguish entities created by third-party packages.
 *
 * @group Built-ins
 */
export const ThirdParty = registerBuiltin(
	'ThirdParty',
	new ComponentHandle<undefined>(world.component()),
)

/**
 * Built-in component used by Toucan to assign human-readable labels to entities.
 *
 * @group Built-ins
 */
export const Label = registerBuiltin(
	'Label',
	new ComponentHandle<string>(world.component()),
)

/**
 * Built-in component used to distinguish entities that represent components.
 *
 * @group Built-ins
 */
export const Component = registerBuiltin(
	'Component',
	new ComponentHandle<undefined>(world.component()),
)

// We reuse Jecs' built-in Wildcard component because it uses it internally.
/**
 * Built-in component that acts as a wildcard in queries. It has two use cases:
 * 1. To query for all entities, including variations, such as components, systems and so on;
 * 2. To query for all sources or targets of a relationship, without caring about the other end of the relationship.
 *
 * @example
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
 *
 * @group Built-ins
 */
export const Wildcard = registerBuiltin(
	'Wildcard',
	new ComponentHandle<undefined>(Jecs.Wildcard),
)

// TODO! Consider making a standard system that removes previous ChildOf
// ! relationships when setting a new one.
/**
 * Built-in component used to represent parent-child relationships between entities.
 *
 * @example
 * ```ts
 * const alice = entity()
 * const bob = entity().set(pair(ChildOf, alice))
 * assert(bob.parent() === alice)
 * ```
 *
 * @group Built-ins
 */
export const ChildOf = registerBuiltin(
	'ChildOf',
	new ComponentHandle<undefined>(Jecs.ChildOf),
)

/**
 * Built-in component used to distinguish entities that represent resources.
 *
 * @group Built-ins
 */
export const Resource = registerBuiltin(
	'Resource',
	new ComponentHandle<undefined>(world.component()),
)

/**
 * Built-in component used as a relation for entities spawned within plugins.
 *
 * @group Built-ins
 */
export const AddedByPlugin = registerBuiltin(
	'AddedByPlugin',
	new ComponentHandle<undefined>(world.component()),
)

bootstrapBuiltins((component, label) => {
	addDefaultComponentMetadata(component, label)

	// Built-in components are defined in the source code, so they are always internal.
	component.set(Internal)

	if (!BUILTINS_WITHOUT_PERSISTENT.includes(label)) {
		component.set(Persistent)
	}
})
