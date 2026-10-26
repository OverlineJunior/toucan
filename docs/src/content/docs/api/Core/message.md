---
editUrl: false
next: false
prev: false
title: "message"
---

> **message**\<`Args`\>(...`args`): `void`

Defined in: [message.ts:116](https://github.com/OverlineJunior/toucan/blob/master/src/message.ts#L116)

Spawns a message entity with the given terms and emits it.

Tags are passed as bare components or pairs, while components and pairs with
a value are passed as `[term, value]` tuples.

See [Query.on](/toucan/api/types/query/#on) to read messages.

## Type Parameters

### Args

`Args` *extends* readonly \[`Payload`, `Payload`\]

## Parameters

### args

...`ValidArgs`\<`Args`\>

## Returns

`void`

## Example

```ts
const Died = component()
const Damage = component<number>()
const Attacker = component()
const Bounty = component<number>()

const goblin = entity()

message(
    Died,
    [Damage, 25],
    pair(Attacker, goblin),
    [pair(Bounty, goblin), 10],
)
```
