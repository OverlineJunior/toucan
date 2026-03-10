---
editUrl: false
next: false
prev: false
title: "component"
---

> **component**\<`Value`\>(`label?`): [`ComponentHandle`](/toucan/api/core_ecs/componenthandle/)\<`Value`\>

Defined in: [src/handle.ts:521](https://github.com/OverlineJunior/toucan/blob/5e77424d22b6c9bab6a75574fb64d27ef5785ee2/src/handle.ts#L521)

Creates a new component.

Additionally, a `label` can be provided for easier identification during debugging.

## Type Parameters

### Value

`Value` = `undefined`

## Parameters

### label?

`string`

## Returns

[`ComponentHandle`](/toucan/api/core_ecs/componenthandle/)\<`Value`\>

## Example

```ts
// A component with a value.
const Health = component<number>()

// A tag component.
const IsAlive = component()
```
