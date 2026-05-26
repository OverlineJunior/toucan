import type { Scheduler } from '../../scheduler'
import { cleanupHookState } from '../../topoRuntime'
import { ABSOLUTE_LAST } from '../phases'

function topoRuntimeCleanup() {
	cleanupHookState()
}

export function topoRuntimePlugin(scheduler: Scheduler) {
	scheduler.useSystem(topoRuntimeCleanup, ABSOLUTE_LAST)
}
