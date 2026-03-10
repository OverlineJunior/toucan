---
editUrl: false
next: false
prev: false
title: "query"
---

> **query**\<`Cs`\>(...`components`): [`Query`](/api/interfaces/query/)\<`Cs`\>

Defined in: [src/query.ts:402](https://github.com/OverlineJunior/toucan/blob/f28f04d91a1f401a88e2816c1566e4ef64224416/src/query.ts#L402)

Creates a new query for the specified components and/or pairs.

## Type Parameters

### Cs

`Cs` *extends* `ZeroUpToEight`\<[`Pair`](/api/interfaces/pair/)\<`unknown`\> \| [`ComponentHandle`](/api/interfaces/componenthandle/)\<`unknown`\>\>

## Parameters

### components

...`Cs`

## Returns

[`Query`](/api/interfaces/query/)\<`Cs`\>

## Exampl

```ts
const Position = component<Vector3>()
const Velocity = component<Vector3>()

function updatePositions() {
    query(Position, Velocity).forEach((entity, position, velocity) => {
        entity.set(Position, position.add(velocity))
    })
}
```
