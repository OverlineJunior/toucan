import { ComponentOrPair, Entity, GetParams, GetResult } from './entity'
import { Entity as RawEntity, Wildcard as RawWildcard, Component as RawComponent } from '@rbxts/jecs'
import { world } from './world'
import { Pair } from './pair'
import { UpToFour } from './util'

export class Component<Value = unknown> extends Entity {
	constructor(override readonly id: RawEntity<Value>) {
		super(id)
	}

	added(listener: (e: Entity, id: Component<Value>, value: Value) => void): () => void {
		return world.added(this.id, (rawE, rawComp, v) => {
			listener(new Entity(rawE), new Component(rawComp as RawEntity<Value>), v)
		})
	}

	removed(listener: (e: Entity, id: Component<Value>) => void): () => void {
		return world.removed(this.id, (rawE, rawComp) => {
			listener(new Entity(rawE), new Component(rawComp as RawEntity<Value>))
		})
	}

	changed(listener: (e: Entity, id: Component<Value>, value: Value) => void): () => void {
		return world.changed(this.id, (rawE, rawComp, v) => {
			listener(new Entity(rawE), new Component(rawComp as RawEntity<Value>), v)
		})
	}
}

export function component<Value = undefined>(): Component<Value> {
	return new Component<Value>(world.component<Value>())
}

export const Wildcard = new Component(RawWildcard)
export const ComponentTag = new Component(RawComponent)
