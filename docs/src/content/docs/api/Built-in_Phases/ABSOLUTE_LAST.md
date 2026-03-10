---
editUrl: false
next: false
prev: false
title: "ABSOLUTE_LAST"
---

> `const` **ABSOLUTE\_LAST**: `Phase`

Defined in: [std/phases.ts:131](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/std/phases.ts#L131)

ABSOLUTE_FIRST -> FIRST -> PRE_UPDATE -> UPDATE -> POST_UPDATE -> LAST -> **ABSOLUTE_LAST**.

## Remarks

⚠️ This is an internal phase. It should only be used by the framework itself and third-party
plugins that need to run systems absolutely first or last in the update pipeline.
