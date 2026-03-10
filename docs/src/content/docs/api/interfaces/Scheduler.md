---
editUrl: false
next: false
prev: false
title: "Scheduler"
---

Defined in: [src/scheduler.ts:165](https://github.com/OverlineJunior/toucan/blob/f28f04d91a1f401a88e2816c1566e4ef64224416/src/scheduler.ts#L165)

The starting point of a game made with Toucan.

## Methods

### run()

> **run**(): `this`

Defined in: [src/scheduler.ts:228](https://github.com/OverlineJunior/toucan/blob/f28f04d91a1f401a88e2816c1566e4ef64224416/src/scheduler.ts#L228)

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

Defined in: [src/scheduler.ts:215](https://github.com/OverlineJunior/toucan/blob/f28f04d91a1f401a88e2816c1566e4ef64224416/src/scheduler.ts#L215)

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

> **useSystem**\<`Args`\>(`system`, `phase`, `args?`, `label?`): `this`

Defined in: [src/scheduler.ts:185](https://github.com/OverlineJunior/toucan/blob/f28f04d91a1f401a88e2816c1566e4ef64224416/src/scheduler.ts#L185)

Schedules a system to run in the specified phase with the provided arguments.

#### Reflection

Systems are entities with the standard `System` component, thus, they can be
queried and manipulated like any other entity in Toucan.

Systems scheduled within plugins are automatically parented to the plugin.

#### Type Parameters

##### Args

`Args` *extends* `defined`[]

#### Parameters

##### system

`System`\<`Args`\>

##### phase

[`Phase`](/api/interfaces/phase/)

##### args?

`Args`

##### label?

`string`

#### Returns

`this`

#### Example

```ts
function fireGun(params: RaycastParams) { ... }

scheduler()
    .addSystems(UPDATE, [fireGun], new RaycastParams())
    .run()
```
