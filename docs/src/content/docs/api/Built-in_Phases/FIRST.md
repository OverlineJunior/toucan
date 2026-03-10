---
editUrl: false
next: false
prev: false
title: "FIRST"
---

> `const` **FIRST**: [`Phase`](/api/interfaces/phase/)

Defined in: [src/std/phases.ts:51](https://github.com/OverlineJunior/toucan/blob/4cdfd0dfe43e8538887a71db35f0a7b92648a8e5/src/std/phases.ts#L51)

The first phase in the update pipeline, running on `RunService.Heartbeat` before all other **update** phases, even custom ones.

**FIRST** -> PRE_UPDATE -> UPDATE -> POST_UPDATE -> LAST.
