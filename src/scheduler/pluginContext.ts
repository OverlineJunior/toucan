import type { EntityHandle } from '../handle'

// We use a global variable to store the plugin currently being built because
// otherwise, we'd need to do expensive queries and callstack traversals on
// every `entity()` call, which needs to read the plugin context to determine
// who's spawning it.
// 
// Aditionally, we give this variable its own file because its most logical
// place to live, `scheduler.ts`, already imports from `../handle`.
// Defining it there would create a circular dependency.
let activePluginEntity: EntityHandle | undefined

export function getActivePluginEntity(): EntityHandle | undefined {
    return activePluginEntity
}

export function setActivePluginEntity(entity: EntityHandle | undefined): void {
    activePluginEntity = entity
}
