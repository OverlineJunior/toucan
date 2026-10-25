---
editUrl: false
next: false
prev: false
title: "SetConfig"
---

Defined in: [scheduler/system.ts:53](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/system.ts#L53)

Configuration options for a system set registered with [Scheduler.configureSet](/toucan/api/types/scheduler/#configureset).

## Properties

### after?

> `optional` **after?**: [`SystemSet`](/toucan/api/types/systemset/) \| [`SystemFn`](/toucan/api/types/systemfn/)\<`unknown`[]\> \| ([`SystemSet`](/toucan/api/types/systemset/) \| [`SystemFn`](/toucan/api/types/systemfn/)\<`unknown`[]\>)[]

Defined in: [scheduler/system.ts:60](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/system.ts#L60)

Symmetric to `before`.

***

### before?

> `optional` **before?**: [`SystemSet`](/toucan/api/types/systemset/) \| [`SystemFn`](/toucan/api/types/systemfn/)\<`unknown`[]\> \| ([`SystemSet`](/toucan/api/types/systemset/) \| [`SystemFn`](/toucan/api/types/systemfn/)\<`unknown`[]\>)[]

Defined in: [scheduler/system.ts:58](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/system.ts#L58)

Runs every system in this set before the given target(s).
When a [SystemSet](/toucan/api/types/systemset/) is given, expands to all systems in that set.

***

### runIf?

> `optional` **runIf?**: `RunCondition` \| `RunCondition`[]

Defined in: [scheduler/system.ts:65](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/system.ts#L65)

One or more conditions inherited by every system in the set,
where all must return `true` for the systems to run.
