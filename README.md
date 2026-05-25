<h1>
  Toucan<img src="assets/toucan_readme.png" width="100" style="vertical-align: bottom;"/>
</h1>

![Version](https://img.shields.io/badge/status-alpha-orange) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Documentation](https://img.shields.io/badge/docs-starlight-blueviolet)](https://overlinejunior.github.io/toucan/)

**Toucan** is an opinionated [Entity Component System](https://github.com/SanderMertens/ecs-faq) framework for Roblox-TS based on [Jecs](https://github.com/Ukendio/jecs) and [Planck](https://github.com/YetAnotherClown/planck), favoring developer experience over raw performance.

It was created as a way to remove the need to glue together different ECS libraries and allowing the developer to start working on their actual game as soon as possible.

[Documentation](https://overlinejunior.github.io/toucan/)

## Features

- **Fluent API:** entity handles provide chainable methods that abstract away the process of imperatively manipulating entities;

- **Advanced Queries:** query entities whose component just changed, filter it, map it to something useful, you name it;

- **Plugins:** enables better organization of components and systems by grouping them together, which in turn also allows for third-party plugins that are easy to integrate;

- **Phases:** systems are assigned to predefined phases in order to resolve dependencies between them with less coupling;

- **Hooks:** built-in topologically aware functions, such as `useDeltaTime` and `useThrottledMemo`;

- **Everything is an Entity:** components, resources, systems and plugins are also entities, allowing you to assign them metadata and inspect them.

## Example

```ts
import { component, entity, pair, query, scheduler, Scheduler, STARTUP, UPDATE, Wildcard } from '@rbxts/toucan'

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
	.with(pair(Likes, Wildcard))
	.bind((subject, age) => {
		subject.targetsOf(Likes).forEach((interest) => {
			print(`Hey ${interest}, nice to meet you! I'm ${subject} and my age is ${age}.`)
		})
	})

function greetingPlugin(scheduler: Scheduler) {
	scheduler.useSystem(spawnPeople, STARTUP).useSystem(greetInterests, UPDATE)
}

scheduler().usePlugin(greetingPlugin).run()
```

## Installation

```bash
npm install @rbxts/toucan
yarn add @rbxts/toucan
pnpm add @rbxts/toucan
bun add @rbxts/toucan
```

## Development

1. Before anything, make sure you have [bun](https://bun.sh) and [rokit](https://github.com/rojo-rbx/rokit) installed in your system;

1. Then, run `bun run setup` to install dependencies across the entire project;

1. Finally, run `bun run dev` to start development.
