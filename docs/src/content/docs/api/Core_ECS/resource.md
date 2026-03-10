---
editUrl: false
next: false
prev: false
title: "resource"
---

> **resource**\<`Value`\>(`value`, `label?`): [`ResourceHandle`](/api/core_ecs/resourcehandle/)\<`Value`\>

Defined in: [src/handle.ts:601](https://github.com/OverlineJunior/toucan/blob/4cdfd0dfe43e8538887a71db35f0a7b92648a8e5/src/handle.ts#L601)

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

[`ResourceHandle`](/api/core_ecs/resourcehandle/)\<`Value`\>

## Example

```ts
const GameState = resource('lobby')

function startGame() {
    // `read` and `write` are used instead of `get` and `set` when it comes to
    // interacting with the value of a resource.
    print(`Game state transitioning from ${GameState.read()} to in-game.`)
    GameState.write('in-game')
}
```
