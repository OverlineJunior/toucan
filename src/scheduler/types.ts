import type { Scheduler } from './scheduler'

export type System<Args extends unknown[] = unknown[]> = (...args: Args) => void

export interface SystemConfig {
	before?: System | System[]
	after?: System | System[]
	inSet?: unknown | unknown[]
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
