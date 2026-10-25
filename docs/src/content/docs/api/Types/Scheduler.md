---
editUrl: false
next: false
prev: false
title: "Scheduler"
---

Defined in: [scheduler/scheduler.ts:87](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/scheduler.ts#L87)

The type for the scheduler created with [scheduler](/toucan/api/core/scheduler/).

## Methods

### \_\_runSchedule()

> **\_\_runSchedule**(`schedule`): `void`

Defined in: [scheduler/scheduler.ts:313](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/scheduler.ts#L313)

Simulates a single run of the specified `schedule`.

#### Parameters

##### schedule

[`Schedules`](/toucan/api/types/schedules/)

#### Returns

`void`

#### Remarks

This is primarily used for testing - use at your own risk.

***

### \_\_tick()

> **\_\_tick**(): `void`

Defined in: [scheduler/scheduler.ts:323](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/scheduler.ts#L323)

Simulates a `first -> preUpdate -> update -> postUpdate -> last` tick of the scheduler.

#### Returns

`void`

#### Remarks

This is primarily used for testing - use at your own risk.

***

### configureSet()

> **configureSet**(`schedule`, `set`, `config`): `this`

Defined in: [scheduler/scheduler.ts:203](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/scheduler.ts#L203)

Configures a [SystemSet](/toucan/api/types/systemset/) for the specified `schedule` with the given `config`.

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

Defined in: [scheduler/scheduler.ts:272](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/scheduler.ts#L272)

Builds all plugins and then initializes every schedule.

#### Returns

`void`

#### Remarks

Throws if [Scheduler.run](/toucan/api/types/scheduler/#run) is called while the scheduler is already running.

When a schedule is initialized, an entity representing it is spawned and all
related systems are made children of it.

***

### usePlugin()

> **usePlugin**\<`Args`\>(`pluginFn`, ...`args`): `this`

Defined in: [scheduler/scheduler.ts:235](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/scheduler.ts#L235)

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

After a plugin is built, it becomes an entity with the [Builtin.Plugin](/toucan/api/variables/builtin/#plugin) component.
This allows you to inspect metadata about the plugin and manipulate it.

Additionally, every entity spawned within a plugin is automatically given
the `pair(AddedByPlugin, pluginEntity)` relationship.

***

### useSystem()

> **useSystem**\<`Args`\>(`schedule`, `systemFn`, `config?`): `this`

Defined in: [scheduler/scheduler.ts:146](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/scheduler.ts#L146)

Schedules a system to run in the specified `schedule` with the provided arguments.

Optionally, a [SystemConfig](/toucan/api/types/systemconfig/) can be passed to configure the system, such as specifying when it should run or
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
Instead, consider using [Scheduler.useSystemChain](/toucan/api/types/scheduler/#usesystemchain).

#### Example

```ts
scheduler()
    .useSystem('update', runsFirst)
    .useSystem('update', runsSecond, { after: runsFirst })
    .run()
```

#### Introspection

After a system is scheduled, it becomes an entity with the [Builtin.System](/toucan/api/variables/builtin/#system) component.
This allows you to inspect metadata about the system and manipulate it.

Additionally, the system is automatically made a child of its schedule
(i.e. `pair(ChildOf, scheduleEntity)`).

***

### useSystemChain()

> **useSystemChain**\<`T`\>(`schedule`, `systemFns`): `this`

Defined in: [scheduler/scheduler.ts:170](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/scheduler.ts#L170)

Schedules a chain of systems to run in order in the specified `schedule`,
with an optional [SystemConfig](/toucan/api/types/systemconfig/) for each system.

#### Type Parameters

##### T

`T` *extends* `unknown`[][]

#### Parameters

##### schedule

[`Schedules`](/toucan/api/types/schedules/)

##### systemFns

\{ \[K in string \| number \| symbol\]: \[\] extends T\[K\] ? SystemFn\<T\[K\]\> \| \[SystemFn\<T\[K\]\>, SystemConfig\<NoInfer\<T\[K\]\>\>\] : \[SystemFn\<T\[K\]\>, SystemConfig\<NoInfer\<T\[K\]\>\>\] \}

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
