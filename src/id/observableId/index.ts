import { Id } from '..'
import { world } from '../../world'
import { Entity as RawId } from '@rbxts/jecs'

// TODO! Reconsider the listeners' signature - the second parameter is useless, `removed`
// ! lacks the value parameter, and `changed` could provide both old and new values.
export class ObservableId<Value> extends Id {
	/**
	 * Registers a listener that is called whenever this _component_ or _pair_
	 * is added to any _entity_.
	 *
	 * The returned function can be called to unregister the listener.
	 */
	added(listener: (e: Id, added: this, value: Value) => void): () => void {
		return world.added(this.id, (rawE, rawComp, v) => {
			listener(new Id(rawE), new ObservableId(rawComp as RawId) as this, v as Value)
		})
	}

	/**
	 * Registers a listener that is called whenever this _component_ or _pair_
	 * is removed from any _entity_.
	 *
	 * The returned function can be called to unregister the listener.
	 */
	removed(listener: (e: Id, removed: this) => void): () => void {
		return world.removed(this.id, (rawE, rawComp) => {
			listener(new Id(rawE), new ObservableId(rawComp as RawId) as this)
		})
	}

	/**
	 * Registers a listener that is called whenever the value of this _component_
	 * or _pair_ changes on any _entity_.
	 *
	 * The returned function can be called to unregister the listener.
	 */
	changed(listener: (e: Id, changed: this, value: Value) => void): () => void {
		return world.changed(this.id, (rawE, rawComp, v) => {
			listener(new Id(rawE), new ObservableId(rawComp as RawId) as this, v as Value)
		})
	}
}
