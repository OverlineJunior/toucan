import type { Entity } from '../entities'

// We use a global variable to store the plugin currently being built because
// otherwise, we'd need to do expensive queries and callstack traversals on
// every `entity()` call, which needs to read the plugin context to determine
// who's spawning it.
//
// Aditionally, we give this variable its own file because its most logical
// place to live, `scheduler.ts`, already imports from `../entities`.
// Defining it there would create a circular dependency.
let activePluginEntity: Entity | undefined

export function getActivePluginEntity(): Entity | undefined {
	return activePluginEntity
}

export function setActivePluginEntity(entity: Entity | undefined): void {
	activePluginEntity = entity
}
