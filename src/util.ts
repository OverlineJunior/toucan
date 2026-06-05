export type Flatten<T extends unknown[]> = T extends [infer U] ? U : T

export type Nullable<T extends unknown[]> = { [K in keyof T]: T[K] | undefined }

export type WrapLuaTuple<T> = T extends unknown[] ? LuaTuple<T> : T

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

export function cloneMap<K, V>(map: ReadonlyMap<K, V>): Map<K, V> {
	const clone = new Map<K, V>()
	for (const [key, value] of map) {
		clone.set(key, value)
	}
	return clone
}

export function flatMap<T extends defined, U extends defined>(
	array: T[],
	fn: (item: T) => U[],
): U[] {
	const result: U[] = []
	array.forEach((item) => fn(item).forEach((v) => result.push(v)))
	return result
}

export function getOrInit<K, V>(map: Map<K, V>, key: K, init: () => V): V {
	if (!map.has(key)) map.set(key, init())
	return map.get(key)!
}

export function joinUnknown(args: unknown[], separator = ', '): string {
	const parts: string[] = []
	for (const arg of args) {
		parts.push(tostring(arg))
	}
	return parts.join(separator)
}

/**
 * Edge case: if `value` is an empty table, it will be treated as an array.
 */
export function isArray(value: unknown): value is unknown[] {
	if (!typeIs(value, 'table')) return false
	for (const [key] of pairs(value as Record<string | number, unknown>)) {
		if (!typeIs(key, 'number')) return false
	}
	return true
}

export function normalizeToArray<T>(value?: T | T[]): T[] {
	if (value === undefined) return []
	if (isArray(value)) return value as T[]
	return [value as T]
}
