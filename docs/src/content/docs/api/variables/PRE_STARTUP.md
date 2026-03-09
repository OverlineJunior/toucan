---
editUrl: false
next: false
prev: false
title: "PRE_STARTUP"
---

> `const` **PRE\_STARTUP**: [`Phase`](/api/interfaces/phase/)

Defined in: [src/std/phases.ts:14](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/std/phases.ts#L14)

The first phase in the startup pipeline, running once before all others, even custom ones.

**PRE_STARTUP** -> STARTUP -> POST_STARTUP.

---

The startup pipeline runs before the update pipeline.
