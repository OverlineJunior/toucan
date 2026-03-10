---
editUrl: false
next: false
prev: false
title: "ChildOf"
---

> `const` **ChildOf**: [`ComponentHandle`](/api/interfaces/componenthandle/)\<`undefined`\>

Defined in: [src/handle.ts:644](https://github.com/OverlineJunior/toucan/blob/f28f04d91a1f401a88e2816c1566e4ef64224416/src/handle.ts#L644)

Built-in component used to represent parent-child relationships between entities.

## Exampl

```ts
const alice = entity()
const bob = entity().set(pair(ChildOf, alice))
assert(bob.parent() === alice)
```
