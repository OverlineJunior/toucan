---
editUrl: false
next: false
prev: false
title: "POST_UPDATE"
---

> `const` **POST\_UPDATE**: `Phase`

Defined in: [std/phases.ts:75](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/std/phases.ts#L75)

Runs on `RunService.Heartbeat` in the following order (assuming no custom phases are added):

FIRST -> PRE_UPDATE -> UPDATE -> **POST_UPDATE** -> LAST.
