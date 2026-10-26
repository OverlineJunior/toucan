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
	]) {
		query(enttKind)
			.allowAll()
			.without(Builtin.Internal)
			.forEach((e) => forceDespawn(e))
	}

	__despawnScheduler()
}
