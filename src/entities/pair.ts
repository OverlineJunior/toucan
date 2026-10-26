import { pair as jecsPair } from '@rbxts/jecs'
import type { RawId } from '../id'
import type { EntityLike, InferValue } from '.'
import { VALUE_SYMBOL } from '.'

/**
 * A special value for relationship pairs created with {@link pair}.
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

type PairValue<Rel extends EntityLike, Tar extends EntityLike> = [
	InferValue<Rel>,
] extends [undefined]
	? [InferValue<Tar>] extends [never]
		? undefined
		: InferValue<Tar>
	: InferValue<Rel>

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
export function pair<Rel extends EntityLike, Tar extends EntityLike>(
	relation: Rel,
	target: Tar,
): Pair<PairValue<Rel, Tar>> {
	return new Pair(relation, target)
}
