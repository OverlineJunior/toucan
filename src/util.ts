export type FlattenTuple<T extends unknown[]> = T extends [infer U] ? U : LuaTuple<T>

export type Nullable<T extends unknown[]> = { [K in keyof T]: T[K] | undefined }

export type UpToFour<T> = [T] | [T, T] | [T, T, T] | [T, T, T, T]

export type UpToEight<T> =
	| [T]
	| [T, T]
	| [T, T, T]
	| [T, T, T, T]
	| [T, T, T, T, T]
	| [T, T, T, T, T, T]
	| [T, T, T, T, T, T, T]
	| [T, T, T, T, T, T, T, T]
