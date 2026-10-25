import { ComponentBuiltin, QueryHidden } from './entities/builtins'
import type { RawId } from './id'
import { world } from './world'

/*
 * Entities with any of those components will not show up in queries unless explicitly requested.
 */
export const hiddenComponentIds: RawId[] = []

// For our built-in components with QueryHidden.
for (const [id] of world.query(QueryHidden.id)) {
	hiddenComponentIds.push(id)
}

QueryHidden.onAdded((e) => {
	if (!e.has(ComponentBuiltin)) return

	hiddenComponentIds.push(e.id)
})

QueryHidden.onRemoved((e) => {
	if (!e.has(ComponentBuiltin)) return

	const index = hiddenComponentIds.indexOf(e.id)
	if (index !== -1) hiddenComponentIds.remove(index)
})
