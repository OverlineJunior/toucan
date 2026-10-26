---
title: Entities & Components
sidebar:
  order: 2
---

Now that you know what Toucan is for, let's look at how you can organize your game's data with entities and components!

## Entities

An [entity](/toucan/api/core/entity) is a unique identifier. On its own it holds no data — it's just a handle to which you attach components.

```ts
import { entity } from "@rbxts/toucan";

const bob = entity();
const alice = entity("Alice");
```

If you pass a label, Toucan uses it whenever the entity needs to be printed, which makes debugging much easier. Because it's good practice, we'll be using it from here on.

Entities live until they're despawned, removing them entirely from the world:

```ts
const bob = entity("Bob");

print(bob); // Bob
print(bob.exists()); // true

bob.despawn();

print(bob.exists()); // false
```

## Components

[Components](/toucan/api/types/component) describe what an entity _is_ or _has_. Like entities, each component is a unique identifier — usually declared once and shared across the whole game.

```ts
import { component } from "@rbxts/toucan";

const Health = component<number>();
const Name = component<string>("Name"); // Components can also have labels!
const IsAlive = component("IsAlive");
```

Pass a value type for components that hold data. Components without one are by convention called **tags**: they carry no value and are only used to mark entities.

Components are attached with [`set`](/toucan/api/types/entitylike/#set), read with [`get`](/toucan/api/types/entitylike/#get) or [`has`](/toucan/api/types/entitylike/#has), and removed with [`remove`](/toucan/api/types/entitylike/#remove):

```ts
const bob = entity("Bob").set(Health, 100).set(Name, "Bob").set(IsAlive);

bob.get(Health); // 100

const [health, name] = bob.get(Health, Name); // 100, "Bob"

bob.has(IsAlive); // true

bob.remove(IsAlive);
bob.has(IsAlive); // false
```

### Built-in components

Toucan ships with a set of its own components under [`Builtin`](/toucan/api/variables/builtin/). Most are used internally, but a few are meant to be used by your code:

- `Builtin.Persistent` marks entities that can't be despawned, and components that can't be removed.
- `Builtin.ChildOf` is the relationship behind [`parent()`](/toucan/api/types/entitylike/#parent) and [`children()`](/toucan/api/types/entitylike/#children).
- `Builtin.QueryHidden` keeps components out of queries — entities carrying them are invisible until a query opts in with [`allow()`](/toucan/api/types/query/#allow).
- `Builtin.Wildcard` matches either end of a relationship pair, letting you query for it regardless of the other side.

For the full list, see the [API reference](/toucan/api/variables/builtin/).

### Reacting to changes

Components expose three lifecycle callbacks:

```ts
Health.onChanged((e, newHealth, oldHealth) => {
  print(`${e}'s health went from ${oldHealth} to ${newHealth}`);
});

const unsubscribe = Health.onAdded((e, health) => {
  print(`${health}hp was added to ${e}`);
});

Health.onRemoved((e, oldHealth, despawned) => {
  print(
    despawned ? `${e} was despawned with ${oldHealth}hp` : `${e} lost Health`,
  );
});
```

Each one returns a function that unsubscribes. Use these sparingly — gameplay logic usually belongs in systems.

## Queries

[Queries](/toucan/api/core/query) find entities by the components they have, and are how you read and modify data in bulk:

```ts
import { query } from "@rbxts/toucan";

query(Health).forEach((e, health) => {
  print(`${e} has ${health}hp`);
});
```

The first argument is the entity, followed by the values of the queried components in the same order they were passed to `query()`. Tag components contribute no value, so query them mainly to select entities.

### Filtering

Queries can narrow down their results with a chainable API:

```ts
query(Health)
  .with(Velocity) // must also have Velocity
  .without(Stunned) // but must not have Stunned
  .filter((_e, health) => health > 0)
  .forEach((_e, health) => {
    // ...
  });
```

### Consuming results

Besides [`forEach`](/toucan/api/types/query/#foreach), queries can be consumed in a few other ways:

```ts
const allPeople = query(Name).collect(); // [entity, name][]

const bob = query(Name).find((_e, name) => name === "Bob"); // [entity, name] | undefined

const names = query(Name).map((_e, name) => name); // string[]

// Returns an optimized function that runs this query.
const dmgOverTime = query(Health).bind((e, hp) => e.set(Health, hp - 1));
```
