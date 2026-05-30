import { RunService } from '@rbxts/services'
import { Schedule } from './schedule'
import type { SetConfig, SystemSet } from './systemSet'
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

		RunService.Heartbeat.Connect((_dt) => {
			this.runSchedule('first')
			this.runSchedule('preUpdate')
			this.runSchedule('update')
			this.runSchedule('postUpdate')
			this.runSchedule('last')
        })

        RunService.PreRender.Connect((_dt) => this.runSchedule('preRender'))
        RunService.PreAnimation.Connect((_dt) => this.runSchedule('preAnimation'))
        RunService.PreSimulation.Connect((_dt) => this.runSchedule('preSimulation'))
        RunService.PostSimulation.Connect((_dt) => this.runSchedule('postSimulation'))
	}

	private runSchedule(schedule: Schedules): void {
		this.scheduleMap
			.get(schedule)!
			.getSortedSystems()
			.forEach(({ system, runIf }) => {
				if (runIf.every((cond) => cond())) this.runSystem(system)
			})
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

    debug(): void {
        const sorted = this.scheduleMap.get('startup')!.getSortedSystems()
        warn('sorted')
        warn(sorted.map(({ system }) => debug.info(system, 'n')[0]!).join(' -> '))
    }
}

export function scheduler(): Scheduler {
	return new Scheduler()
}
