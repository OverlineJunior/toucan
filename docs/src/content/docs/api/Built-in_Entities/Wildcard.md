---
editUrl: false
next: false
prev: false
title: "Wildcard"
---

> `const` **Wildcard**: [`ComponentHandle`](/toucan/api/core_ecs/componenthandle/)\<`unknown`\>

Defined in: [src/handle.ts:669](https://github.com/OverlineJunior/toucan/blob/5e77424d22b6c9bab6a75574fb64d27ef5785ee2/src/handle.ts#L669)

Built-in component that acts as a wildcard in queries. It has two use cases:
1. To query for all entities, including variations, such as components, systems and so on;
2. To query for all sources or targets of a relationship, without caring about the other end of the relationship.

## Example

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
