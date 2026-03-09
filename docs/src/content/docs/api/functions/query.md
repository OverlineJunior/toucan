---
editUrl: false
next: false
prev: false
title: "query"
---

> **query**\<`Cs`\>(...`components`): [`Query`](/api/interfaces/query/)\<`Cs`\>

Defined in: [src/query.ts:411](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/query.ts#L411)

Creates a new query for the specified components and/or pairs.

# Example

```ts
const Position = component<Vector3>()
const Velocity = component<Vector3>()

function updatePositions() {
    query(Position, Velocity).forEach((entity, position, velocity) => {
        entity.set(Position, position.add(velocity))
    })
}
```

## Type Parameters

### Cs

`Cs` *extends* `ZeroUpToEight`\<[`Pair`](/api/interfaces/pair/)\<`unknown`\> \| [`ComponentHandle`](/api/interfaces/componenthandle/)\<`unknown`\>\>

## Parameters

### components

...`Cs`

## Returns

[`Query`](/api/interfaces/query/)\<`Cs`\>
