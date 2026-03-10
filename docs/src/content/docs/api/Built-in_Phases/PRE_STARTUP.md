---
editUrl: false
next: false
prev: false
title: "PRE_STARTUP"
---

> `const` **PRE\_STARTUP**: [`Phase`](/toucan/api/interfaces/phase/)

Defined in: [src/std/phases.ts:16](https://github.com/OverlineJunior/toucan/blob/5e77424d22b6c9bab6a75574fb64d27ef5785ee2/src/std/phases.ts#L16)

The first phase in the startup pipeline, running once before all others, even custom ones.

**PRE_STARTUP** -> STARTUP -> POST_STARTUP.

---

The startup pipeline runs before the update pipeline.
