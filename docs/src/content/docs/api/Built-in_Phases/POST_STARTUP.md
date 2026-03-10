---
editUrl: false
next: false
prev: false
title: "POST_STARTUP"
---

> `const` **POST\_STARTUP**: [`Phase`](/toucan/api/interfaces/phase/)

Defined in: [src/std/phases.ts:40](https://github.com/OverlineJunior/toucan/blob/5e77424d22b6c9bab6a75574fb64d27ef5785ee2/src/std/phases.ts#L40)

The last phase in the startup pipeline, running once after all other **startup** phases, even custom ones.

PRE_STARTUP -> STARTUP -> **POST_STARTUP**.

---

The startup pipeline runs before the update pipeline.
