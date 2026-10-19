import { __despawnScheduler, Builtin, type Handle, query } from '@rbxts/toucan'

export function clearWorld(): void {
	const forceDespawn = (e: Handle) => {
		e.remove(Builtin.Persistent)
		e.despawn()
	}

	query(Builtin.Wildcard)
		.without(Builtin.Internal)
		.collect() // We collect due to iterator invalidation; see issue #2.
		.forEach(([e]) => forceDespawn(e))

	// Message entities are only queried when explicitly requested.
	query(Builtin.MessageSequence)
		.collect() // See #2.
		.forEach(([msg]) => forceDespawn(msg))

	__despawnScheduler()
}
