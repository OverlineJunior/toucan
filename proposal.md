# Proposed Syntax

```ts
entity()
	.set(IsAlive)
	.set(Health, 100)
	.delete()

component()
	.set(Replicated)
	.delete()

query(Health)
	.with(IsAlive)

function log() {
	query(Position, Velocity).on((e, pos, vel) => {
		e.set(Position, pos.add(vel))
	})
}

const firstDeadEntity = query(Health, IsAlive).first((e, hp) => hp === 0)

const deadEntities = query(Health, IsAlive)
	.filter((e, hp) => hp === 0)
	.collect()
```

# Regarding performance:

Entities going from simple IDs to complex objects might decrease performance by an *unknown* amount.

Ideally, you could write a transformer that takes your Planned Syntax and compiles it into the Current Syntax:
- Input:         `query(A).on((e, a) => e.set(...))`
- Output (Luau): `for e, a in world:query(A) do world.set(e, ...) end`

# Comparison:

```ts
entity()
	.set(IsAlive)
	.set(Health, 100)

world.spawn(
	IsAlive,
	[Health, 100]
)



component().set(Replicated)

component(Replicated)



function log() {
	query(Position, Velocity).forEach((e, pos, vel) => {
		e.set(Position, pos.add(vel))
	})
}

function log({ world }: SystemContext) {
	for (const [e, pos, vel] of world.query(Position, Velocity)) {
		world.set(e, Position, pos.add(vel))
	}
}



const firstDeadEntity = query(Health, IsAlive).find((e, hp) => hp === 0)

let firstDeadEntity
for (const [e, hp] of world.query(Health, IsAlive)) {
	if (hp === 0) {
		firstDeadEntity = e
		break
	}
}



const deadEntities = query(Health, IsAlive).filter((e, hp) => hp === 0)

let deadEntities = []
for (const [e, hp] of world.query(Health, IsAlive)) {
	if (hp === 0) {
		deadEntities.push(e)
	}
}
```

```ts

function physics() {
	query(Position, Velocity).forEach((e, pos, vel) => {
		e.set(Position, pos.add(vel))
	})
}

function physics<E1>(e1: Entity<E1>, pos: Position<E1>, vel: Velocity<E1>, e2: Entity<E2>, speed: Speed<E2>) {
	
}

```
