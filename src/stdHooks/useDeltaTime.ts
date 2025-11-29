import { useHookState } from "../topoRuntime"

/**
 * Returns the `os.clock()` time delta between the start of this and the last frame.
 * @returns The time delta in seconds.
 */
export function useDeltaTime(): number {
	const state = useHookState(
		{ lastTime: os.clock(), deltaTime: 0 },
		// Does not differ by call count.
		'useDeltaTime',
	)

	const now = os.clock()
	state.deltaTime = now - state.lastTime
	state.lastTime = now

	return state.deltaTime
}
