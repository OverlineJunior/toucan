---
editUrl: false
next: false
prev: false
title: "UPDATE"
---

> `const` **UPDATE**: [`Phase`](/api/interfaces/phase/)

Defined in: [src/std/phases.ts:67](https://github.com/OverlineJunior/toucan/blob/4cdfd0dfe43e8538887a71db35f0a7b92648a8e5/src/std/phases.ts#L67)

Runs on `RunService.Heartbeat` in the following order (assuming no custom phases are added):

FIRST -> PRE_UPDATE -> **UPDATE** -> POST_UPDATE -> LAST.
