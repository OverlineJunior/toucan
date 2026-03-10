---
editUrl: false
next: false
prev: false
title: "component"
---

> **component**\<`Value`\>(`label?`): [`ComponentHandle`](/api/interfaces/componenthandle/)\<`Value`\>

Defined in: [src/handle.ts:497](https://github.com/OverlineJunior/toucan/blob/f28f04d91a1f401a88e2816c1566e4ef64224416/src/handle.ts#L497)

Creates a new component.

Additionally, a `label` can be provided for easier identification during debugging.

## Type Parameters

### Value

`Value` = `undefined`

## Parameters

### label?

`string`

## Returns

[`ComponentHandle`](/api/interfaces/componenthandle/)\<`Value`\>

## Exampl

```ts
// A component with a value.
const Health = component<number>()

// A tag component.
const IsAlive = component()
```
