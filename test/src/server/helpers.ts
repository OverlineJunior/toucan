import {
	__despawnScheduler,
	Builtin,
	type EntityLike,
	query,
} from '@rbxts/toucan'

export function clearWorld(): void {
	const forceDespawn = (e: EntityLike) => {
		e.remove(Builtin.Persistent)
		e.despawn()
	}

	for (const enttKind of [
		Builtin.Entity,
		Builtin.Component,
		Builtin.Resource,
		// Message entities are only queried when explicitly requested.
		Builtin.MessageSequence,
	]) {
		query(enttKind)
			.without(Builtin.Internal)
			.collect() // We collect due to iterator invalidation; see issue #2.
			.forEach(([e]) => forceDespawn(e))
	}

	__despawnScheduler()
}
