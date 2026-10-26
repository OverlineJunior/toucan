---
title: Plugins & Resources
sidebar:
  order: 4
---

Now that you know how to schedule systems, let's look at how to organize them into plugins and how to share global state with resources!

## Plugins

A [plugin](/toucan/api/types/pluginfn) is a function that receives the scheduler and registers systems or even other plugins. They encourage you to group by feature instead of by type and make it easy to publish utilities to the public.

```ts
import {
  component,
  entity,
  query,
  scheduler,
  type Scheduler,
} from "@rbxts/toucan";

const Health = component<number>();

function spawnEnemies() {
  entity("Goblin").set(Health, 50);
}

const regenerate = query(Health).bind((e, health) => {
  e.set(Health, health + 1);
});

function healthPlugin(scheduler: Scheduler) {
  scheduler.useSystem("startup", spawnEnemies).useSystem("update", regenerate);
}

scheduler().usePlugin(healthPlugin).run();
```

Plugins are registered with [`usePlugin`](/toucan/api/types/scheduler/#useplugin) and built when `run` is called, before any schedule starts. Inside a plugin, you register systems with `useSystem` exactly like you would outside of one.

### Plugin arguments

Like systems, plugins can receive arguments:

```ts
function physicsPlugin(scheduler: Scheduler, gravity: number) {
  scheduler.useSystem("update", applyGravity, { args: [gravity] });
}

scheduler().usePlugin(physicsPlugin, 196.2).run();
```

### Nested plugins

A plugin can register other plugins through the scheduler it receives:

```ts
function movementPlugin(scheduler: Scheduler) {
  scheduler.useSystem("update", moveCharacters);
}

function gameplayPlugin(scheduler: Scheduler) {
  scheduler.usePlugin(movementPlugin).useSystem("update", updateScore);
}

scheduler().usePlugin(gameplayPlugin).run();
```

## Resources

A [resource](/toucan/api/core/resource) is a global value that exists independently of entities. Unlike components, resources can't be attached to entities — use them for game state, settings, and other shared data.

Read and write a resource's value with [`read`](/toucan/api/types/resource/#read) and [`write`](/toucan/api/types/resource/#write):

```ts
import { resource } from "@rbxts/toucan";

const GameState = resource("lobby", "GameState");

print(GameState.read()); // lobby

GameState.write("in-game");

print(GameState.read()); // in-game
```

### Reacting to changes

Resources expose an `onChanged` callback, which returns a function that unsubscribes:

```ts
const unsubscribe = GameState.onChanged((newState, oldState) => {
  print(`Game state changed from ${oldState} to ${newState}`);
});
```

### Why not a global variable?

Resources are handles to mutable state, not copies. Passing one to a plugin gives it a stable reference that always reads the current value; a plain global would only pass a snapshot, and wrapping it in a table would force you to change how the rest of your game accesses it.

Resources also encourage splitting game state into focused pieces instead of one god object, so each plugin depends only on what it needs.
