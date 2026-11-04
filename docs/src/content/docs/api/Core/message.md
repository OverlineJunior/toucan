---
editUrl: false
next: false
prev: false
title: "message"
---

> **message**\<`Payload`\>(...`args`): `void`

Defined in: [message.ts:103](https://github.com/OverlineJunior/toucan/blob/master/src/message.ts#L103)

Spawns a message entity with the given terms and emits it.

Tags are passed as bare components or pairs, while components and pairs with
a value are passed as `[term, value]` tuples.

See [Query.on](/toucan/api/types/query/#on) to read messages.

## Type Parameters

### Payload

`Payload` *extends* `MessagePayload`

## Parameters

### args

...[`ValidatedComponentPayload`](/toucan/api/types/validatedcomponentpayload/)\<`Payload`\>

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
