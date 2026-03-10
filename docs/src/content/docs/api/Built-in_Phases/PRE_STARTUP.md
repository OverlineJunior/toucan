---
editUrl: false
next: false
prev: false
title: "PRE_STARTUP"
---

> `const` **PRE\_STARTUP**: [`Phase`](/api/interfaces/phase/)

Defined in: [src/std/phases.ts:16](https://github.com/OverlineJunior/toucan/blob/4cdfd0dfe43e8538887a71db35f0a7b92648a8e5/src/std/phases.ts#L16)

The first phase in the startup pipeline, running once before all others, even custom ones.

**PRE_STARTUP** -> STARTUP -> POST_STARTUP.

---

The startup pipeline runs before the update pipeline.
