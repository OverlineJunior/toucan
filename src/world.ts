import * as jecs from '@rbxts/jecs'
import type { RawId } from './handle'

type UnsafeWorld = jecs.World & {
	entity_index: {
		dense_array: jecs.Entity[]
		sparse_array: {
			archetype: {
				types: number[]
			}
		}[]
	}
}

export const ECS_PAIR_OFFSET = 2 ** 48
export const ECS_ENTITY_MASK = 0x1000000

export const world = jecs.world()

/**
 * ⚠️ The ID array returned by this function should never be written to or modified in any way.
 */
export function getAllEntityIds(): RawId[] {
	return (world as UnsafeWorld).entity_index.dense_array
}

/**
 * ⚠️ The ID array returned by this function should never be written to or modified in any way.
 */
export function getAllComponentIdsIn(id: RawId): RawId[] {
	const record = (world as UnsafeWorld).entity_index.sparse_array[
		(id % ECS_ENTITY_MASK) - 1
	]
	if (!record) return []

	return record.archetype.types as RawId[]
}
