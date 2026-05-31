import { RunService } from '@rbxts/services'
import { System } from '../handle'
import { query } from '../query'
import { Schedule, ScheduleComponent } from './schedule'
import type { SetConfig, SystemSet } from './systemSet'
import type { Schedules, SystemConfig, SystemFn } from './types'

let schedulerAlreadyCreated = false

export class Scheduler {
	private readonly scheduleMap = new Map<Schedules, Schedule>([
		// Startup schedules.
		['preStartup', new Schedule('preStartup')],
		['startup', new Schedule('startup')],
		['postStartup', new Schedule('postStartup')],

		// Update schedules.
		['first', new Schedule('first')],
		['preUpdate', new Schedule('preUpdate')],
		['update', new Schedule('update')],
		['postUpdate', new Schedule('postUpdate')],
		['last', new Schedule('last')],

		// RunService schedules.
		['preRender', new Schedule('preRender')],
		['preAnimation', new Schedule('preAnimation')],
		['preSimulation', new Schedule('preSimulation')],
		['postSimulation', new Schedule('postSimulation')],
	])
	private readonly connections: RBXScriptConnection[] = []
	private running = false

	constructor() {
		if (schedulerAlreadyCreated) {
			error('There can only be one scheduler instance')
		}

		schedulerAlreadyCreated = true
	}

	useSystem(
		schedule: Schedules,
		systemFn: SystemFn,
		config?: SystemConfig,
	): this {
		this.assertNotRunning('useSystem')
		this.scheduleMap.get(schedule)!.useSystem(systemFn, config)
		return this
	}

	useSystemChain(
		schedule: Schedules,
		...systemFns: (SystemFn | [SystemFn, SystemConfig])[]
	): this {
		this.assertNotRunning('useSystemChain')
		this.scheduleMap.get(schedule)!.useSystemChain(...systemFns)
		return this
	}

	configureSet(schedule: Schedules, set: SystemSet, config: SetConfig): this {
		this.assertNotRunning('configureSet')
		this.scheduleMap.get(schedule)!.configureSet(set, config)
		return this
	}

	run() {
		this.assertNotRunning('run')
		this.running = true

		this.runSchedule('preStartup')
		this.runSchedule('startup')
		this.runSchedule('postStartup')

		const c1 = RunService.Heartbeat.Connect((_dt) => {
			this.runSchedule('first')
			this.runSchedule('preUpdate')
			this.runSchedule('update')
			this.runSchedule('postUpdate')
			this.runSchedule('last')
		})

		const c2 = RunService.PreRender.Connect((_dt) =>
			this.runSchedule('preRender'),
		)
		const c3 = RunService.PreAnimation.Connect((_dt) =>
			this.runSchedule('preAnimation'),
		)
		const c4 = RunService.PreSimulation.Connect((_dt) =>
			this.runSchedule('preSimulation'),
		)
		const c5 = RunService.PostSimulation.Connect((_dt) =>
			this.runSchedule('postSimulation'),
		)

		this.connections.push(c1, c2, c3, c4, c5)
	}

	// Scheduler isn't allowed to be instantiated more than once, but our test suite needs to be able to reset it.
	/** @internal */
    _despawn() {
        schedulerAlreadyCreated = false
		this.connections.forEach((c) => c.Disconnect())
		query(System).forEach((e) => e.despawn())
		query(ScheduleComponent).forEach((e) => e.despawn())
	}

	private runSchedule(schedule: Schedules): void {
		this.scheduleMap
			.get(schedule)!
			.getSortedSystems()
			.forEach(({ systemFn, runIf }) => {
				if (runIf.every((cond) => cond())) this.runSystem(systemFn)
			})
	}

	private runSystem(systemFn: SystemFn): void {
		systemFn()
	}

	private assertNotRunning(methodName: string): void {
		assert(
			!this.running,
			`${methodName} cannot be called when the scheduler is already running`,
		)
	}
}

export function scheduler(): Scheduler {
	return new Scheduler()
}
