---
editUrl: false
next: false
prev: false
title: "UPDATE"
---

> `const` **UPDATE**: [`Phase`](/api/interfaces/phase/)

Defined in: [src/std/phases.ts:67](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/std/phases.ts#L67)

Runs on `RunService.Heartbeat` in the following order (assuming no custom phases are added):

FIRST -> PRE_UPDATE -> **UPDATE** -> POST_UPDATE -> LAST.
