---
editUrl: false
next: false
prev: false
title: "PRE_UPDATE"
---

> `const` **PRE\_UPDATE**: [`Phase`](/api/interfaces/phase/)

Defined in: [src/std/phases.ts:49](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/std/phases.ts#L49)

Runs on `RunService.Heartbeat` in the following order (assuming no custom phases are added):

FIRST -> **PRE_UPDATE** -> UPDATE -> POST_UPDATE -> LAST.
