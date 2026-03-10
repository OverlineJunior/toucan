---
editUrl: false
next: false
prev: false
title: "POST_STARTUP"
---

> `const` **POST\_STARTUP**: [`Phase`](/api/interfaces/phase/)

Defined in: [src/std/phases.ts:40](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/std/phases.ts#L40)

The last phase in the startup pipeline, running once after all other **startup** phases, even custom ones.

PRE_STARTUP -> STARTUP -> **POST_STARTUP**.

---

The startup pipeline runs before the update pipeline.
