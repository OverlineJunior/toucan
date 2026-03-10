---
editUrl: false
next: false
prev: false
title: "POST_UPDATE"
---

> `const` **POST\_UPDATE**: [`Phase`](/api/interfaces/phase/)

Defined in: [src/std/phases.ts:61](https://github.com/OverlineJunior/toucan/blob/f28f04d91a1f401a88e2816c1566e4ef64224416/src/std/phases.ts#L61)

Runs on `RunService.Heartbeat` in the following order (assuming no custom phases are added):

FIRST -> PRE_UPDATE -> UPDATE -> **POST_UPDATE** -> LAST.
