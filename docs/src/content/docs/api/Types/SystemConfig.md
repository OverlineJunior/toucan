---
editUrl: false
next: false
prev: false
title: "SystemConfig"
---

> **SystemConfig**\<`Args`\> = `object` & \[\] *extends* `Args` ? `object` : `object`

Defined in: [scheduler/system.ts:23](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/system.ts#L23)

Configuration options for a system registered with [Scheduler.useSystem](/toucan/api/types/scheduler/#usesystem).

## Type Declaration

### after?

> `optional` **after?**: [`SystemFn`](/toucan/api/types/systemfn/) \| [`SystemSet`](/toucan/api/types/systemset/) \| ([`SystemFn`](/toucan/api/types/systemfn/) \| [`SystemSet`](/toucan/api/types/systemset/))[]

Symmetric to `before`.

### before?

> `optional` **before?**: [`SystemFn`](/toucan/api/types/systemfn/) \| [`SystemSet`](/toucan/api/types/systemset/) \| ([`SystemFn`](/toucan/api/types/systemfn/) \| [`SystemSet`](/toucan/api/types/systemset/))[]

Runs this system before the given target(s).
When a [SystemSet](/toucan/api/types/systemset/) is given, this system runs before every system in that set.

### inSet?

> `optional` **inSet?**: [`SystemSet`](/toucan/api/types/systemset/) \| [`SystemSet`](/toucan/api/types/systemset/)[]

Assigns this system to one or more sets, inheriting their ordering and run conditions.

### label?

> `optional` **label?**: `string`

A human-readable label.

### runIf?

> `optional` **runIf?**: `RunCondition` \| `RunCondition`[]

One or more conditions, where all must return `true` for the system to run.

## Type Parameters

### Args

`Args` *extends* `unknown`[] = `unknown`[]
