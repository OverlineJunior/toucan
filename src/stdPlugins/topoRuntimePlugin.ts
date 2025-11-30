import { plugin } from '../plugin'
import { internalPhases } from '../stdPhases'
import { system } from '../system'
import { cleanupHookState } from '../topoRuntime'

function topoRuntimeCleanup() {
	cleanupHookState()
}

export default plugin((app) => {
	app.addSystems(system(topoRuntimeCleanup, internalPhases.absoluteLast))
})
