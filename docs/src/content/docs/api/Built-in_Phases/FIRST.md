---
editUrl: false
next: false
prev: false
title: "FIRST"
---

> `const` **FIRST**: [`Phase`](/toucan/api/interfaces/phase/)

Defined in: [src/std/phases.ts:51](https://github.com/OverlineJunior/toucan/blob/5e77424d22b6c9bab6a75574fb64d27ef5785ee2/src/std/phases.ts#L51)

The first phase in the update pipeline, running on `RunService.Heartbeat` before all other **update** phases, even custom ones.

**FIRST** -> PRE_UPDATE -> UPDATE -> POST_UPDATE -> LAST.
