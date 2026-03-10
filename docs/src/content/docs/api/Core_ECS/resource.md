---
editUrl: false
next: false
prev: false
title: "resource"
---

> **resource**\<`Value`\>(`value`, `label?`): [`ResourceHandle`](/toucan/api/core_ecs/resourcehandle/)\<`Value`\>

Defined in: [handle.ts:601](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/handle.ts#L601)

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

[`ResourceHandle`](/toucan/api/core_ecs/resourcehandle/)\<`Value`\>

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
