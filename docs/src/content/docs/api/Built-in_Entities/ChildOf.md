---
editUrl: false
next: false
prev: false
title: "ChildOf"
---

> `const` **ChildOf**: [`ComponentHandle`](/api/core_ecs/componenthandle/)\<`undefined`\>

Defined in: [src/handle.ts:685](https://github.com/OverlineJunior/toucan/blob/4cdfd0dfe43e8538887a71db35f0a7b92648a8e5/src/handle.ts#L685)

Built-in component used to represent parent-child relationships between entities.

## Example

```ts
const alice = entity()
const bob = entity().set(pair(ChildOf, alice))
assert(bob.parent() === alice)
```
