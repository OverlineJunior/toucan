---
editUrl: false
next: false
prev: false
title: "UPDATE"
---

> `const` **UPDATE**: [`Phase`](/toucan/api/interfaces/phase/)

Defined in: [src/std/phases.ts:67](https://github.com/OverlineJunior/toucan/blob/5e77424d22b6c9bab6a75574fb64d27ef5785ee2/src/std/phases.ts#L67)

Runs on `RunService.Heartbeat` in the following order (assuming no custom phases are added):

FIRST -> PRE_UPDATE -> **UPDATE** -> POST_UPDATE -> LAST.
