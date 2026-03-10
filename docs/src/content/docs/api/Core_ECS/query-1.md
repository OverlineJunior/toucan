---
editUrl: false
next: false
prev: false
title: "query"
---

> **query**\<`Cs`\>(...`components`): [`Query`](/toucan/api/core_ecs/query/)\<`Cs`\>

Defined in: [src/query.ts:428](https://github.com/OverlineJunior/toucan/blob/5e77424d22b6c9bab6a75574fb64d27ef5785ee2/src/query.ts#L428)

Creates a new query for the specified components and/or pairs.

## Type Parameters

### Cs

`Cs` *extends* `ZeroUpToEight`\<[`Pair`](/toucan/api/core_ecs/pair/)\<`unknown`\> \| [`ComponentHandle`](/toucan/api/core_ecs/componenthandle/)\<`unknown`\>\>

## Parameters

### components

...`Cs`

## Returns

[`Query`](/toucan/api/core_ecs/query/)\<`Cs`\>

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
