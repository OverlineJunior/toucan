---
editUrl: false
next: false
prev: false
title: "POST_STARTUP"
---

> `const` **POST\_STARTUP**: [`Phase`](/api/interfaces/phase/)

Defined in: [src/std/phases.ts:34](https://github.com/OverlineJunior/toucan/blob/f28f04d91a1f401a88e2816c1566e4ef64224416/src/std/phases.ts#L34)

The last phase in the startup pipeline, running once after all other **startup** phases, even custom ones.

PRE_STARTUP -> STARTUP -> **POST_STARTUP**.

---

The startup pipeline runs before the update pipeline.
