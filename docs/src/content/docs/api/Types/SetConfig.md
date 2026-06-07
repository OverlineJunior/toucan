---
editUrl: false
next: false
prev: false
title: "SetConfig"
---

Defined in: [scheduler/system.ts:47](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/system.ts#L47)

Configuration options for a system set registered with [Scheduler.configureSet](/toucan/api/types/scheduler/#configureset).

## Properties

### after?

> `optional` **after?**: [`SystemFn`](/toucan/api/types/systemfn/)\<`unknown`[]\> \| [`SystemSet`](/toucan/api/types/systemset/) \| ([`SystemFn`](/toucan/api/types/systemfn/)\<`unknown`[]\> \| [`SystemSet`](/toucan/api/types/systemset/))[]

Defined in: [scheduler/system.ts:54](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/system.ts#L54)

Symmetric to `before`.

***

### before?

> `optional` **before?**: [`SystemFn`](/toucan/api/types/systemfn/)\<`unknown`[]\> \| [`SystemSet`](/toucan/api/types/systemset/) \| ([`SystemFn`](/toucan/api/types/systemfn/)\<`unknown`[]\> \| [`SystemSet`](/toucan/api/types/systemset/))[]

Defined in: [scheduler/system.ts:52](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/system.ts#L52)

Runs every system in this set before the given target(s).
When a `SystemSet` is given, expands to all systems in that set.

***

### runIf?

> `optional` **runIf?**: `RunCondition` \| `RunCondition`[]

Defined in: [scheduler/system.ts:59](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/system.ts#L59)

One or more conditions inherited by every system in the set,
where all must return `true` for the systems to run.
