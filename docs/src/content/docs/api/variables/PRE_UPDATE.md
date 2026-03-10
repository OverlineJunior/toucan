---
editUrl: false
next: false
prev: false
title: "PRE_UPDATE"
---

> `const` **PRE\_UPDATE**: [`Phase`](/api/interfaces/phase/)

Defined in: [src/std/phases.ts:49](https://github.com/OverlineJunior/toucan/blob/f28f04d91a1f401a88e2816c1566e4ef64224416/src/std/phases.ts#L49)

Runs on `RunService.Heartbeat` in the following order (assuming no custom phases are added):

FIRST -> **PRE_UPDATE** -> UPDATE -> POST_UPDATE -> LAST.
