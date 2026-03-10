---
editUrl: false
next: false
prev: false
title: "component"
---

> **component**\<`Value`\>(`label?`): [`ComponentHandle`](/api/core_ecs/componenthandle/)\<`Value`\>

Defined in: [src/handle.ts:521](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/handle.ts#L521)

Creates a new component.

Additionally, a `label` can be provided for easier identification during debugging.

## Type Parameters

### Value

`Value` = `undefined`

## Parameters

### label?

`string`

## Returns

[`ComponentHandle`](/api/core_ecs/componenthandle/)\<`Value`\>

## Example

```ts
// A component with a value.
const Health = component<number>()

// A tag component.
const IsAlive = component()
```
