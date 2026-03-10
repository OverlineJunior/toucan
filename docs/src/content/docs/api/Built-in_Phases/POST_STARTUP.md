---
editUrl: false
next: false
prev: false
title: "POST_STARTUP"
---

> `const` **POST\_STARTUP**: `Phase`

Defined in: [std/phases.ts:40](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/std/phases.ts#L40)

The last phase in the startup pipeline, running once after all other **startup** phases, even custom ones.

PRE_STARTUP -> STARTUP -> **POST_STARTUP**.

---

The startup pipeline runs before the update pipeline.
