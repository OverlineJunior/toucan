---
editUrl: false
next: false
prev: false
title: "Wildcard"
---

> `const` **Wildcard**: [`ComponentHandle`](/api/interfaces/componenthandle/)\<`unknown`\>

Defined in: [src/handle.ts:630](https://github.com/OverlineJunior/toucan/blob/f28f04d91a1f401a88e2816c1566e4ef64224416/src/handle.ts#L630)

Built-in component that acts as a wildcard in queries. It has two use cases:
1. To query for all entities, including variations, such as components, systems and so on;
2. To query for all sources or targets of a relationship, without caring about the other end of the relationship.

## Exampl

```ts
// 1. Query all simple entities (entities that are not also components, systems, resources or plugins):
query(Wildcard).withoutAny(Component, System, Resource, Plugin).forEach((id) => {
    ...
})

// 2. Query all entities that are children of any other entity:
query(pair(ChildOf, Wildcard)).forEach((child) => {
    const parent = child.targetOf(ChildOf)
})
```
