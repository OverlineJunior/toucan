import { App } from '../../app'
import { Plugin } from '../../plugin'
import { cleanupHookState } from '../../topoRuntime'
import { ABSOLUTE_LAST } from '../phases'

function topoRuntimeCleanup() {
	cleanupHookState()
}

export class TopoRuntimePlugin implements Plugin {
	build(app: App): void {
		app.addSystems(ABSOLUTE_LAST, [topoRuntimeCleanup])
	}
}
