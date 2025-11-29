interface Storage<S extends object> {
	state: S
	accessed: boolean
	cleanup?: CleanupFn<S>
}

export type CleanupFn<S extends object> = (state: S) => boolean | void

const keyStorage = new Map<string, Storage<any>>()
const frameCallCounts = new Map<string, number>()

/**
 * **Don't use this function directly in your systems.**
 *
 * This function is used for implementing your own topologically-aware functions. It should not be used in your
 * systems directly. You should use this function to implement your own utilities, similar to `useEvent` and
 * `useThrottle`.
 * :::
 *
 * `useHookState` does one thing: it returns a table. An empty, pristine table. Here's the cool thing though:
 * it always returns the *same* table, based on the script and line where *your function* (the function calling
 * `useHookState`) was called.
 *
 * ### Uniqueness
 *
 * If your function is called multiple times from the same line, perhaps within a loop, the default behavior of
 * `useHookState` is to uniquely identify these by call count, and will return a unique table for each call.
 *
 * However, you can override this behavior: you can choose to key by any other value. This means that in addition to
 * script and line number, the storage will also only return the same table if the unique value (otherwise known as the
 * "discriminator") is the same.
 *
 * ### Cleaning up
 *
 * As a second optional parameter, you can pass a function that is automatically invoked when your storage is about
 * to be cleaned up. This happens when your function (and by extension, `useHookState`) ceases to be called again
 * next frame (keyed by script, line number, and discriminator).
 *
 * Your cleanup callback is passed the storage table that's about to be cleaned up. You can then perform cleanup work,
 * like disconnecting events.
 *
 * *Or*, you could return `true`, and abort cleaning up altogether. If you abort cleanup, your storage will stick
 * around another frame (even if your function wasn't called again). This can be used when you know that the user will
 * (or might) eventually call your function again, even if they didn't this frame. (For example, caching a value for
 * a number of seconds).
 *
 * If cleanup is aborted, your cleanup function will continue to be called every frame, until you don't abort cleanup,
 * or the user actually calls your function again.
 *
 * ### Example: useThrottle
 *
 * This is the entire implementation of the built-in `useThrottle` function:
 *
 * ```ts
 * export function useThrottle(seconds: number, identifier?: unknown): boolean {
 *     const state = useHookState(
 *         {} as { time?: number; expiry?: number },
 *         identifier,
 *         (state) => os.clock() < (state.expiry ?? 0)
 *     );
 *
 *     const now = os.clock();
 *
 *     if (state.time === undefined || now - state.time >= seconds) {
 *         state.time = now;
 *         state.expiry = now + seconds;
 *         return true;
 *     }
 *
 *     return false;
 * }
 * ```
 *
 * A lot of talk for something so simple, right?
 *
 * @param initial - The initial storage object.
 * @param identifier - A unique value to additionally key by (optional).
 * @param cleanup - A function to run when the storage for this hook is cleaned up (optional).
 * @returns The persistent hook storage object.
 */
export function useHookState<S extends object>(initial: S, identifier?: any, cleanup?: CleanupFn<S>): S {
	const [file, line] = debug.info(3, 'sl')
	const [hookFn] = debug.info(2, 'f')
	const baseKey = `${hookFn}:${file}:${line}`

	// Used to uniquely identify hook calls within the same function and line.
	let extraKey
	if (identifier) {
		extraKey = identifier
	} else {
		const count = (frameCallCounts.get(baseKey) ?? 0) + 1
		frameCallCounts.set(baseKey, count)
		extraKey = count
	}

	const key = `${baseKey}:${extraKey}`

	if (!keyStorage.has(key)) {
		keyStorage.set(key, { state: initial, accessed: false, cleanup })
	}

	const storage = keyStorage.get(key)!
	storage.accessed = true

	return storage.state as S
}

// Should be the last function called in a frame, to clean up unused hook states.
export function cleanupHookState() {
	frameCallCounts.clear()

	keyStorage.forEach((storage, key) => {
		if (storage.accessed) {
			storage.accessed = false
		} else {
			const keep = storage.cleanup && storage.cleanup(storage.state) === true
			if (keep) {
				return
			}

			keyStorage.delete(key)
		}
	})
}
