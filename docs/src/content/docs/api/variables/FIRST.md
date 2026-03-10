---
editUrl: false
next: false
prev: false
title: "FIRST"
---

> `const` **FIRST**: [`Phase`](/api/interfaces/phase/)

Defined in: [src/std/phases.ts:43](https://github.com/OverlineJunior/toucan/blob/f28f04d91a1f401a88e2816c1566e4ef64224416/src/std/phases.ts#L43)

The first phase in the update pipeline, running on `RunService.Heartbeat` before all other **update** phases, even custom ones.

**FIRST** -> PRE_UPDATE -> UPDATE -> POST_UPDATE -> LAST.
