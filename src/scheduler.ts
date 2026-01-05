import { Scheduler } from '@rbxts/planck'
import { RunService } from '@rbxts/services'
import {
	ABSOLUTE_FIRST,
	POST_SIMULATION,
	PRE_ANIMATION,
	PRE_RENDER,
	PRE_SIMULATION,
	STARTUP_PIPELINE,
	UPDATE_PIPELINE,
} from './std/phases'
import { Plugin, system, System, ThirdParty } from './id'
import { query } from './query'

export function run() {
	const scheduler = new Scheduler()
		.insert(STARTUP_PIPELINE)
		.insert(UPDATE_PIPELINE, RunService, 'Heartbeat')
		.insert(PRE_RENDER, RunService, 'PreRender')
		.insert(PRE_ANIMATION, RunService, 'PreAnimation')
		.insert(PRE_SIMULATION, RunService, 'PreSimulation')
		.insert(POST_SIMULATION, RunService, 'PostSimulation')

	// TODO! Implement safety checks regarding third-party plugins and user precedence.
	function buildPlugins() {
		query(Plugin)
			.collect()
			.filter(([, p]) => !p.built)
			.sort(([p1], [p2]) => {
				const a = p1.has(ThirdParty)
				const b = p2.has(ThirdParty)
				return a === b ? false : !a
			})
			.forEach(([, p]) => {
				p.built = true
				p.build()
			})
	}

	function scheduleSystems() {
		query(System)
			.filter((_, system) => !system.scheduled)
			.forEach((e, system) => {
				const wrappedCallback = () => {
					debug.profilebegin(e.label())
					const t = os.clock()

					system.callback(...system.args)

					debug.profileend()
					system.lastDeltaTime = os.clock() - t
				}

				system.scheduled = true
				scheduler.addSystem(wrappedCallback, system.phase)
			})
	}

	// TODO! Consider if we should guarantee plugin building before system scheduling.
	system(buildPlugins, ABSOLUTE_FIRST)
	system(scheduleSystems, ABSOLUTE_FIRST)

	// Bootstrap the scheduler to run all systems.
	scheduleSystems()

	scheduler.runAll()
}
