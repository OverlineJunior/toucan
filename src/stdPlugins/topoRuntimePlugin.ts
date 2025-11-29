import { plugin } from '../plugin'
import { stdPhases } from '../stdPhases'
import { system } from '../system'
import { cleanupHookState } from '../topoRuntime'

function topoRuntimeCleanup() {
	cleanupHookState()
}

export default plugin((app) => {
	// TODO! This system should run on an absolute last phase.
	// ! Suggestion: app.addPhasesAfter should error when trying to add after last.
	// ! Then we can create a new phase after last called "absoluteLast".
	// ! Unsure if absoluteLast should be public API though.
	app.addSystems(system(topoRuntimeCleanup, stdPhases.last))
})
