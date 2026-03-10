---
editUrl: false
next: false
prev: false
title: "query"
---

> **query**\<`Cs`\>(...`components`): [`Query`](/api/core_ecs/query/)\<`Cs`\>

Defined in: [src/query.ts:428](https://github.com/OverlineJunior/toucan/blob/4cdfd0dfe43e8538887a71db35f0a7b92648a8e5/src/query.ts#L428)

Creates a new query for the specified components and/or pairs.

## Type Parameters

### Cs

`Cs` *extends* `ZeroUpToEight`\<[`Pair`](/api/core_ecs/pair/)\<`unknown`\> \| [`ComponentHandle`](/api/core_ecs/componenthandle/)\<`unknown`\>\>

## Parameters

### components

...`Cs`

## Returns

[`Query`](/api/core_ecs/query/)\<`Cs`\>

## Example

```ts
const Position = component<Vector3>()
const Velocity = component<Vector3>()

function updatePositions() {
    query(Position, Velocity).forEach((entity, position, velocity) => {
        entity.set(Position, position.add(velocity))
    })
}
```
