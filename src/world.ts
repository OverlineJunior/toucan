import { world as newWorld, World, Entity as RawEntity } from '@rbxts/jecs'

type UnsafeWorld = World & {
	entity_index: {
		dense_array: RawEntity[]
	}
}

export const world = newWorld() as UnsafeWorld
