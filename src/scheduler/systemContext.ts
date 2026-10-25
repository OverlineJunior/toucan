import type { Entity } from '../entities'

// We use a global variable to store the system currently being run because
// queries that read messages with `on()` need to know which system's message
// cursors to use, and only the scheduler knows that. Similar to pluginContext.
let activeSystemEntity: Entity | undefined

export function getActiveSystemEntity(): Entity | undefined {
	return activeSystemEntity
}

export function setActiveSystemEntity(entity: Entity | undefined): void {
	activeSystemEntity = entity
}
