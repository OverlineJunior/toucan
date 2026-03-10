---
editUrl: false
next: false
prev: false
title: "LAST"
---

> `const` **LAST**: [`Phase`](/api/interfaces/phase/)

Defined in: [src/std/phases.ts:83](https://github.com/OverlineJunior/toucan/blob/4cdfd0dfe43e8538887a71db35f0a7b92648a8e5/src/std/phases.ts#L83)

The last phase in the update pipeline, running on `RunService.Heartbeat` after all others, even custom ones.

FIRST -> PRE_UPDATE -> UPDATE -> POST_UPDATE -> **LAST**.
