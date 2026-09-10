import type { Entity as JecsEntity, World } from '@rbxts/jecs'

/**
 * A numerical entity identifier used internally.
 *
 * @group Types
 */
export type RawId = JecsEntity

export const ECS_PAIR_OFFSET = 2 ** 48
export const ECS_ENTITY_MASK = 0x1000000

/**
 * Due to Roblox's max of 53 bits of integer precision, Jecs' pairs use a stripped ID format (relation's 24 bits + target's 24 bits).
 * Because of this, we need to reconstruct the full ID by checking if the stripped ID exists, and if not, we add the pair offset until we find a match.
 */
function reconstructStrippedId(strippedId: RawId, world: World): RawId {
	if (world.contains(strippedId)) return strippedId

	for (let gen = 1; gen < 256; gen++) {
		const fullId = strippedId + gen * ECS_ENTITY_MASK
		if (world.contains(fullId)) {
			return fullId as RawId
		}
	}

	return strippedId
}

export function isPairId(id: RawId): boolean {
	return id >= ECS_PAIR_OFFSET
}

export function getPairRelationFromId(pairId: RawId, world: World): RawId {
	const strippedId = math.floor(
		(pairId - ECS_PAIR_OFFSET) / ECS_ENTITY_MASK,
	) as RawId
	return reconstructStrippedId(strippedId, world)
}

export function getPairTargetFromId(pairId: RawId, world: World): RawId {
	const strippedId = ((pairId - ECS_PAIR_OFFSET) % ECS_ENTITY_MASK) as RawId
	return reconstructStrippedId(strippedId, world)
}
