---
title: Systems & Schedules
sidebar:
  order: 3
---

Now that you know how to store data with entities and components, let's look at how you make it _do_ something with systems and schedules!

## Systems

A [system](/toucan/api/types/systemfn) is a function that operates on the world — usually by running queries and modifying components. The [scheduler](/toucan/api/core/scheduler) is responsible for calling systems at the right time.

```ts
import { component, entity, query, scheduler } from "@rbxts/toucan";

const Health = component<number>();

function spawnEnemies() {
  for (let i = 1; i <= 3; i++) {
    entity(`Enemy ${i}`).set(Health, 100);
  }
}

const regenerate = query(Health).bind((e, health) => {
  e.set(Health, health + 1);
});

scheduler()
  .useSystem("startup", spawnEnemies)
  .useSystem("update", regenerate)
  .run();
```

Systems are registered with [`useSystem`](/toucan/api/types/scheduler/#usesystem), which takes a schedule, the system function, and an optional [`SystemConfig`](/toucan/api/types/systemconfig). Once [`run`](/toucan/api/types/scheduler/#run) is called, the scheduler starts running and no more systems can be registered. Only one scheduler can exist at a time, so call `scheduler()` once.

### Passing arguments

Systems receive no arguments by default. Use `args` to pass values that stay fixed for the lifetime of the system:

```ts
function healOverTime(amount: number) {
  query(Health).forEach((e, health) => e.set(Health, health + amount));
}

scheduler()
  .useSystem("update", healOverTime, { args: [5] })
  .run();
```

### Running conditionally

A system can be skipped for a given run with `runIf`. If you pass an array, every condition must return `true`:

```ts
scheduler()
  .useSystem("update", tickRoundTimer, { runIf: isRoundActive })
  .useSystem("update", renderMinimap, {
    runIf: [isRoundActive, isMinimapOpen],
  })
  .run();
```

## Schedules

[Schedules](/toucan/api/types/schedules) decide _when_ systems run. Toucan provides the following schedules:

| Group        | Schedules                                                      | Runs                                    |
| ------------ | -------------------------------------------------------------- | --------------------------------------- |
| Startup      | `preStartup`, `startup`, `postStartup`                         | Once, in order, when the game starts    |
| Update       | `first`, `preUpdate`, `update`, `postUpdate`, `last`           | Every `Heartbeat`, in order             |
| `RunService` | `preRender`, `preAnimation`, `preSimulation`, `postSimulation` | On the corresponding `RunService` event |

Calling `run()` executes the startup schedules once, then starts the update and `RunService` schedules.

Use startup schedules to set up the world, and update schedules for anything that happens every frame:

```ts
scheduler()
  .useSystem("startup", spawnWorld)
  .useSystem("update", moveCharacters)
  .useSystem("postUpdate", updateVisuals)
  .run();
```

### Ordering systems

Systems in the same schedule don't necessarily run in the order they were registered. Use `before` and `after` to be explicit:

```ts
scheduler()
  .useSystem("update", applyForces)
  .useSystem("update", resolveCollisions, { after: applyForces })
  .useSystem("update", moveCharacters)
  .run();
```

For a sequence of systems, [`useSystemChain`](/toucan/api/types/scheduler/#usesystemchain) is a shorthand that orders each entry before the next one:

```ts
scheduler()
  .useSystemChain("update", [
    gatherInput,
    updatePhysics, // Runs after `gatherInput`.
    [updateCamera, { runIf: isThirdPerson }],
  ])
  .run();
```

### System sets

A [system set](/toucan/api/types/systemset) groups systems so they can share ordering rules and run conditions. Create one with [`systemSet`](/toucan/api/core/systemset), configure it per schedule with [`configureSet`](/toucan/api/types/scheduler/#configureset), and assign systems to it with `inSet`:

```ts
import { scheduler, systemSet } from "@rbxts/toucan";

const physics = systemSet("physics");
const rendering = systemSet("rendering");

scheduler()
  .configureSet("update", rendering, { after: physics })
  .useSystem("update", applyForces, { inSet: physics })
  .useSystem("update", resolveCollisions, { inSet: physics })
  .useSystem("update", drawWorld, { inSet: rendering })
  .run();
```

Systems inherit their set's ordering and `runIf` conditions. A system can belong to more than one set, and the same set can be used across different schedules.
