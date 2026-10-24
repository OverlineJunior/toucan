import { Component, MessageSequence, Resource } from './handle/builtins'
import type { RawId } from './id'

/*
 * Entities with any of those components will not show up in queries unless explicitly requested.
 */
export const hiddenComponentIds: RawId[] = [
	Component.id,
	Resource.id,
	MessageSequence.id,
]
