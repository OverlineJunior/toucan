---
editUrl: false
next: false
prev: false
title: "Scheduler"
---

Defined in: [src/scheduler.ts:173](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler.ts#L173)

The starting point of a game made with Toucan.

## Methods

### run()

> **run**(): `this`

Defined in: [src/scheduler.ts:271](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler.ts#L271)

Synchronously builds all initially registered plugins (user-defined first),
and then bootstraps the engine to run all systems on their respective phases.

Systems and plugins scheduled dynamically after the scheduler is already running will
be picked up automatically on the next frame (with the exception of the `STARTUP` phase,
which only fires once during this method call).

#### Returns

`this`

***

### usePlugin()

> **usePlugin**\<`Args`\>(`plugin`, ...`args`): `this`

Defined in: [src/scheduler.ts:258](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler.ts#L258)

Schedules a plugin to be built, passing it the scheduler itself and the
provided arguments.

#### Reflection

Plugins are entities with the standard `Plugin` component, thus, they can be
queried and manipulated like any other entity in Toucan.

Plugins scheduled within other plugins are automatically parented to the
parent plugin.

#### Type Parameters

##### Args

`Args` *extends* `defined`[]

#### Parameters

##### plugin

`Plugin`\<`Args`\>

##### args

...`Args`

#### Returns

`this`

#### Example

```ts
function updatePhysics(gravity: number) { ... }

function physicsPlugin(scheduler: Scheduler, gravity: number) {
    scheduler.useSystem(updatePhysics, UPDATE, gravity)
}

scheduler()
   .usePlugin(physicsPlugin, 196.2)
   .run()
```

***

### useSystem()

> **useSystem**\<`Args`\>(`system`, `phase`, ...`args`): `this`

Defined in: [src/scheduler.ts:214](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler.ts#L214)

Schedules a system to run in the specified phase with the provided arguments.

The system's label is inferred from the function name. If the function is anonymous,
a default label is generated instead.

#### Type Parameters

##### Args

`Args` *extends* `defined`[]

#### Parameters

##### system

`System`\<`Args`\>

##### phase

[`Phase`](/toucan/api/interfaces/phase/)

##### args

...`Args`

#### Returns

`this`

#### Examples

```ts
function fireGun(params: RaycastParams) { ... }

scheduler()
    .useSystem(fireGun, UPDATE, new RaycastParams())
    .run()
```

#### Implicit Execution Order

If multiple systems are registered in the same phase, they will be executed in the
order they were registered in the codebase.

Phases should still be the main tool for controlling execution order, but this allows
for more fine-grained control when creating an entire new phase would be overkill.

```ts
scheduler()
    .useSystem(runsFirst, UPDATE)
	   .useSystem(runsSecond, UPDATE)
	   .run()
```

#### Reflection

Systems are entities with the standard `System` component, thus, they can be
queried and manipulated like any other entity in Toucan.

Systems scheduled within plugins are automatically parented to the plugin.

***

### useSystemWithLabel()

> **useSystemWithLabel**\<`Args`\>(`system`, `phase`, `label`, ...`args`): `this`

Defined in: [src/scheduler.ts:223](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler.ts#L223)

Similar to `useSystem`, but allows you to specify a custom label for the system.
Useful for anonymous functions.

#### Type Parameters

##### Args

`Args` *extends* `defined`[]

#### Parameters

##### system

`System`\<`Args`\>

##### phase

[`Phase`](/toucan/api/interfaces/phase/)

##### label

`string`

##### args

...`Args`

#### Returns

`this`
