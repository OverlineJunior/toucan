let simulatingExternal = false

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
	if (simulatingExternal) return true

	const callerScriptPath = debug.info(level + 1, 's')[0]!
	return (
		callerScriptPath.match('node_modules')[0] !== undefined &&
		!isInternal(level)
	)
}

/** @internal */
export function _simulateExternal(callback: () => void): void {
    simulatingExternal = true
    try {
        callback()
    } finally {
        simulatingExternal = false
	}
}
