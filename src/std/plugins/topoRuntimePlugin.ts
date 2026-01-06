import { cleanupHookState } from '../../topoRuntime'
import { ABSOLUTE_LAST } from '../phases'
import { Scheduler } from '../../scheduler'

function topoRuntimeCleanup() {
	print('Cleaning up topo runtime hook state...')
	cleanupHookState()
}

export function topoRuntimePlugin(scheduler: Scheduler) {
	scheduler.useSystem(topoRuntimeCleanup, ABSOLUTE_LAST)
}
