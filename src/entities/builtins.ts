import * as Jecs from '@rbxts/jecs'
import type { PluginFn, Schedules, SystemFn, SystemSet } from '../scheduler'
import type { RunCondition } from '../scheduler/system'
import { world } from '../world'
import { addDefaultComponentMetadata, Component } from '.'
import { bootstrapBuiltins, registerBuiltin } from './builtinRegistry'

/**
 * A collection of built-in {@link Component}s.
 */
export const Builtin = {
	/**
	 * Built-in component used to...
	 * 1. Mark entities that cannot be despawned by any means;
	 * 2. Mark components that cannot be removed by any means.
	 */
	Persistent: registerBuiltin(
		'Persistent',
		new Component<undefined>(world.component()),
	),

	/**
	 * Built-in component used to distinguish entities created internally by Toucan.
	 */
	Internal: registerBuiltin(
		'Internal',
		new Component<undefined>(world.component()),
	),

	/**
	 * Built-in component that marks other components as hidden from queries.
	 *
	 * Entities with a component marked with `QueryHidden` are excluded from queries
	 * by default. Use {@link Query.allow} or {@link Query.allowAll} to include them.
	 *
	 * The default hidden components are {@link Builtin.Component}, {@link Builtin.Resource} and {@link Builtin.MessageSequence}.
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
	QueryHidden: registerBuiltin(
		'QueryHidden',
		new Component<undefined>(world.component()),
	),

	/**
	 * Built-in component used to distinguish entities created by third-party packages.
	 */
	ThirdParty: registerBuiltin(
		'ThirdParty',
		new Component<undefined>(world.component()),
	),

	/**
	 * Built-in component used by Toucan to assign human-readable labels to entities.
	 */
	Label: registerBuiltin('Label', new Component<string>(world.component())),

	/**
	 * Built-in component used to distinguish entities that represent components.
	 */
	Component: registerBuiltin(
		'Component',
		new Component<undefined>(world.component()),
	),

	// We reuse Jecs' built-in Wildcard component because it uses it internally.
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
	Wildcard: registerBuiltin(
		'Wildcard',
		new Component<undefined>(Jecs.Wildcard),
	),

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
	 */
	ChildOf: registerBuiltin('ChildOf', new Component<undefined>(Jecs.ChildOf)),

	/**
	 * Built-in component used to distinguish entities that represent resources.
	 */
	Resource: registerBuiltin(
		'Resource',
		new Component<undefined>(world.component()),
	),

	/**
	 * Built-in component used as a relation for entities spawned within plugins.
	 */
	AddedByPlugin: registerBuiltin(
		'AddedByPlugin',
		new Component<undefined>(world.component()),
	),

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
	 * Prefer {@link Query.on} to read messages, as it handles frame lifetime and per-system
	 * cursors for you.
	 */
	MessageSequence: registerBuiltin(
		'MessageSequence',
		new Component<number>(world.component()),
	),

	/**
	 * Built-in component used to distinguish regular entities from components and resources.
	 */
	Entity: registerBuiltin(
		'Entity',
		new Component<undefined>(world.component()),
	),

	/**
	 * Built-in component used to distinguish entities that represent plugins.
	 *
	 * @group Built-ins
	 */
	Plugin: registerBuiltin(
		'Plugin',
		new Component<{
			fn: PluginFn
			args: unknown[]
			built: boolean
		}>(world.component()),
	),

	/**
	 * Built-in component used to distinguish entities that represent schedules.
	 *
	 * @group Built-ins
	 */
	Schedule: registerBuiltin(
		'Schedule',
		new Component<{ kind: Schedules }>(world.component()),
	),

	/**
	 * Built-in component used to distinguish entities that represent systems.
	 *
	 * @group Built-ins
	 */
	System: registerBuiltin(
		'System',
		new Component<{
			fn: SystemFn
			args: unknown[]
			schedule: Schedules
			before: (SystemFn | SystemSet)[]
			after: (SystemFn | SystemSet)[]
			runIfs: RunCondition[]
			runtimeMs: number
			/**
			 * A system's message cursors, keyed by a signature of the terms it reads
			 * messages with (e.g. `"123"` or `"123,456"`), mapping each to the first
			 * message sequence that the system hasn't read yet.
			 *
			 * Created lazily the first time the system reads messages with {@link Query.on}.
			 */
			cursors?: Map<string, number>
			/**
			 * System sets are ephemeral information for the scheduler - they all get
			 * reduced into systems at runtime.
			 *
			 * @internal
			 */
			_inSets: SystemSet[]
		}>(world.component()),
	),
}

export type Builtin = typeof Builtin

// Object literal properties can't reference each other during initialization.
//
// Those have QueryHidden because a user querying Description, for example, would
// normally expect regular entities only, and not components or messages that share
// that same component.
Builtin.Component.set(Builtin.QueryHidden)
Builtin.Resource.set(Builtin.QueryHidden)
Builtin.MessageSequence.set(Builtin.QueryHidden)

bootstrapBuiltins((component, label) => {
	addDefaultComponentMetadata(component, label)

	// Built-in components are defined in the source code, so they are always internal.
	component.set(Builtin.Internal)

	const builtinsWithoutPersistent: Component[] = [
		// We wanna have the freedom to do quirky stuff like removing persistent components.
		Builtin.Persistent,
		// Removing ChildOf means unparenting a child, which is totally fine.
		Builtin.ChildOf,
	]
	if (!builtinsWithoutPersistent.includes(component)) {
		component.set(Builtin.Persistent)
	}
})
