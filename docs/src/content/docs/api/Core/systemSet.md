---
editUrl: false
next: false
prev: false
title: "systemSet"
---

> **systemSet**(`name`): [`SystemSet`](/toucan/api/types/systemset/)

Defined in: [scheduler/system.ts:155](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/system.ts#L155)

Creates a system set — a named group that systems can belong to.

System sets let you apply shared ordering constraints and run conditions
to multiple systems at once, rather than configuring each system individually.

## Parameters

### name

`string`

## Returns

[`SystemSet`](/toucan/api/types/systemset/)

## Remarks

A system set is just a label. Configuration (ordering, run conditions) is applied
separately per schedule via [Scheduler.configureSet](/toucan/api/types/scheduler/#configureset).

## Example

```ts
const physics = systemSet('physics')
const rendering = systemSet('rendering')

scheduler()
    .configureSet('update', rendering, { after: physics })
    .useSystem('update', applyForces, { inSet: physics })
    .useSystem('update', resolveCollisions, { inSet: physics })
    .useSystem('update', drawWorld, { inSet: rendering })
    .run()
```
