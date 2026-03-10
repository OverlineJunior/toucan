---
editUrl: false
next: false
prev: false
title: "useThrottledMemo"
---

> **useThrottledMemo**\<`T`\>(`seconds`, `factory`, `initialValue`, `identifier?`): `T`

Defined in: [src/std/hooks/useThrottledMemo.ts:22](https://github.com/OverlineJunior/toucan/blob/f28f04d91a1f401a88e2816c1566e4ef64224416/src/std/hooks/useThrottledMemo.ts#L22)

Memoizes a value, updating it at most once every `seconds`.

Returns the memoized value, which is initialized with `initialValue` and updated by `factory` when the throttle allows.

An optional `identifier` can be provided to create separate throttle states for different usages.

## Type Parameters

### T

`T`

## Parameters

### seconds

`number`

### factory

() => `T`

### initialValue

`T`

### identifier?

`unknown`

## Returns

`T`

## Example

```ts
function drawRandomValue() {
    // Updates a random value every 0.5 seconds.
    // When 0.5 seconds have not yet passed, the previous value is returned instead, preventing UI flicker.
    const value = useThrottledMemo(0.5, () => math.random(), 0)
    // Draws at 60 FPS, but the value only updates every 0.5 seconds.
    label.Text = `Value: ${value}`
}
```
