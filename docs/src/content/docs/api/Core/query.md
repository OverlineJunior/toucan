---
editUrl: false
next: false
prev: false
title: "query"
---

> **query**\<`Cs`\>(...`components`): [`Query`](/toucan/api/types/query/)\<`Cs`\>

Defined in: [query.ts:489](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L489)

Creates a query, which represents a set of criteria used to filter and iterate over entities based on their components.

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
