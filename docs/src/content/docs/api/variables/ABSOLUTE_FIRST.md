---
editUrl: false
next: false
prev: false
title: "ABSOLUTE_FIRST"
---

> `const` **ABSOLUTE\_FIRST**: [`Phase`](/api/interfaces/phase/)

Defined in: [src/std/phases.ts:96](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/std/phases.ts#L96)

# ⚠️ Internal phase.

Should only be used by the framework itself and third-party plugins that need
to run systems absolutely first or last in the update pipeline.

**ABSOLUTE_FIRST** -> FIRST -> PRE_UPDATE -> UPDATE -> POST_UPDATE -> LAST -> ABSOLUTE_LAST.
