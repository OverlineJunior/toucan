import { Component } from '../id/observableId/component'
import { Component as JecsComponent, Wildcard as JecsWildcard, ChildOf as JecsChildOf } from '@rbxts/jecs'

/**
 * Built-in _component__ meant to be used as a wildcard in relationship queries.
 *
 * # Example
 *
 * ```ts
 * // Query all entities that are children of any other entity.
 * query(pair(ChildOf, Wildcard)).forEach((child, parent) => { ... })
 * ```
 */
export const Wildcard = new Component<unknown>(JecsWildcard)

/**
 * Built-in _component_ used to distinguish _entities_ that are _components_.
 * Automatically assigned to all _components_ created via the `component` function.
 */
export const ComponentTag = new Component<undefined>(JecsComponent)

// TODO! Consider making a standard system that removes previous ChildOf
// ! relationships when setting a new one.
/**
 * Built-in _component_ used to define parent-child relationships between _entities_.
 *
 * # Example
 *
 * ```ts
 * const alice = entity()
 * const bob = entity().set(pair(ChildOf, alice))
 * ```
 */
export const ChildOf = new Component<undefined>(JecsChildOf)
