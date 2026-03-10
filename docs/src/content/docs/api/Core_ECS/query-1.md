---
editUrl: false
next: false
prev: false
title: "query"
---

> **query**\<`Cs`\>(...`components`): [`Query`](/api/core_ecs/query/)\<`Cs`\>

Defined in: [src/query.ts:428](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/query.ts#L428)

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
