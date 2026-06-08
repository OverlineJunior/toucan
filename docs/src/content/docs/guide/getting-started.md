---
title: Getting Started
sidebar:
  order: 1
---

Toucan is an opinionated _Entity Component System_ (ECS) framework for roblox-ts, inspired by [Bevy](https://bevy.org/), the Rust game engine. It is designed to be fun to use and to spare you from gluing together different libraries just to get started on your game.

## Installation

You can install Toucan using _npm_ or any other package manager that supports roblox-ts:

```bash
npm install toucan
```

## Core Concepts

Toucan, as any other ECS library or framework, is built around the same core concepts of entities, components, and systems:

- **Entity**: a unique identifier for something in your game, be it a player, a GUI element, or even a status effect.
- **Component**: a piece of data that is attached to an entity, such as position, health, or mood.
- **System**: a function that operates on entities and their components, such as a movement system or a rendering system.

With just these three simple concepts, ECS lets you build games in a more composable way — no deep inheritance hierarchies or monolithic objects that do everything. Behavior emerges from the way small, focused pieces interact, making it easy to iterate and reason about your game as it grows.

That said, there's a lot more to the pattern than this overview can cover. If you'd like to understand it more thoroughly, I recommend the [ECS FAQ](https://github.com/SanderMertens/ecs-faq), which was written by Sander Mertens, the author of [Flecs](https://www.flecs.dev/flecs/) — a very popular ECS library for C/C++.

## What's Next?

As the guide is still being worked on, the remaining topics are still being written. Because of this, I recommend reading the [API reference](/toucan/api/core/component) instead, which has already been written.
