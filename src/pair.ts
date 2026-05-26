import { pair as jecsPair } from '@rbxts/jecs'
import type {
	ComponentHandle,
	EntityHandle,
	Handle,
	RawId,
	VALUE_SYMBOL,
} from './handle'
import { ECS_ENTITY_MASK, ECS_PAIR_OFFSET, world } from './world'

/**
 * Due to Roblox's max of 53 bits of integer precision, Jecs' pairs use a stripped ID format (relation's 24 bits + target's 24 bits).
 * Because of this, we need to reconstruct the full ID by checking if the stripped ID exists, and if not, we add the pair offset until we find a match.
 */
function reconstructStrippedId(strippedId: RawId): RawId {
	if (world.contains(strippedId)) return strippedId

	for (let gen = 1; gen < 256; gen++) {
		const fullId = strippedId + gen * ECS_ENTITY_MASK
		if (world.contains(fullId)) {
			return fullId as RawId
		}
	}

	return strippedId
}

export function isPair(id: RawId): boolean {
	return id >= ECS_PAIR_OFFSET
}

export function getPairRelationFromId(pairId: RawId): RawId {
	const strippedId = math.floor(
		(pairId - ECS_PAIR_OFFSET) / ECS_ENTITY_MASK,
	) as RawId
	return reconstructStrippedId(strippedId)
}

export function getPairTargetFromId(pairId: RawId): RawId {
	const strippedId = ((pairId - ECS_PAIR_OFFSET) % ECS_ENTITY_MASK) as RawId
	return reconstructStrippedId(strippedId)
}

/**
 * A special handle for relationship pairs created with `pair()`.
 *
 * @group Core ECS
 */
export class Pair<Value = unknown> {
	declare [VALUE_SYMBOL]: Value

	public readonly relation: Handle
	public readonly target: Handle
	/** @internal */
	public readonly id: RawId

	constructor(relation: Handle, target: Handle) {
		this.relation = relation
		this.target = target
		this.id = jecsPair(relation.id, target.id) as unknown as RawId

		const mt = getmetatable(this) as { __eq?: (a: Pair, b: Pair) => boolean }
		mt.__eq = (a, b) => a.id === b.id
	}

	toString() {
		return `Pair #${this.id}`
	}
}

/**
 * Creates a relationship _pair_ `relation → target` (e.g.: `Likes → Bob`),
 * where both `relation` and `target` can be either _entities_ or _components_.
 * Pairs can be assigned to any _id_, forming something like `Alice → Likes → Bob`.
 *
 * Like _components_, _pairs_ can be associated to values. The value type of a
 * _pair_ is determined by its `relation` and `target` arguments:
 *
 * - If `relation` is a _component_ with a value, then the _pair_ takes the same value type;
 * - Else if `target` is a _component_ with a value, then the _pair_ takes the same value type;
 * - Otherwise, the _pair_ is a _tag pair_ and does not hold a value.
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
 * @group Core ECS
 */
export function pair<R>(
	relation: ComponentHandle<R>,
	target: ComponentHandle<undefined>,
): Pair<R>
export function pair<T>(
	relation: ComponentHandle<undefined>,
	target: ComponentHandle<T>,
): Pair<T>
export function pair<R, T>(
	relation: ComponentHandle<R>,
	target: ComponentHandle<T>,
): Pair<R>
export function pair<R>(
	relation: ComponentHandle<R>,
	target: EntityHandle,
): Pair<R>
export function pair<T>(
	relation: EntityHandle,
	target: ComponentHandle<T>,
): Pair<T>
export function pair(
	relation: EntityHandle,
	target: EntityHandle,
): Pair<undefined>
export function pair(
	relation: EntityHandle | ComponentHandle,
	target: EntityHandle | ComponentHandle,
) {
	return new Pair(relation, target)
}
