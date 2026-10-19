---
editUrl: false
next: false
prev: false
title: "Builtin"
---

> `const` **Builtin**: `object`

Defined in: [index.ts:50](https://github.com/OverlineJunior/toucan/blob/master/src/index.ts#L50)

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

Built-in component that acts as a wildcard in queries. It has two use cases:
1. To query for all entities, including variations, such as components, systems and so on;
2. To query for all sources or targets of a relationship, without caring about the other end of the relationship.

#### Example

```ts
// 1. Query all simple entities (entities that are not also components, systems, resources or plugins):
query(Wildcard).withoutAny(Component, System, Resource, Plugin).forEach((id) => {
    ...
})

// 2. Query all entities that are children of any other entity:
query(pair(ChildOf, Wildcard)).forEach((child) => {
    const parent = child.targetOf(ChildOf)
})
```
