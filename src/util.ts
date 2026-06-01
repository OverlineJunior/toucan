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

/**
 * Returns `true` if the caller script is internal to Toucan (i.e. belongs to the Toucan package).
 *
 * A `level` of 1 represents the function which is calling `isInternal`. 2 represents the function that
 * called that function, and so on. Out-of-bounds values will throw an error.
 */
export function isInternal(level: number): boolean {
	const callerScriptPath = debug.info(level + 1, 's')[0]!
	return callerScriptPath.match('node_modules.*toucan')[0] !== undefined
}

/**
 * Returns `true` if the caller script is external to Toucan (i.e. belongs to a package other than Toucan).
 *
 * A `level` of 1 represents the function which is calling `isExternal`. 2 represents the function that
 * called that function, and so on. Out-of-bounds values will throw an error.
 */
export function isExternal(level: number): boolean {
	const callerScriptPath = debug.info(level + 1, 's')[0]!
	return (
		callerScriptPath.match('node_modules')[0] !== undefined &&
		!isInternal(level)
	)
}

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
    const parts: string[] = [];
    for (const arg of args) {
        parts.push(tostring(arg));
    }
    return parts.join(separator);
}
