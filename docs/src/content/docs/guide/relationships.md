---
title: Relationships
sidebar:
  order: 6
---

Now that you know how systems send events to each other with messages, let's look at how to model connections between entities with relationships!

## Pairs

A [pair](/toucan/api/core/pair) links a relation to a target, forming something like `Alice → Likes → Bob`. Both ends can be entities or components, and a pair is assigned to an entity just like a component:

```ts
import { component, entity, pair } from "@rbxts/toucan";

const Likes = component("Likes");
const Owns = component<number>("Owns");

const bob = entity("Bob");
const car = entity("Car");

const alice = entity("Alice")
  .set(pair(Likes, bob))
  .set(pair(Owns, car), 2);

alice.has(pair(Likes, bob)); // true
alice.get(pair(Owns, car)); // 2
```

Pairs are compared by their relation and target, so `pair(Likes, bob)` always refers to the same relationship, no matter where it's created. They're valid almost anywhere components are — in `set`, `get`, `has`, queries and messages, for example.

### Pair values

Like components, pairs can hold a value. The value type comes from the relation if it has one, otherwise from the target:

```ts
const Begin = component("Begin");
const End = component("End");
const Position = component<Vector3>("Position");

const line = entity("Line")
  // `Begin` and `End` are tags, so these pairs take `Position`'s value type.
  .set(pair(Begin, Position), new Vector3(0, 0, 0))
  .set(pair(End, Position), new Vector3(10, 0, 0));
```

If neither end holds a value, the pair holds no value either and is by convention called a tag pair.

## Querying Relationships

Pairs are query terms too, so you can find entities by the relationships they have:

```ts
import { query } from "@rbxts/toucan";

query(pair(Owns, car)).forEach((e, amount) => {
  print(`${e} owns ${amount} cars!`);
});
```

### Wildcards

Pass [`Builtin.Wildcard`](/toucan/api/variables/builtin/#wildcard) as either end of a pair to match any relation or target:

```ts
import { Builtin } from "@rbxts/toucan";

// Every entity that is a child of another.
const children = pair(Builtin.ChildOf, Builtin.Wildcard);

query(children).forEach((child) => {
  print(`${child} is a child of ${child.parent()}`);
});
```

## Observing relations

Component lifecycle callbacks also fire for pairs that use the component as their relation. Here, `Likes.onRemoved` runs when `pair(Likes, bob)` is removed from `alice`:

```ts
const Likes = component("Likes");

const bob = entity("Bob");
const alice = entity("Alice").set(pair(Likes, bob));

Likes.onRemoved((entity, _value, despawned) => {
  if (despawned) return;
  print(`${entity} lost a Likes relationship`);
});

alice.remove(pair(Likes, bob));
```

The callback receives the entity that held the pair, not the target. `onAdded` and `onChanged` observe pairs the same way.

## Navigating Relationships

[`targetsOf`](/toucan/api/types/entitylike/#targetsof) returns all the targets of a given relationship, and [`relationships`](/toucan/api/types/entitylike/#relationships) lists every pair on an entity:

```ts
const bob = entity("Bob");
const charlie = entity("Charlie");

const alice = entity("Alice")
  .set(pair(Likes, bob))
  .set(pair(Likes, charlie));

alice.targetsOf(Likes); // [bob, charlie]
alice.relationships(); // [pair(Likes, bob), pair(Likes, charlie)]
```

## Parent-Child Relationships

Toucan ships with [`Builtin.ChildOf`](/toucan/api/variables/builtin/#childof) for hierarchy. Assign it to a child, then use [`parent`](/toucan/api/types/entitylike/#parent) and [`children`](/toucan/api/types/entitylike/#children) to walk the tree:

```ts
import { Builtin } from "@rbxts/toucan";

const alice = entity("Alice");
const bob = entity("Bob").set(pair(Builtin.ChildOf, alice));
const charlie = entity("Charlie").set(pair(Builtin.ChildOf, alice));

bob.parent(); // alice
charlie.parent(); // alice
alice.children(); // [bob, charlie]
```

Assigning a new `ChildOf` pair doesn't remove the previous one, so remove the old pair when reparenting.

## What's Next?

Relationships let you model connections between entities without extra bookkeeping. Next, learn how to inspect the world at runtime with introspection.
