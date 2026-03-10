---
editUrl: false
next: false
prev: false
title: "POST_STARTUP"
---

> `const` **POST\_STARTUP**: [`Phase`](/api/interfaces/phase/)

Defined in: [src/std/phases.ts:40](https://github.com/OverlineJunior/toucan/blob/4cdfd0dfe43e8538887a71db35f0a7b92648a8e5/src/std/phases.ts#L40)

The last phase in the startup pipeline, running once after all other **startup** phases, even custom ones.

PRE_STARTUP -> STARTUP -> **POST_STARTUP**.

---

The startup pipeline runs before the update pipeline.
