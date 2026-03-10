---
editUrl: false
next: false
prev: false
title: "useDeltaTime"
---

> **useDeltaTime**(): `number`

Defined in: [src/std/hooks/useDeltaTime.ts:21](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/std/hooks/useDeltaTime.ts#L21)

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
