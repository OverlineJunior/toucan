---
editUrl: false
next: false
prev: false
title: "LAST"
---

> `const` **LAST**: [`Phase`](/api/interfaces/phase/)

Defined in: [src/std/phases.ts:67](https://github.com/OverlineJunior/toucan/blob/f28f04d91a1f401a88e2816c1566e4ef64224416/src/std/phases.ts#L67)

The last phase in the update pipeline, running on `RunService.Heartbeat` after all others, even custom ones.

FIRST -> PRE_UPDATE -> UPDATE -> POST_UPDATE -> **LAST**.
