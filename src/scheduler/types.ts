import type { Scheduler } from './scheduler'
import type { SystemSet } from './systemSet'

export type SystemFn<Args extends unknown[] = unknown[]> = (...args: Args) => void

export type RunCondition = () => boolean

export interface SystemConfig {
	before?: SystemFn | SystemSet | (SystemFn | SystemSet)[]
	after?: SystemFn | SystemSet | (SystemFn | SystemSet)[]
	inSet?: SystemSet | SystemSet[]
	runIf?: RunCondition | RunCondition[]
}

export type Plugin<Args extends unknown[] = unknown[]> = (
	scheduler: Scheduler,
	...args: Args
) => void

export type StartupSchedules = 'preStartup' | 'startup' | 'postStartup'
export type UpdateSchedules =
	| 'first'
	| 'preUpdate'
	| 'update'
	| 'postUpdate'
	| 'last'
export type RunServiceSchedules =
	| 'preRender'
	| 'preAnimation'
	| 'preSimulation'
	| 'postSimulation'
export type Schedules = StartupSchedules | UpdateSchedules | RunServiceSchedules
