import { useHookState } from "../../topoRuntime"

/**
 * Returns the `os.clock()` time delta between the start of this and the last frame.
 *
 * # Example
 *
 * ```ts
 * function liftAll() {
 *     query(Position).forEach((id, position) => {
 *         id.set(
 *             Position,
 * 			// We use delta time to make the movement frame-independent.
 *             position.add(Vector3.up).mul(useDeltaTime())
 *         )
 *     })
 * }
 * ```
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
