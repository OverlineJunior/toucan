---
editUrl: false
next: false
prev: false
title: "Builtin"
---

> `const` **Builtin**: `object`

Defined in: [entities/builtins.ts:11](https://github.com/OverlineJunior/toucan/blob/master/src/entities/builtins.ts#L11)

A collection of built-in [Component](/toucan/api/types/component/)s.

## Type Declaration

### AddedByPlugin

> **AddedByPlugin**: [`Component`](/toucan/api/types/component/)\<`undefined`\>

Built-in component used as a relation for entities spawned within plugins.

### ChildOf

> **ChildOf**: [`Component`](/toucan/api/types/component/)\<`undefined`\>

Built-in component used to represent parent-child relationships between entities.

#### Example

```ts
const alice = entity()
const bob = entity().set(pair(ChildOf, alice))
assert(bob.parent() === alice)
```

### Component

> **Component**: [`Component`](/toucan/api/types/component/)\<`undefined`\>

Built-in component used to distinguish entities that represent components.

### Entity

> **Entity**: [`Component`](/toucan/api/types/component/)\<`undefined`\>

Built-in component used to distinguish regular entities from components and resources.

### Internal

> **Internal**: [`Component`](/toucan/api/types/component/)\<`undefined`\>

Built-in component used to distinguish entities created internally by Toucan.

### Label

> **Label**: [`Component`](/toucan/api/types/component/)\<`string`\>

Built-in component used by Toucan to assign human-readable labels to entities.

### MessageSequence

> **MessageSequence**: [`Component`](/toucan/api/types/component/)\<`number`\>

Built-in component that marks an entity as a message and stores its monotonic
sequence number, used to guarantee emission order.

Messages are excluded from queries by default. Requiring this component opts
into reading them as regular entities:

#### Example

```ts
query(Builtin.MessageSequence).forEach((message, sequence) => {
    print(`Message #${sequence}`)
})
```

#### Remarks

Prefer [Query.on](/toucan/api/types/query/#on) to read messages, as it handles frame lifetime and per-system
cursors for you.

### Persistent

> **Persistent**: [`Component`](/toucan/api/types/component/)\<`undefined`\>

Built-in component used to...
1. Mark entities that cannot be despawned by any means;
2. Mark components that cannot be removed by any means.

### Plugin

> **Plugin**: [`Component`](/toucan/api/types/component/)\<\{ `args`: `unknown`[]; `built`: `boolean`; `fn`: [`PluginFn`](/toucan/api/types/pluginfn/); \}\>

Built-in component used to distinguish entities that represent plugins.

### QueryHidden

> **QueryHidden**: [`Component`](/toucan/api/types/component/)\<`undefined`\>

Built-in component that marks other components as hidden from queries.

Entities with a component marked with `QueryHidden` are excluded from queries
by default. Use [Query.allow](/toucan/api/types/query/#allow) or [Query.allowAll](/toucan/api/types/query/#allowall) to include them.

The default hidden components are [Builtin.Component](/toucan/api/variables/builtin/#component), [Builtin.Resource](/toucan/api/variables/builtin/#resource) and [Builtin.MessageSequence](/toucan/api/variables/builtin/#messagesequence).
That means queries can only see regular entities by default.

#### Example

```ts
const Marker = component()
const Hidden = component().set(Builtin.QueryHidden)

entity().set(Marker).set(Hidden)

query(Marker) // Excluded by default.
query(Marker).allow(Hidden) // Included.
```

### Resource

> **Resource**: [`Component`](/toucan/api/types/component/)\<`undefined`\>

Built-in component used to distinguish entities that represent resources.

### Schedule

> **Schedule**: [`Component`](/toucan/api/types/component/)\<\{ `kind`: [`Schedules`](/toucan/api/types/schedules/); \}\>

Built-in component used to distinguish entities that represent schedules.

### System

> **System**: [`Component`](/toucan/api/types/component/)\<\{ `after`: ([`SystemFn`](/toucan/api/types/systemfn/) \| [`SystemSet`](/toucan/api/types/systemset/))[]; `args`: `unknown`[]; `before`: ([`SystemFn`](/toucan/api/types/systemfn/) \| [`SystemSet`](/toucan/api/types/systemset/))[]; `cursors?`: `Map`\<`string`, `number`\>; `fn`: [`SystemFn`](/toucan/api/types/systemfn/); `runIfs`: `RunCondition`[]; `runtimeMs`: `number`; `schedule`: [`Schedules`](/toucan/api/types/schedules/); \}\>

Built-in component used to distinguish entities that represent systems.

### ThirdParty

> **ThirdParty**: [`Component`](/toucan/api/types/component/)\<`undefined`\>

Built-in component used to distinguish entities created by third-party packages.

### Wildcard

> **Wildcard**: [`Component`](/toucan/api/types/component/)\<`undefined`\>

Built-in component that acts as a wildcard in relationship pairs.

It can be used to query for all sources or targets of a relationship without caring about the other end of it.

#### Example

```ts
// Query all entities that are children of any other entity.
query(pair(ChildOf, Wildcard)).forEach((child) => {
    const parent = child.targetOf(ChildOf)
})
```
