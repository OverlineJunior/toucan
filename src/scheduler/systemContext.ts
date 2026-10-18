import type { EntityHandle } from '../handle'

// We use a global variable to store the system currently being run because
// queries that read messages with `on()` need to know which system's message
// cursors to use, and only the scheduler knows that. Similar to pluginContext.
let activeSystemEntity: EntityHandle | undefined

export function getActiveSystemEntity(): EntityHandle | undefined {
	return activeSystemEntity
}

export function setActiveSystemEntity(entity: EntityHandle | undefined): void {
	activeSystemEntity = entity
}
