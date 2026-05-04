import { RawId } from "./handle"
import { world } from "./world"

export type Flatten<T extends unknown[]> = T extends [infer U] ? U : T

export type Nullable<T extends unknown[]> = { [K in keyof T]: T[K] | undefined }

export type OneUpToFour<T> = [T] | [T, T] | [T, T, T] | [T, T, T, T]

export type ZeroUpToEight<T> =
	| []
	| [T]
	| [T, T]
	| [T, T, T]
	| [T, T, T, T]
	| [T, T, T, T, T]
	| [T, T, T, T, T, T]
	| [T, T, T, T, T, T, T]
	| [T, T, T, T, T, T, T, T]

export const ECS_PAIR_OFFSET = 2 ** 48
export const ECS_ENTITY_MASK = 0x1000000

export function deepEqual(a: unknown, b: unknown): boolean {
	if (a === b) return true

	if (typeOf(a) !== typeOf(b)) return false

	if (typeIs(a, 'table') && typeIs(b, 'table')) {
		let sizeA = 0
		for (const _ of pairs(a)) sizeA++

		let sizeB = 0
		for (const _ of pairs(b)) sizeB++

		if (sizeA !== sizeB) return false

		for (const [key, value] of pairs(a)) {
			const valueB = (b as Map<unknown, unknown>).get(key)

			if (!deepEqual(value, valueB)) {
				return false
			}
		}

		return true
	}

	return false
}

/**
 * Sometimes (like with Jecs pairs), Jecs strips the 8-bit generation to save space, leaving only a 24-bit index.
 * This function restores the full 32-bit ID by finding which generation (0-255) of the index is currently alive.
 * 
 * As a rule of thumb:
 * - If you're touching memory (like `world.entity_index.sparse_array`), you should strip down
 * the entity ID to its 24-bit index (`id % ECS_ENTITY_MASK`);
 * - If you're touching Jecs' surface API or anything that relies on it (like `resolveId()`), you should
 * restore the full 32-bit ID with this function.
 */
export function getAliveId(index: RawId): RawId {
	if (world.contains(index)) return index

	for (let gen = 1; gen < 256; gen++) {
		const fullId = index + gen * ECS_ENTITY_MASK
		if (world.contains(fullId)) {
			return fullId as RawId
		}
	}

	return index
}
