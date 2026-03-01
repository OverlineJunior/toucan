//import { world as newWorld, World, Entity as RawEntity } from '@rbxts/jecs'
import * as jecs from '@rbxts/jecs'

type UnsafeWorld = jecs.World & {
	entity_index: {
		dense_array: jecs.Entity[]
		sparse_array: {
			archetype: {
				types: number[]
			}
		}[]
	}
}

export const world = jecs.world() as UnsafeWorld
