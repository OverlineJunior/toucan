---
title: Messages
sidebar:
  order: 5
---

Now that you know how to organize systems into plugins and share state with resources, let's look at how systems send events to each other with messages!

## Emitting Messages

A [message](/toucan/api/core/message) is an event that systems can send and receive without depending on each other. Calling `message(...)` spawns a short-lived entity carrying the given components (or pairs) and emits it:

```ts
import { component, entity, message, pair } from "@rbxts/toucan";

const Died = component("Died");
const Damage = component<number>("Damage");
const Attacker = component("Attacker");

const goblin = entity("Goblin");

// Tags are passed bare; valued terms are `[term, value]` tuples.
message(Died, [Damage, 25], pair(Attacker, goblin));
```

Every call creates a new entity, so emitting the same message twice produces two distinct messages.

## Reading Messages

Read messages with [`on`](/toucan/api/types/query/#on), which filters a query down to the messages that have all of the given terms:

```ts
import { query } from "@rbxts/toucan";

function announceDeaths() {
  query()
    .on(Died, Damage)
    .forEach((_msg, damage) => {
      print(`Something died after taking ${damage} damage`);
    });
}
```

### Pairing with entities

If the query has its own terms, each message is paired with every entity that matches them. The callback receives the entity and its values first, then the message and its values:

```ts
const Health = component<number>("Health");

function applyDamage() {
  query(Health)
    .on(Damage)
    .forEach((e, health, _msg, damage) => {
      e.set(Health, health - damage);
    });
}
```

## Delivery and Lifetime

A message lives through the frame it was emitted in and the next one. Systems that run after the emitter in the same frame read it immediately; systems that run before it read it on the next frame:

```ts
scheduler().useSystemChain("update", [readMessages, emitMessages]).run();
```

Here, `readMessages` runs first and has nothing to read. Then, `emitMessages` runs and sends the message. Finally on the next frame, `readMessages` runs again and this time reads the message.

Messages are despawned after two frames, so anything that hasn't read them by then misses them. This is specially important to know if your system has a run condition.

### Canceling messages

Because a message is just an entity, you can despawn it yourself once it has served its purpose, and it will no longer be delivered to later systems.

```ts
query()
  .on(Damage)
  .forEach((msg, damage) => {
    applyDamage(damage);
    msg.despawn(); // Later systems won't see this message.
  });
```

## When Not to Use Messages

Every message is a new entity, so emitting them at a high frequency — every frame, for example — creates a lot of short-lived entities and adds overhead. For state that changes often, prefer reacting to the component itself with [`onChanged`](/toucan/api/types/component/#onchanged).

## What's Next?

Messages let systems react to events without knowing about each other. Next, learn how to model connections between entities with relationships.
