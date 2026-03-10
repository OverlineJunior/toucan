---
editUrl: false
next: false
prev: false
title: "POST_UPDATE"
---

> `const` **POST\_UPDATE**: [`Phase`](/api/interfaces/phase/)

Defined in: [src/std/phases.ts:75](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/std/phases.ts#L75)

Runs on `RunService.Heartbeat` in the following order (assuming no custom phases are added):

FIRST -> PRE_UPDATE -> UPDATE -> **POST_UPDATE** -> LAST.
