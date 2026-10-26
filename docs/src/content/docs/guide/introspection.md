---
title: Introspection
sidebar:
  order: 7
---

Now that you know how to model connections between entities, let's look at how to inspect the world at runtime with introspection!

Every entity in Toucan is one of three kinds: a regular **entity**, a **component**, or a **resource**. Toucan marks each kind with a built-in component — `Builtin.Entity`, `Builtin.Component`, and `Builtin.Resource` — so you can always tell them apart. The term that encompasses all three is **entity-like**.

## Entity-Likes are Everywhere

Most things in Toucan are entity-likes. Components and resources are entity-likes by definition, but so are systems, schedules, plugins, and messages: each is a regular entity carrying a built-in marker component. Because they all share the same underlying representation, the same introspection tools work across all of them — they all have an `id`, a label, and can be queried.

## IDs

Every entity-like has an [`id`](/toucan/api/types/entitylike/#id), a number that identifies it internally. Use [`resolveId`](/toucan/api/core/resolveid) to turn an ID back into the entity, component, or resource it belongs to:

```ts
import { entity, resolveId } from "@rbxts/toucan";

const bob = entity("Bob");

resolveId(bob.id); // bob
```

IDs are handy when you can only store primitives, like an instance attribute:

```ts
part.SetAttribute("OwnerId", bob.id);

const owner = resolveId(part.GetAttribute("OwnerId") as number);
```

`resolveId` returns `undefined` if the entity no longer exists or the id is invalid.

## Inspecting Entities

[`exists`](/toucan/api/types/entitylike/#exists) tells you whether an entity is still in the world. [`components`](/toucan/api/types/entitylike/#components) and [`relationships`](/toucan/api/types/entitylike/#relationships) list everything attached to it:

```ts
import { component, entity, pair } from "@rbxts/toucan";

const Health = component<number>("Health");
const Likes = component("Likes");

const bob = entity("Bob");
const alice = entity("Alice").set(Health, 100).set(pair(Likes, bob));

alice.exists(); // true
alice.components(); // [Health, ...built-ins]
alice.relationships(); // [pair(Likes, bob)]
```

Keep in mind that `components()` includes Toucan's built-in components, such as `Builtin.Entity` and `Builtin.Label`, so filter them out if you only care about your own.

## Inspecting the World

Toucan marks every kind of thing with a built-in component, so you can query the world itself:

| Kind       | Query                            |
| ---------- | -------------------------------- |
| Entities   | `query(Builtin.Entity)`          |
| Components | `query(Builtin.Component)`       |
| Resources  | `query(Builtin.Resource)`        |
| Messages   | `query(Builtin.MessageSequence)` |
| Systems    | `query(Builtin.System)`          |
| Schedules  | `query(Builtin.Schedule)`        |
| Plugins    | `query(Builtin.Plugin)`          |

```ts
import { Builtin, query } from "@rbxts/toucan";

const entityCount = query(Builtin.Entity).collect().size();
const componentCount = query(Builtin.Component).collect().size();

print(`${entityCount} entities, ${componentCount} components`);
```

Prefer [`Query.on`](/toucan/api/types/query/#on) for reading messages; querying `Builtin.MessageSequence` is only useful for inspection.

### System runtime

The `Builtin.System` component stores metadata about each system, including how long it took on its last run:

```ts
import { Builtin, query } from "@rbxts/toucan";

query(Builtin.System).forEach((system, data) => {
  if (data.runtimeMs > 1) {
    print(`${system} took ${data.runtimeMs}ms`);
  }
});
```

### Hidden components

Some built-ins are hidden from queries by default so they don't pollute results: `Builtin.Component`, `Builtin.Resource`, and `Builtin.MessageSequence`. Querying them directly works because they're the required term, but if you query by another component and want to include them, use [`allow`](/toucan/api/types/query/#allow) or [`allowAll`](/toucan/api/types/query/#allowall):

```ts
import { Builtin, component, query } from "@rbxts/toucan";

const Description = component<string>("Description");

// Includes components and resources that also have Description.
query(Description)
  .allow(Builtin.Component, Builtin.Resource)
  .forEach((e, description) => {
    print(`${e}: ${description}`);
  });
```

## Built-in Tags

Beyond the kind markers above, Toucan uses built-in components to record metadata:

| Component                 | Marks                                                                 |
| ------------------------- | --------------------------------------------------------------------- |
| `Builtin.Label`           | A human-readable label                                                |
| `Builtin.Persistent`      | Entities that can't be despawned and components that can't be removed |
| `Builtin.QueryHidden`     | Components hidden from queries                                        |
| `Builtin.ThirdParty`      | Entities created by third-party packages                              |
| `Builtin.Internal`        | Entities created internally by Toucan                                 |
| `Builtin.MessageSequence` | Messages, storing their emission order                                |
| `Builtin.AddedByPlugin`   | The plugin that spawned an entity, as a relation pair                 |
| `Builtin.ChildOf`         | Parent-child relationships                                            |
| `Builtin.Wildcard`        | Wildcard pairs                                                        |

For example, you can find out which plugin spawned an entity:

```ts
import { Builtin } from "@rbxts/toucan";

const plugin = someEntity.targetOf(Builtin.AddedByPlugin);

if (plugin) {
  print(`${someEntity} was spawned by ${plugin}`);
}
```

And you can find everything that came from third-party packages:

```ts
import { Builtin, query } from "@rbxts/toucan";

query(Builtin.ThirdParty).forEach((e) => {
  print(`${e} came from a third-party package`);
});
```

## What's Next?

Introspection lets you inspect and debug the world at runtime. Next, learn the practices that keep a Toucan codebase healthy.
