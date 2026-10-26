---
editUrl: false
next: false
prev: false
title: "message"
---

> **message**\<`const Args`\>(`...args`): [`Entity`](/toucan/api/types/entity/)

Defined in: [message.ts:122](https://github.com/OverlineJunior/toucan/blob/master/src/message.ts#L122)

Creates a message entity with the given terms and emits it.

Tags are passed as bare components or pairs, while components and pairs with
a value are passed as `[term, value]` tuples.

## Type Parameters

### Args

`const Args` extends readonly [`MessageArg`, ...`MessageArg`[]]

## Parameters

### args

...`Args`

## Returns

[`Entity`](/toucan/api/types/entity/)

## Example

```ts
const Died = component();
const Damage = component<number>();
const Attacker = component();
const Bounty = component<number>();

const goblin = entity();

// A lethal hit for 25 damage from the goblin, worth a 10 bounty.
message(Died, [Damage, 25], pair(Attacker, goblin), [pair(Bounty, goblin), 10]);
```
