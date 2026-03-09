---
editUrl: false
next: false
prev: false
title: "Query"
---

Defined in: [src/query.ts:12](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/query.ts#L12)

## Type Parameters

### Cs

`Cs` *extends* ([`ComponentHandle`](/api/interfaces/componenthandle/) \| [`Pair`](/api/interfaces/pair/))[]

## Methods

### bind()

> **bind**(`callback`): `System`\<\[\]\>

Defined in: [src/query.ts:187](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/query.ts#L187)

Converts the query into a callback that can be scheduled just like a regular system function.

# Pros

- It's cached, so it's more performant when called multiple times,
  such as in a system scheduled to run every frame;
- Removes the need of an extra layer of indentation in systems.

# Cons

- Cannot be passed optional arguments by `Scheduler.useSystem()`.
- Cannot easily infer a label from function name, requiring it to be manually given by `Scheduler.useSystem()`.

# Example

```ts
const greetPeople = query(Name, Person).bind((_e, name) => {
    print(`Hello, ${name}!`)
})

scheduler()
    .useSystem(greetPeople, UPDATE, [], 'greetPeople')
    .run()

// Equivalent to...

function greetPeople() {
    query(Name, Person).forEach((_e, name) => {
        print(`Hello, ${name}!`)
    })
}

scheduler()
    .useSystem(greetPeople, UPDATE)
    .run()
```

#### Parameters

##### callback

(`entity`, ...`componentValues`) => `void`

#### Returns

`System`\<\[\]\>

***

### collect()

> **collect**(): \[[`Handle`](/api/interfaces/handle/), `...InferValues<Cs>[]`\][]

Defined in: [src/query.ts:139](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/query.ts#L139)

Collects all entities that match the query, returning an array of the entities
themselves and their corresponding component values.

# Warning

This method allocates memory for all entities that match the query, so it should be
used sparingly in performance-critical code.

#### Returns

\[[`Handle`](/api/interfaces/handle/), `...InferValues<Cs>[]`\][]

***

### filter()

> **filter**(`predicate`): `Query`\<`Cs`\>

Defined in: [src/query.ts:61](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/query.ts#L61)

Adds a filter predicate to the query that entities must satisfy in order to be queried.

#### Parameters

##### predicate

(`entity`, ...`components`) => `boolean`

#### Returns

`Query`\<`Cs`\>

***

### find()

> **find**(`predicate`): \[[`Handle`](/api/interfaces/handle/), `...InferValues<Cs>[]`\] \| `undefined`

Defined in: [src/query.ts:83](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/query.ts#L83)

Finds the first entity that matches the query _and_ satisfies the provided
`predicate` function, returning the entity itself and its corresponding
component values, or `undefined` if no such entity exists.

#### Parameters

##### predicate

(`entity`, ...`componentValues`) => `boolean`

#### Returns

\[[`Handle`](/api/interfaces/handle/), `...InferValues<Cs>[]`\] \| `undefined`

***

### forEach()

> **forEach**(`callback`): `void`

Defined in: [src/query.ts:70](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/query.ts#L70)

Iterates over each entity that matches the query, calling the provided `callback`
with the entity itself and its corresponding component values.

#### Parameters

##### callback

(`entity`, ...`componentValues`) => `void`

#### Returns

`void`

***

### map()

> **map**\<`R`\>(`mapper`): `R`[]

Defined in: [src/query.ts:106](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/query.ts#L106)

Maps each entity that matches the query to a new value using the provided
`mapper` function, returning an array of the resulting values.

# ⚠️ Warning

This method allocates memory for all entities that match the query, so it should be
used sparingly in performance-critical code.

#### Type Parameters

##### R

`R` *extends* `defined`

#### Parameters

##### mapper

(`entity`, ...`componentValues`) => `R`

#### Returns

`R`[]

***

### onAdded()

> **onAdded**\<`C`\>(`component`, `callback`): `DisconnectFn`

Defined in: [src/query.ts:212](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/query.ts#L212)

Registers a callback that fires whenever the specified component is added to an
entity that matches this query.

The callback receives the entity, the values of the queried components, and the
newly added component's value.

# Example

```ts
query(Player).onAdded(Health, (entity, player, health) => {
    print(`${health}hp was added to ${player}!`)
})
```

#### Type Parameters

##### C

`C` *extends* [`ComponentHandle`](/api/interfaces/componenthandle/)\<`unknown`\>

#### Parameters

##### component

`C`

##### callback

(`entity`, ...`componentValues`) => `void`

#### Returns

`DisconnectFn`

***

### onChanged()

> **onChanged**\<`C`\>(`component`, `callback`): `DisconnectFn`

Defined in: [src/query.ts:243](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/query.ts#L243)

Registers a callback that fires whenever the specified component's value changes
on an entity that matches this query.

The callback receives the entity, the values of the queried components, the
new value of the changed component, and its previous value.

# Example

```ts
query(Player).onChanged(Health, (entity, player, newHealth, oldHealth) => {
    print(`${player}'s health changed from ${oldHealth} to ${newHealth}!`)
})
```

#### Type Parameters

##### C

`C` *extends* [`ComponentHandle`](/api/interfaces/componenthandle/)\<`unknown`\>

#### Parameters

##### component

`C`

##### callback

(`entity`, ...`componentValues`) => `void`

#### Returns

`DisconnectFn`

***

### onRemoved()

> **onRemoved**\<`C`\>(`component`, `callback`): `DisconnectFn`

Defined in: [src/query.ts:281](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/query.ts#L281)

Registers a callback that fires whenever the specified component is removed from
an entity that matches this query, or when the entity itself is despawned.

The callback receives the entity, the values of the queried components, the
component's last known value before removal, and a boolean indicating if the
removal was caused by the entity despawning.

# Example

```ts
query(Player).onRemoved(Health, (entity, player, oldHealth, despawned) => {
    if (despawned) {
        print(`${player} had ${oldHealth}hp before their entity was completely annihilated.`)
    } else {
        print(`${player} had ${oldHealth}hp before their Health component was removed.`)
    }
})
```

#### Type Parameters

##### C

`C` *extends* [`ComponentHandle`](/api/interfaces/componenthandle/)\<`unknown`\>

#### Parameters

##### component

`C`

##### callback

(`entity`, ...`componentValues`) => `void`

#### Returns

`DisconnectFn`

***

### reduce()

> **reduce**\<`R`\>(`reducer`, `initialValue`): `R`

Defined in: [src/query.ts:120](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/query.ts#L120)

Reduces the entities that match the query to a single value using the provided
`reducer` function and `initialValue`.

#### Type Parameters

##### R

`R`

#### Parameters

##### reducer

(`accumulator`, `entity`, ...`componentValues`) => `R`

##### initialValue

`R`

#### Returns

`R`

***

### with()

> **with**(...`components`): `Query`\<`Cs`\>

Defined in: [src/query.ts:27](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/query.ts#L27)

Includes only entities with _all_ of the specified components in the query's results.

Does not append the values of these components to the results.

#### Parameters

##### components

...([`Pair`](/api/interfaces/pair/)\<`unknown`\> \| [`ComponentHandle`](/api/interfaces/componenthandle/)\<`unknown`\>)[]

#### Returns

`Query`\<`Cs`\>

***

### withAny()

> **withAny**(...`components`): `Query`\<`Cs`\>

Defined in: [src/query.ts:37](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/query.ts#L37)

Includes entities with _any_ of the specified components in the query's results.

Does not append the values of these components to the results.

#### Parameters

##### components

...([`Pair`](/api/interfaces/pair/)\<`unknown`\> \| [`ComponentHandle`](/api/interfaces/componenthandle/)\<`unknown`\>)[]

#### Returns

`Query`\<`Cs`\>

***

### without()

> **without**(...`components`): `Query`\<`Cs`\>

Defined in: [src/query.ts:45](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/query.ts#L45)

Excludes entities with _all_ of the specified components from the query's results.

#### Parameters

##### components

...([`Pair`](/api/interfaces/pair/)\<`unknown`\> \| [`ComponentHandle`](/api/interfaces/componenthandle/)\<`unknown`\>)[]

#### Returns

`Query`\<`Cs`\>

***

### withoutAny()

> **withoutAny**(...`components`): `Query`\<`Cs`\>

Defined in: [src/query.ts:53](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/query.ts#L53)

Excludes entities with _any_ of the specified components from the query's results.

#### Parameters

##### components

...([`Pair`](/api/interfaces/pair/)\<`unknown`\> \| [`ComponentHandle`](/api/interfaces/componenthandle/)\<`unknown`\>)[]

#### Returns

`Query`\<`Cs`\>
