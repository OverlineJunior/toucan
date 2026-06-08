---
editUrl: false
next: false
prev: false
title: "Scheduler"
---

Defined in: [scheduler/scheduler.ts:103](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/scheduler.ts#L103)

The type for the scheduler created with [scheduler](/toucan/api/core/scheduler/).

## Methods

### configureSet()

> **configureSet**(`schedule`, `set`, `config`): `this`

Defined in: [scheduler/scheduler.ts:213](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/scheduler.ts#L213)

Configures a `SystemSet` for the specified `schedule` with the given `config`.

#### Parameters

##### schedule

[`Schedules`](/toucan/api/types/schedules/)

##### set

[`SystemSet`](/toucan/api/types/systemset/)

##### config

[`SetConfig`](/toucan/api/types/setconfig/)

#### Returns

`this`

#### Remarks

System set configuration is per schedule, meaning the same system set can be configured
differently for each schedule.

#### Example

```ts
const sense = new SystemSet('sense')
const think = new SystemSet('think')
const act = new SystemSet('act')

scheduler()
    // System sets that don't need configuration don't need to be configured.
    .configureSet('update', think, { after: sense })
    .configureSet('update', act, { after: think })
    .run()
```

***

### run()

> **run**(): `void`

Defined in: [scheduler/scheduler.ts:282](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/scheduler.ts#L282)

Builds all plugins and then initializes every schedule.

#### Returns

`void`

#### Remarks

Throws if `run` is called while the scheduler is already running.

When a schedule is initialized, an entity representing it is spawned and all
related systems are made children of it.

***

### usePlugin()

> **usePlugin**\<`Args`\>(`pluginFn`, ...`args`): `this`

Defined in: [scheduler/scheduler.ts:245](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/scheduler.ts#L245)

Registers a plugin function to be run before the scheduler starts. This function is
given the scheduler and anything else passed in `...args`.

#### Type Parameters

##### Args

`Args` *extends* `unknown`[]

#### Parameters

##### pluginFn

[`PluginFn`](/toucan/api/types/pluginfn/)\<`Args`\>

##### args

...`Args`

#### Returns

`this`

#### Remarks

Throws when given an arrow function, as plugins strictly require an inferable name.

#### Example

```ts
function physics(scheduler: Scheduler, gravity: number) {
    scheduler.useSystem('update', updatePhysics, { args: gravity })
}

scheduler()
   .usePlugin(physics, 196.2)
   .run()
```

#### Introspection

After a plugin is built, it becomes an entity with the `Plugin` component.
This allows you to inspect metadata about the plugin and manipulate it.

Additionally, every entity spawned within a plugin is automatically given
the `pair(AddedByPlugin, pluginEntity)` relationship.

***

### useSystem()

> **useSystem**\<`Args`\>(`schedule`, `systemFn`, `config?`): `this`

Defined in: [scheduler/scheduler.ts:160](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/scheduler.ts#L160)

Schedules a system to run in the specified `schedule` with the provided arguments.

Optionally, a `SystemConfig` can be passed to configure the system, such as specifying when it should run or
in which system set it should belong.

#### Type Parameters

##### Args

`Args` *extends* `unknown`[]

#### Parameters

##### schedule

[`Schedules`](/toucan/api/types/schedules/)

##### systemFn

[`SystemFn`](/toucan/api/types/systemfn/)\<`Args`\>

##### config?

[`SystemConfig`](/toucan/api/types/systemconfig/)\<`Args`\>

#### Returns

`this`

#### Remarks

It cannot be assumed that two systems scheduled in the same phase will run in the order they were registered.
Instead, consider using `useSystemChain`.

#### Example

```ts
scheduler()
    .useSystem('update', runsFirst)
    .useSystem('update', runsSecond, { after: runsFirst })
    .run()
```

#### Introspection

After a system is scheduled, it becomes an entity with the `System` component.
This allows you to inspect metadata about the system and manipulate it.

Additionally, the system is automatically made a child of its schedule
(i.e. `pair(ChildOf, scheduleEntity)`).

***

### useSystemChain()

> **useSystemChain**(`schedule`, ...`systemFns`): `this`

Defined in: [scheduler/scheduler.ts:184](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/scheduler.ts#L184)

Schedules a chain of systems to run in order in the specified `schedule`,
with an optional `SystemConfig` for each system.

#### Parameters

##### schedule

[`Schedules`](/toucan/api/types/schedules/)

##### systemFns

...([`SystemFn`](/toucan/api/types/systemfn/) \| \[[`SystemFn`](/toucan/api/types/systemfn/), [`SystemConfig`](/toucan/api/types/systemconfig/)\<`unknown`[]\>\])[]

#### Returns

`this`

#### Example

```ts
scheduler()
    .useSystemChain('update', [
        gatherInput, // Implicitly runs before `drawUI`.
        [drawUI, { runIf: !inCinematicMode }],
    ])
    .run()
```
