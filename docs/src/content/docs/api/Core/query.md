---
editUrl: false
next: false
prev: false
title: "query"
---

> **query**\<`Cs`\>(...`components`): [`Query`](/toucan/api/types/query/)\<`Cs`\>

Defined in: [query.ts:708](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L708)

Creates a [Query](/toucan/api/types/query/), which represents a set of criteria used to filter and iterate over entities based on their components.

Queries provide a fluent, chainable API to define strict matching rules (such as requiring or
excluding specific components) and offer various ways to consume the matching entities. You can
iterate over them (`forEach`, `map`), listen to their lifecycle events (`onAdded`, `onChanged`),
or bind them directly into optimized system callbacks (`bind`).

## Type Parameters

### Cs

`Cs` *extends* `ZeroUpToEight`\<[`ComponentHandle`](/toucan/api/types/componenthandle/)\<`unknown`\> \| [`Pair`](/toucan/api/types/pair/)\<`unknown`\>\>

## Parameters

### components

...`Cs`

## Returns

[`Query`](/toucan/api/types/query/)\<`Cs`\>

## Remarks

Messages are excluded from queries by default. To read them as regular entities,
explicitly require `Builtin.MessageSequence` (e.g. `query(Builtin.MessageSequence)`).
Prefer [Query.on](/toucan/api/types/query/#on) when you need frame lifetime and per-system cursors handled
for you.

## Example

```ts
// 1. Define the query.
const healthyMovers = query(Health, Position)
    .with(Velocity)
    .without(Stunned)
    .filter((_entity, health, _position) => health > 0)

// 2. Consume the query.
healthyMovers.forEach((entity, health, position) => {
    print(`Entity ${entity.id} is moving with ${health}hp at ${position}!`)
})
```
