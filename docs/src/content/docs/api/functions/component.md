---
editUrl: false
next: false
prev: false
title: "component"
---

> **component**\<`Value`\>(`label?`): [`ComponentHandle`](/api/interfaces/componenthandle/)\<`Value`\>

Defined in: [src/handle.ts:508](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/handle.ts#L508)

Creates a new component.

Additionally, a `label` can be provided for easier identification during debugging.

# Example

```ts
// A component with a value.
const Health = component<number>()

// A tag component.
const IsAlive = component()
```

## Type Parameters

### Value

`Value` = `undefined`

## Parameters

### label?

`string`

## Returns

[`ComponentHandle`](/api/interfaces/componenthandle/)\<`Value`\>
