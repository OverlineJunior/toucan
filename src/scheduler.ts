import { Scheduler } from '@rbxts/planck'
import { RunService } from '@rbxts/services'
import {
	POST_SIMULATION,
	PRE_ANIMATION,
	PRE_RENDER,
	PRE_SIMULATION,
	STARTUP_PIPELINE,
	UPDATE_PIPELINE,
} from './std/phases'
import { System } from './id'
import { query } from './query'

export function run() {
	const scheduler = new Scheduler()
		.insert(STARTUP_PIPELINE)
		.insert(UPDATE_PIPELINE, RunService, 'Heartbeat')
		.insert(PRE_RENDER, RunService, 'PreRender')
		.insert(PRE_ANIMATION, RunService, 'PreAnimation')
		.insert(PRE_SIMULATION, RunService, 'PreSimulation')
		.insert(POST_SIMULATION, RunService, 'PostSimulation')

	query(System).forEach((_, data) => {
		scheduler.addSystem(data.callback, data.phase)
	})

	scheduler.runAll()
}
