import { Component } from './component'
import { Entity, ComponentOrPair, GetParams, GetResult } from './index'
import { UpToFour } from '../util'
import { world } from '../world'
import { Pair } from './pair'

export class Resource<Value> extends Entity {
	set(value: Value): this
	set(pair: Pair<undefined>): this
	set<V>(pair: Pair<V>, value: V): this
	set(tagComponent: Component<undefined>): this
	set<V>(component: Component<V>, value: V): this
	set(componentOrValue: ComponentOrPair | Value, value?: unknown): this {
		if (componentOrValue instanceof Component) {
			super.set(componentOrValue, value)
		} else {
			world.set(this.id, this.id, componentOrValue)
		}

		return this
	}

	get(): Value
	get<Cs extends UpToFour<Component>>(...components: GetParams<Cs>): GetResult<Cs>
	get(...components: Component[]) {
		if (components.size() === 0) {
			return world.get(this.id, this.id)
		} else {
			return super.get(...(components as [Component]))
		}
	}
}

export function resource<Value>(value: Value): Resource<Value> {
	const id = world.component<Value>()
	world.set(id, id, value)

	return new Resource<Value>(id)
}
