import { Component } from './component'
import { Entity } from './entity'
import { pair as jecsPair, Pair as JecsPair, pair_first, pair_second, Entity as RawEntity } from '@rbxts/jecs'
import { world } from './world'

export class Pair<R> extends Entity {
	relationship(): Component<R> {
		return new Component(pair_first(world, this.id as unknown as JecsPair)) as Component<R>
	}

	target(): Entity {
		return new Entity(pair_second(world, this.id as unknown as JecsPair))
	}
}

export function pair<R = undefined>(relationship: Component<R>, target: Entity): Pair<R> {
	return new Pair(jecsPair(relationship.id, target['id']) as unknown as RawEntity)
}
