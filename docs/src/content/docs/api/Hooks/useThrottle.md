---
editUrl: false
next: false
prev: false
title: "useThrottle"
---

> **useThrottle**(`seconds`, `identifier?`): `boolean`

Defined in: [src/std/hooks/useThrottle.ts:25](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/std/hooks/useThrottle.ts#L25)

Throttles execution based on a time interval in seconds.

Returns `true` if the specified time interval has passed since the last `true` return,
otherwise returns `false`.

An optional `identifier` can be provided to create separate throttle states for different usages.

## Parameters

### seconds

`number`

### identifier?

`unknown`

## Returns

`boolean`

## Example

```ts
function logNames() {
    query(Name).forEach((_, name) => {
        // This log will only occur once per second per unique name.
        if (useThrottle(1, name)) {
            print(`Throttled log: ${name.value}`)
        }
    })
}
```
