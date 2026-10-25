import { pair as jecsPair } from '@rbxts/jecs'
import type { RawId } from '../id'
import type { Component, Entity, EntityLike } from '.'
import { VALUE_SYMBOL } from '.'

/**
 * A special value for relationship pairs created with `pair()`.
 *
 * @group Types
 */
export class Pair<Value = unknown> {
	declare [VALUE_SYMBOL]: Value

	/**
	 * The relation entity of this pair.
	 */
	public readonly relation: EntityLike
	/**
	 * The target entity of this pair.
	 */
	public readonly target: EntityLike
	/** @internal */
	public readonly id: RawId

	constructor(relation: EntityLike, target: EntityLike) {
		this.relation = relation
		this.target = target
		this.id = jecsPair(relation.id, target.id) as unknown as RawId

		const mt = getmetatable(this) as { __eq?: (a: Pair, b: Pair) => boolean }
		mt.__eq = (a, b) => a.id === b.id
	}

	/**
	 * Returns a string representation of this pair.
	 */
	toString() {
		return `Pair #${this.id}`
	}
}

/**
 * Creates a relationship {@link Pair} of `relation -> target` (e.g.: `Likes -> Bob`),
 * where both `relation` and `target` can be either regular entities or components.
 * Pairs can be assigned to any entity, forming something like `Alice → Likes → Bob`.
 *
 * Like components, pairs can be associated with values. The value type of a
 * pair is determined by its `relation` and `target` arguments:
 * - If `relation` is a component with a value, then the pair takes the same value type;
 * - Else if `target` is a component with a value, then the pair takes the same value type;
 * - Otherwise, the pair is a tag pair and does not hold a value.
 *
 * @example
 * ```ts
 * const Likes = component()
 * const Owns = component<number>()
 *
 * const car = entity()
 * const bob = entity()
 *     // Because neither `Likes` nor `car` hold values, we have no value to assign.
 *     .set(pair(Likes, car))
 *     // Because `Owns` holds a number value, the pair takes a number value.
 *     .set(pair(Owns, car), 2)
 * ```
 *
 * @example
 * ```ts
 * const Begin = component()
 * const End = component()
 * const Position = component<Vector3>()
 *
 * const line = entity()
 *     // Because `Begin` and `End` hold no values, those pairs take the value from `Position`.
 *     .set(pair(Begin, Position), new Vector3(0, 0, 0))
 *     .set(pair(End, Position), new Vector3(10, 0, 0))
 * ```
 *
 * @group Core
 */
export function pair<R>(
	relation: Component<R>,
	target: Component<undefined>,
): Pair<R>
export function pair<T>(
	relation: Component<undefined>,
	target: Component<T>,
): Pair<T>
export function pair<R, T>(
	relation: Component<R>,
	target: Component<T>,
): Pair<R>
export function pair<R>(relation: Component<R>, target: Entity): Pair<R>
export function pair<T>(relation: Entity, target: Component<T>): Pair<T>
export function pair(relation: Entity, target: Entity): Pair<undefined>
export function pair(relation: Entity | Component, target: Entity | Component) {
	return new Pair(relation, target)
}
