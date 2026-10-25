---
editUrl: false
next: false
prev: false
title: "resource"
---

> **resource**\<`Value`\>(`value`, `label?`): [`Resource`](/toucan/api/types/resource/)\<`Value`\>

Defined in: [entities/index.ts:727](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L727)

Creates a new [Resource](/toucan/api/types/resource/) with the given initial `value`.

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

[`Resource`](/toucan/api/types/resource/)\<`Value`\>

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
