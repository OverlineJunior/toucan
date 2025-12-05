import { Entity, component as jecsComponent, Tag, meta } from '@rbxts/jecs'

/**
 * Creates a new _component_.
 *
 * # Example
 *
 * ```ts
 * // A component with a value.
 * const Health = component<number>()
 *
 * // A tag component.
 * const IsAlive = component()
 * ```
 */
export function component<Value = undefined>(): Value extends undefined ? Tag : Entity<Value> {
	return jecsComponent() as Value extends undefined ? Tag : Entity<Value>
}

/**
 * Creates a new _resource_ with the given initial value.
 *
 * _Resources_ are components that always hold a value themselves, rather than
 * having an entity associated with them. They are useful to represent global state,
 * such as game state, settings and so on.
 *
 * # Example
 *
 * ```ts
 * const GameState = resource('lobby')
 *
 * // Later, in a system:
 * function startGame({ world }: SystemContext) {
 *     print(`Game state transitioning from ${world.get(GameState)} to in-game.`)
 *     world.set(GameState, 'in-game')
 * }
 * ```
 */
export function resource<Value>(value: Value): Entity<Value> {
	const comp = jecsComponent<Value>()
	meta(comp, comp, value)
	return comp
}
