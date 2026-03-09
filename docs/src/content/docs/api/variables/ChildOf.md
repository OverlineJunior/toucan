---
editUrl: false
next: false
prev: false
title: "ChildOf"
---

> `const` **ChildOf**: [`ComponentHandle`](/api/interfaces/componenthandle/)\<`undefined`\>

Defined in: [src/handle.ts:658](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/handle.ts#L658)

Built-in component used to represent parent-child relationships between entities.

# Example

```ts
const alice = entity()
const bob = entity().set(pair(ChildOf, alice))
assert(bob.parent() === alice)
```
