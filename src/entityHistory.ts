import type { RawId } from './id'

// Used to store the previous component values for a specific entity when they are updated.
class EntityHistory {
	// Reads as `EntityId -> ComponentId -> PreviousValue`.
	private readonly history = new Map<RawId, Map<RawId, unknown>>()

	get(entityId: RawId, componentId: RawId): unknown | undefined {
		return this.history.get(entityId)?.get(componentId)
	}

	set(entityId: RawId, componentId: RawId, value: unknown): void {
		let hist = this.history.get(entityId)
		if (!hist) {
			hist = new Map<RawId, unknown>()
			this.history.set(entityId, hist)
		}
		hist.set(componentId, value)
	}

	deleteComponent(entityId: RawId, componentId: RawId): void {
		this.history.get(entityId)?.delete(componentId)
	}

	clearComponents(entityId: RawId): void {
		this.history.get(entityId)?.clear()
	}

	deleteEntity(entityId: RawId): void {
		this.history.delete(entityId)
	}
}

export const entityHistory = new EntityHistory()
