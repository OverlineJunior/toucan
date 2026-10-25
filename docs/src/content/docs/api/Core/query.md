---
editUrl: false
next: false
prev: false
title: "query"
---

> **query**\<`Cs`\>(...`components`): [`Query`](/toucan/api/types/query/)\<`Cs`\>

Defined in: [query.ts:589](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L589)

Creates a [Query](/toucan/api/types/query/), which represents a set of criteria used to filter and iterate over entities based on their components.

Queries provide a fluent, chainable API to define strict matching rules (such as requiring or
excluding specific components) and offer various ways to consume the matching entities. You can
iterate over them ([Query.forEach](/toucan/api/types/query/#foreach), [Query.map](/toucan/api/types/query/#map)), or bind them directly into optimized system callbacks ([Query.bind](/toucan/api/types/query/#bind)).

## Type Parameters

### Cs

`Cs` *extends* `ZeroUpToEight`\<[`Pair`](/toucan/api/types/pair/)\<`unknown`\> \| [`Component`](/toucan/api/types/component/)\<`unknown`\>\>

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
