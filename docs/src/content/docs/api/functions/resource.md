---
editUrl: false
next: false
prev: false
title: "resource"
---

> **resource**\<`Value`\>(`value`, `label?`): [`ResourceHandle`](/api/interfaces/resourcehandle/)\<`Value`\>

Defined in: [src/handle.ts:570](https://github.com/OverlineJunior/toucan/blob/f28f04d91a1f401a88e2816c1566e4ef64224416/src/handle.ts#L570)

Creates a new resource with the given initial `value`.

Resources exist independently of entities (and cannot be attached to them).
They are useful to represent global state, such as game state, settings and so on.

Additionally, a `label` can be provided for easier identification during debugging.

## Type Parameters

### Value

`Value` *extends* `object`

## Parameters

### value

`Value`

### label?

`string`

## Returns

[`ResourceHandle`](/api/interfaces/resourcehandle/)\<`Value`\>

## Exampl

```ts
const GameState = resource('lobby')

function startGame() {
    // `read` and `write` are used instead of `get` and `set` when it comes to
    // interacting with the value of a resource.
    print(`Game state transitioning from ${GameState.read()} to in-game.`)
    GameState.write('in-game')
}
```
