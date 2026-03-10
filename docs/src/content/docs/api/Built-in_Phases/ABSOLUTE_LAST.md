---
editUrl: false
next: false
prev: false
title: "ABSOLUTE_LAST"
---

> `const` **ABSOLUTE\_LAST**: [`Phase`](/api/interfaces/phase/)

Defined in: [src/std/phases.ts:131](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/std/phases.ts#L131)

ABSOLUTE_FIRST -> FIRST -> PRE_UPDATE -> UPDATE -> POST_UPDATE -> LAST -> **ABSOLUTE_LAST**.

## Remarks

⚠️ This is an internal phase. It should only be used by the framework itself and third-party
plugins that need to run systems absolutely first or last in the update pipeline.
