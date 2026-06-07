---
editUrl: false
next: false
prev: false
title: "resource"
---

> **resource**\<`Value`\>(`value`, `label?`): [`ResourceHandle`](/toucan/api/types/resourcehandle/)\<`Value`\>

Defined in: [handle.ts:689](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L689)

Spawns a resource with the given initial `value`.

Resources exist independently of entities (and cannot be attached to them).
They are useful to represent global state, such as game state, settings and so on.

Additionally, a `label` can be provided for easier identification.

## Type Parameters

### Value

`Value` *extends* `object`

## Parameters

### value

`Value`

### label?

`string`

## Returns

[`ResourceHandle`](/toucan/api/types/resourcehandle/)\<`Value`\>

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
