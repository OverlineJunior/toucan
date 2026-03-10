---
editUrl: false
next: false
prev: false
title: "LAST"
---

> `const` **LAST**: [`Phase`](/api/interfaces/phase/)

Defined in: [src/std/phases.ts:83](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/std/phases.ts#L83)

The last phase in the update pipeline, running on `RunService.Heartbeat` after all others, even custom ones.

FIRST -> PRE_UPDATE -> UPDATE -> POST_UPDATE -> **LAST**.
