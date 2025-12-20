import { VALUE_SYMBOL } from '..'
import { world } from '../../world'
import { ObservableId } from '.'

export class Component<Value = unknown> extends ObservableId<Value> {
	declare [VALUE_SYMBOL]: Value
}

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
export function component<Value = undefined>(): Component<Value> {
	return new Component<Value>(world.component<Value>())
}
