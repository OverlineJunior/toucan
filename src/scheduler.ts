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
import { Plugin, system, System } from './id'
import { query } from './query'

export function run() {
	const scheduler = new Scheduler()
		.insert(STARTUP_PIPELINE)
		.insert(UPDATE_PIPELINE, RunService, 'Heartbeat')
		.insert(PRE_RENDER, RunService, 'PreRender')
		.insert(PRE_ANIMATION, RunService, 'PreAnimation')
		.insert(PRE_SIMULATION, RunService, 'PreSimulation')
		.insert(POST_SIMULATION, RunService, 'PostSimulation')

	query(Plugin).forEach((_, plugin) => {
		plugin.build()
	})

	function schedulePlugins() {
		query(Plugin)
			.filter((_, plugin) => !plugin.built)
			.forEach((_, plugin) => plugin.build())
	}

	system(schedulePlugins, ABSOLUTE_FIRST)

	query(System).forEach((_, system) => {
		scheduler.addSystem(system.callback, system.phase)
	})

	scheduler.runAll()
}
