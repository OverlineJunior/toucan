import { useHookState } from "../topoRuntime"

/**
 * Utility for easy time-based throttling.
 *
 * Accepts a duration, and returns `true` if it has been that long since the last time this function returned `true`.
 * Always returns `true` the first time.
 *
 * Differently from Matter's `useThrottle`, this function returns unique results keyed by call count too, meaning each iteration in a loop will have its own throttle state.
 * @param seconds The duration in seconds to wait before returning `true` again.
 * @param identifier An optional identifier to differentiate between different throttles in the same hook call. Use a constant value to achieve Matter's behavior.
 * @returns `true` if the throttle has expired, `false` otherwise. Always returns `true` the first time.
 */
export function useThrottle(seconds: number, identifier?: unknown): boolean {
	const state = useHookState(
		{} as { time?: number; expiry?: number },
		identifier,
		(state) => os.clock() < (state.expiry ?? 0)
	)

	const now = os.clock()

	if (state.time === undefined || now - state.time >= seconds) {
		state.time = now
		state.expiry = now + seconds
		return true
	}

	return false
}
