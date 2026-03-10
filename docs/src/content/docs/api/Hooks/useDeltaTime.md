---
editUrl: false
next: false
prev: false
title: "useDeltaTime"
---

> **useDeltaTime**(): `number`

Defined in: [src/std/hooks/useDeltaTime.ts:21](https://github.com/OverlineJunior/toucan/blob/4cdfd0dfe43e8538887a71db35f0a7b92648a8e5/src/std/hooks/useDeltaTime.ts#L21)

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
