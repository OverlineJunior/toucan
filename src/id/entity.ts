import { Id } from '.'
import { world } from '../world'

export class Entity extends Id {
	declare protected readonly __brand: 'entity'
}

/**
 * Spawns a new, empty _entity_ and returns it.
 */
export function entity(): Entity {
	return new Entity(world.entity())
}
