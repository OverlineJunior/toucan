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
