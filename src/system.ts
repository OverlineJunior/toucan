import { Phase } from '@rbxts/planck'
import { App } from './app'
import { Plugin, ResolvedPlugin } from './plugin'

/**
 * Systems are functions that operate on entities and components within a world.
 *
 * They receive a `SystemContext` object when executed, which provides access to the
 * _world_, the _app_, and optionally the _plugin_ that registered the system.
 *
 * As an alternative to defining systems as functions that accept a `SystemContext`,
 * one can also define systems as closures typed as `System`.
 *
 * # Example
 *
 * ```ts
 * const greet: System = ({ world }) => {
 *     for (const [_entity, name] of world.query(Name)) {
 *         print(`Hello, ${name.value}!`)
 *     }
 * }
 * ```
 */
export type System = (app: App, plugin?: Plugin) => void | undefined

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
