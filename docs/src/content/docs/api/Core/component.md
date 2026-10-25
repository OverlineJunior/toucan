---
editUrl: false
next: false
prev: false
title: "component"
---

> **component**\<`Value`\>(`label?`): [`Component`](/toucan/api/types/component/)\<`Value`\>

Defined in: [entities/index.ts:630](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L630)

Creates a new [Component](/toucan/api/types/component/).

Additionally, a `label` can be provided for easier identification.

## Type Parameters

### Value

`Value` = `undefined`

## Parameters

### label?

`string`

## Returns

[`Component`](/toucan/api/types/component/)\<`Value`\>

## Example

```ts
// A component with a value.
const Health = component<number>()

// A tag component.
const IsAlive = component()
```
