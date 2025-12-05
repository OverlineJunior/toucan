import { Phase } from '@rbxts/planck'
import { World } from './world'
import { App } from './app'
import { Plugin, ResolvedPlugin } from './plugin'

export interface SystemContext<P extends Plugin | undefined = undefined> {
	world: World
	app: App
	plugin: P
}

export type System = (context: SystemContext<any>) => void | undefined

export class ResolvedSystem {
	readonly fn: System
	readonly phase: Phase
	readonly name: string
	readonly plugin?: ResolvedPlugin

	constructor(system: System, phase: Phase, plugin?: ResolvedPlugin) {
		this.fn = system
		this.phase = phase
		this.name = debug.info(system, 'n')[0]!
		this.plugin = plugin
	}
}
