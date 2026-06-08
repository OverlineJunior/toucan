<h1>
  Toucan<img src="assets/toucan_readme.png" width="100" style="vertical-align: bottom;"/>
</h1>

![Version](https://img.shields.io/badge/status-alpha-orange) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Documentation](https://img.shields.io/badge/docs-starlight-blueviolet)](https://overlinejunior.github.io/toucan/)

**Toucan** is an opinionated [Entity Component System](https://github.com/SanderMertens/ecs-faq) framework for Roblox-TS inspired by Rust's [Bevy](https://bevy.org/), favoring developer experience over raw performance.

Currently, it is in alpha stage and is not yet ready for production. The [documentation](https://overlinejunior.github.io/toucan/) is still being worked on.

## Features

- **Fluent API:** chain methods directly on entity handles to spawn, add, remove, or modify components in a single expression, without the verbosity of step-by-step imperative manipulation;

- **Expressive Queries:** easily query over all entities, entities that have changed, or entities that relate to each other. Then, chain query results to filter, map, or reduce them further;

- **Plugins:** components and systems are better organized when grouped together within a plugin, which in turn also allows for third-party plugins that are easy to integrate;

- **Standard Schedules:** systems are assigned to predefined schedules that are based on Roblox's [standard update loop](https://create.roblox.com/docs/reference/engine/classes/RunService), allowing you to easily decide when and how often to run each system;

- **System Sets:** systems can be grouped together into sets, allowing them to share a single configuration and run together as a unit. This also allows you to define your game's own custom pipeline, such as `Setup -> Physics -> Rendering`;

- **Everything is an Entity:** components, systems, plugins, resources, schedules, you name it — everything is an entity, meaning they can all be inspected and edited at runtime.

## Example

```ts
import { component, entity, pair, query, scheduler, Scheduler, Builtin } from '@rbxts/toucan'

const Age = component<number>()
const Likes = component()

function spawnPeople() {
	const bob = entity('Bob').set(Age, 22)
	const charlie = entity('Charlie').set(Age, 42)

	entity('Alice')
		.set(Age, 25)
		.set(pair(Likes, bob))
		.set(pair(Likes, charlie))
}

const greetInterests = query(Age)
	.with(pair(Likes, Builtin.Wildcard))
	.bind((subject, age) => {
		subject.targetsOf(Likes).forEach((interest) => {
			print(`Hey ${interest}, nice to meet you! I'm ${subject} and my age is ${age}!1!`)
		})
	})

function greetingPlugin(scheduler: Scheduler) {
    scheduler
        .useSystem('startup', spawnPeople)
        .useSystem('update', greetInterests)
}

scheduler()
    .usePlugin(greetingPlugin)
    .run()
```

## Installation

```bash
npm install @rbxts/toucan
yarn add @rbxts/toucan
pnpm add @rbxts/toucan
bun add @rbxts/toucan
```

## Development

1. First, make sure you have [bun](https://bun.sh) and [rokit](https://github.com/rojo-rbx/rokit) installed in your system;

1. Then, run `bun run setup` to install dependencies across the entire project;

1. Finally, run `bun run dev` to start development.
