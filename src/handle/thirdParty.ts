let simulatingThirdParty = false

/**
 * Simulates a third-party caller for the duration of the provided callback.
 *
 * @remarks
 * This is primarily used for testing - use at your own risk.
 */
export function __simulateThirdParty(callback: () => void): void {
	simulatingThirdParty = true
	try {
		callback()
	} finally {
		simulatingThirdParty = false
	}
}

/**
 * Determines if the current call stack includes a third-party caller.
 */
export function hasThirdPartyCaller(): boolean {
	if (simulatingThirdParty) return true

	let level = 1

	while (true) {
		const callerPath = debug.info(level, 's')[0]
		if (callerPath === undefined) break

		const isInPackage = callerPath.match('node_modules')[0] !== undefined
		if (isInPackage) {
			const isToucan =
				callerPath.match('%.toucan%.')[0] !== undefined ||
				string.match(callerPath, '%.toucan$')[0] !== undefined
			if (!isToucan) return true
		} else {
			return false
		}

		level++
	}

	return false
}
