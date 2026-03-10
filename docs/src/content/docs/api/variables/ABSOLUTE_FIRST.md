---
editUrl: false
next: false
prev: false
title: "ABSOLUTE_FIRST"
---

> `const` **ABSOLUTE\_FIRST**: [`Phase`](/api/interfaces/phase/)

Defined in: [src/std/phases.ts:95](https://github.com/OverlineJunior/toucan/blob/f28f04d91a1f401a88e2816c1566e4ef64224416/src/std/phases.ts#L95)

**ABSOLUTE_FIRST** -> FIRST -> PRE_UPDATE -> UPDATE -> POST_UPDATE -> LAST -> ABSOLUTE_LAST.

## Remarks

⚠️ This is an internal phase. It should only be used by the framework itself and third-party
plugins that need to run systems absolutely first or last in the update pipeline.
