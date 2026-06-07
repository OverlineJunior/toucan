---
editUrl: false
next: false
prev: false
title: "SystemConfig"
---

Defined in: [scheduler/system.ts:21](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/system.ts#L21)

Configuration options for a system registered with [Scheduler.useSystem](/toucan/api/types/scheduler/#usesystem).

## Properties

### after?

> `optional` **after?**: [`SystemFn`](/toucan/api/types/systemfn/)\<`unknown`[]\> \| [`SystemSet`](/toucan/api/types/systemset/) \| ([`SystemFn`](/toucan/api/types/systemfn/)\<`unknown`[]\> \| [`SystemSet`](/toucan/api/types/systemset/))[]

Defined in: [scheduler/system.ts:28](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/system.ts#L28)

Symmetric to `before`.

***

### before?

> `optional` **before?**: [`SystemFn`](/toucan/api/types/systemfn/)\<`unknown`[]\> \| [`SystemSet`](/toucan/api/types/systemset/) \| ([`SystemFn`](/toucan/api/types/systemfn/)\<`unknown`[]\> \| [`SystemSet`](/toucan/api/types/systemset/))[]

Defined in: [scheduler/system.ts:26](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/system.ts#L26)

Runs this system before the given target(s).
When a `SystemSet` is given, this system runs before every system in that set.

***

### inSet?

> `optional` **inSet?**: [`SystemSet`](/toucan/api/types/systemset/) \| [`SystemSet`](/toucan/api/types/systemset/)[]

Defined in: [scheduler/system.ts:30](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/system.ts#L30)

Assigns this system to one or more sets, inheriting their ordering and run conditions.

***

### runIf?

> `optional` **runIf?**: `RunCondition` \| `RunCondition`[]

Defined in: [scheduler/system.ts:32](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/system.ts#L32)

One or more conditions, where all must return `true` for the system to run.
