---
editUrl: false
next: false
prev: false
title: "ABSOLUTE_FIRST"
---

> `const` **ABSOLUTE\_FIRST**: [`Phase`](/api/interfaces/phase/)

Defined in: [src/std/phases.ts:121](https://github.com/OverlineJunior/toucan/blob/4cdfd0dfe43e8538887a71db35f0a7b92648a8e5/src/std/phases.ts#L121)

**ABSOLUTE_FIRST** -> FIRST -> PRE_UPDATE -> UPDATE -> POST_UPDATE -> LAST -> ABSOLUTE_LAST.

## Remarks

⚠️ This is an internal phase. It should only be used by the framework itself and third-party
plugins that need to run systems absolutely first or last in the update pipeline.
