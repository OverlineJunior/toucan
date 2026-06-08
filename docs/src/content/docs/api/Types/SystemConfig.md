---
editUrl: false
next: false
prev: false
title: "SystemConfig"
---

Defined in: [scheduler/system.ts:29](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/system.ts#L29)

Configuration options for a system registered with [Scheduler.useSystem](/toucan/api/types/scheduler/#usesystem).

## Type Parameters

### Args

`Args` *extends* `unknown`[] = `unknown`[]

## Properties

### after?

> `optional` **after?**: [`SystemFn`](/toucan/api/types/systemfn/)\<`unknown`[]\> \| [`SystemSet`](/toucan/api/types/systemset/) \| ([`SystemFn`](/toucan/api/types/systemfn/)\<`unknown`[]\> \| [`SystemSet`](/toucan/api/types/systemset/))[]

Defined in: [scheduler/system.ts:40](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/system.ts#L40)

Symmetric to `before`.

***

### args?

> `optional` **args?**: `Args`

Defined in: [scheduler/system.ts:33](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/system.ts#L33)

Arguments to pass to the system function.

***

### before?

> `optional` **before?**: [`SystemFn`](/toucan/api/types/systemfn/)\<`unknown`[]\> \| [`SystemSet`](/toucan/api/types/systemset/) \| ([`SystemFn`](/toucan/api/types/systemfn/)\<`unknown`[]\> \| [`SystemSet`](/toucan/api/types/systemset/))[]

Defined in: [scheduler/system.ts:38](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/system.ts#L38)

Runs this system before the given target(s).
When a `SystemSet` is given, this system runs before every system in that set.

***

### inSet?

> `optional` **inSet?**: [`SystemSet`](/toucan/api/types/systemset/) \| [`SystemSet`](/toucan/api/types/systemset/)[]

Defined in: [scheduler/system.ts:42](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/system.ts#L42)

Assigns this system to one or more sets, inheriting their ordering and run conditions.

***

### label?

> `optional` **label?**: `string`

Defined in: [scheduler/system.ts:31](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/system.ts#L31)

A human-readable label.

***

### runIf?

> `optional` **runIf?**: `RunCondition` \| `RunCondition`[]

Defined in: [scheduler/system.ts:44](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/system.ts#L44)

One or more conditions, where all must return `true` for the system to run.
