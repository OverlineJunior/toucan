---
editUrl: false
next: false
prev: false
title: "LAST"
---

> `const` **LAST**: [`Phase`](/toucan/api/interfaces/phase/)

Defined in: [src/std/phases.ts:83](https://github.com/OverlineJunior/toucan/blob/5e77424d22b6c9bab6a75574fb64d27ef5785ee2/src/std/phases.ts#L83)

The last phase in the update pipeline, running on `RunService.Heartbeat` after all others, even custom ones.

FIRST -> PRE_UPDATE -> UPDATE -> POST_UPDATE -> **LAST**.
