import { RunService } from '@rbxts/services'
import { Schedule } from './schedule'
import type { Schedules, System, SystemConfig } from './types'

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
	private running = false

	useSystem(schedule: Schedules, system: System, config?: SystemConfig): this {
		this.assertNotRunning('useSystem')
		this.scheduleMap.get(schedule)!.useSystem(system, config)
		return this
	}

	useSystemChain(
		schedule: Schedules,
		...systems: (System | [System, SystemConfig])[]
	): this {
		this.assertNotRunning('useSystemChain')
		this.scheduleMap.get(schedule)!.useSystemChain(...systems)
		return this
	}

	run() {
		this.assertNotRunning('run')

		RunService.Heartbeat.Connect((_dt) => {
			this.scheduleMap
				.get('first')!
				.getSortedSystems()
				.forEach((s) => this.runSystem(s))

			this.scheduleMap
				.get('preUpdate')!
				.getSortedSystems()
				.forEach((s) => this.runSystem(s))

			this.scheduleMap
				.get('update')!
				.getSortedSystems()
				.forEach((s) => this.runSystem(s))

			this.scheduleMap
				.get('postUpdate')!
				.getSortedSystems()
				.forEach((s) => this.runSystem(s))

			this.scheduleMap
				.get('last')!
				.getSortedSystems()
				.forEach((s) => this.runSystem(s))
		})

		this.running = true
	}

	private runSystem(system: System): void {
		system()
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
