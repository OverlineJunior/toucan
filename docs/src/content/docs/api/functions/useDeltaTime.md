---
editUrl: false
next: false
prev: false
title: "useDeltaTime"
---

> **useDeltaTime**(): `number`

Defined in: [src/std/hooks/useDeltaTime.ts:19](https://github.com/OverlineJunior/toucan/blob/f28f04d91a1f401a88e2816c1566e4ef64224416/src/std/hooks/useDeltaTime.ts#L19)

Returns the `os.clock()` time delta between the start of this and the last frame.

## Returns

`number`

## Example

```ts
function liftAll() {
    query(Position).forEach((id, position) => {
        id.set(
            Position,
			// We use delta time to make the movement frame-independent.
            position.add(Vector3.up).mul(useDeltaTime())
        )
    })
}
```
