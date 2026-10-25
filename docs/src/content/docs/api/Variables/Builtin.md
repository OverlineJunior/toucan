---
editUrl: false
next: false
prev: false
title: "Builtin"
---

> `const` **Builtin**: `object`

Defined in: [index.ts:53](https://github.com/OverlineJunior/toucan/blob/master/src/index.ts#L53)

A collection of built-in [Handle](/toucan/api/types/handle/)s.

## Type Declaration

### AddedByPlugin

> **AddedByPlugin**: [`ComponentHandle`](/toucan/api/types/componenthandle/)\<`undefined`\>

Built-in component used as a relation for entities spawned within plugins.

### ChildOf

> **ChildOf**: [`ComponentHandle`](/toucan/api/types/componenthandle/)\<`undefined`\>

Built-in component used to represent parent-child relationships between entities.

#### Example

```ts
const alice = entity()
const bob = entity().set(pair(ChildOf, alice))
assert(bob.parent() === alice)
```

### Component

> **Component**: [`ComponentHandle`](/toucan/api/types/componenthandle/)\<`undefined`\>

Built-in component used to distinguish entities that represent components.

### Entity

> **Entity**: [`ComponentHandle`](/toucan/api/types/componenthandle/)\<`undefined`\>

Built-in component used to distinguish regular entities from components and resources.

### Internal

> **Internal**: [`ComponentHandle`](/toucan/api/types/componenthandle/)\<`undefined`\>

Built-in component used to distinguish entities created internally by Toucan.

### Label

> **Label**: [`ComponentHandle`](/toucan/api/types/componenthandle/)\<`string`\>

Built-in component used by Toucan to assign human-readable labels to entities.

### MessageSequence

> **MessageSequence**: [`ComponentHandle`](/toucan/api/types/componenthandle/)\<`number`\>

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

Prefer `on()` to read messages, as it handles frame lifetime and per-system
cursors for you.

### Persistent

> **Persistent**: [`ComponentHandle`](/toucan/api/types/componenthandle/)\<`undefined`\>

Built-in component used to...
1. Mark entities that cannot be despawned by any means;
2. Mark components that cannot be removed by any means.

### Plugin

> **Plugin**: [`ComponentHandle`](/toucan/api/types/componenthandle/)\<\{ `args`: `unknown`[]; `built`: `boolean`; `fn`: [`PluginFn`](/toucan/api/types/pluginfn/); \}\>

Built-in component used to distinguish entities that represent plugins.

### QueryHidden

> **QueryHidden**: [`ComponentHandle`](/toucan/api/types/componenthandle/)\<`undefined`\>

Built-in component that marks other components as hidden from queries.

Entities with a component marked with `QueryHidden` are excluded from queries
by default. Use [Query.allow](/toucan/api/types/query/#allow) or [Query.allowAll](/toucan/api/types/query/#allowall) to include them.

The default hidden components are `Component`, `Resource` and `MessageSequence`.
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

> **Resource**: [`ComponentHandle`](/toucan/api/types/componenthandle/)\<`undefined`\>

Built-in component used to distinguish entities that represent resources.

### Schedule

> **Schedule**: [`ComponentHandle`](/toucan/api/types/componenthandle/)\<\{ `kind`: [`Schedules`](/toucan/api/types/schedules/); \}\>

Built-in component used to distinguish entities that represent schedules.

### System

> **System**: [`ComponentHandle`](/toucan/api/types/componenthandle/)\<\{ `after`: ([`SystemFn`](/toucan/api/types/systemfn/)\<`unknown`[]\> \| [`SystemSet`](/toucan/api/types/systemset/))[]; `args`: `unknown`[]; `before`: ([`SystemFn`](/toucan/api/types/systemfn/)\<`unknown`[]\> \| [`SystemSet`](/toucan/api/types/systemset/))[]; `cursors?`: `Map`\<`string`, `number`\>; `fn`: [`SystemFn`](/toucan/api/types/systemfn/); `runIfs`: `RunCondition`[]; `runtimeMs`: `number`; `schedule`: [`Schedules`](/toucan/api/types/schedules/); \}\>

Built-in component used to distinguish entities that represent systems.

### ThirdParty

> **ThirdParty**: [`ComponentHandle`](/toucan/api/types/componenthandle/)\<`undefined`\>

Built-in component used to distinguish entities created by third-party packages.

### Wildcard

> **Wildcard**: [`ComponentHandle`](/toucan/api/types/componenthandle/)\<`undefined`\>

Built-in component that acts as a wildcard in relationship pairs.

It can be used to query for all sources or targets of a relationship without caring about the other end of it.

#### Example

```ts
// Query all entities that are children of any other entity.
query(pair(ChildOf, Wildcard)).forEach((child) => {
    const parent = child.targetOf(ChildOf)
})
```
