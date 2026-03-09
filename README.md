<div align="left">
  <img src="assets/toucan.png" width="100" />
</div>

# Toucan

![Version](https://img.shields.io/badge/status-alpha-orange) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Toucan** is an opinionated [Entity Component System](https://github.com/SanderMertens/ecs-faq) framework for Roblox-TS based on [Jecs](https://github.com/Ukendio/jecs) and [Planck](https://github.com/YetAnotherClown/planck), favoring developer experience over raw performance.

It was created as a way to remove the need to glue together different ECS libraries and allowing the developer to start working on their actual game as soon as possible.

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
```

# Testing Workflow

Given `toucan` and a test game `toucan-test`, in order to automatically send changes over, you must first follow the steps below a single time only:

+ On `toucan`, run `npm run build`, then `yalc publish`
+ On `toucan-test`, run `yalc add @rbxts/toucan`, then `npm install`

Then, in order to start testing `toucan` on `toucan-test`, run `npm run watch` on `toucan`.

## Fallback

In case `yalc` fails, the script `packInstall` works as a fallback, packaging `toucan` and installing it on `toucan-test`. Just remember to update it to reference the right test game.
