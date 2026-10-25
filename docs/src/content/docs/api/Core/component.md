---
editUrl: false
next: false
prev: false
title: "component"
---

> **component**\<`Value`\>(`label?`): [`ComponentHandle`](/toucan/api/types/componenthandle/)\<`Value`\>

Defined in: [handle/index.ts:621](https://github.com/OverlineJunior/toucan/blob/master/src/handle/index.ts#L621)

Creates a new [ComponentHandle](/toucan/api/types/componenthandle/).

Additionally, a `label` can be provided for easier identification.

## Type Parameters

### Value

`Value` = `undefined`

## Parameters

### label?

`string`

## Returns

[`ComponentHandle`](/toucan/api/types/componenthandle/)\<`Value`\>

## Example

```ts
// A component with a value.
const Health = component<number>()

// A tag component.
const IsAlive = component()
```
