---
editUrl: false
next: false
prev: false
title: "Query"
---

Defined in: [src/query.ts:36](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/query.ts#L36)

Created with [query](/api/core_ecs/query-1/), it represents a set of criteria used to filter and iterate over entities based on their components.

Queries provide a fluent, chainable API to define strict matching rules (such as requiring or
excluding specific components) and offer various ways to consume the matching entities. You can
iterate over them (`forEach`, `map`), listen to their lifecycle events (`onAdded`, `onChanged`),
or bind them directly into optimized system callbacks (`bind`).

## Example

```ts
// 1. Define the query.
const healthyMovers = query(Health, Position)
    .with(Velocity)
    .without(Stunned)
    .filter((_entity, health, _position) => health > 0)

// 2. Consume the query.
healthyMovers.forEach((entity, health, position) => {
    print(`Entity ${entity.id} is moving with ${health}hp at ${position}!`)
})
```

## Type Parameters

### Cs

`Cs` *extends* ([`ComponentHandle`](/api/core_ecs/componenthandle/) \| [`Pair`](/api/core_ecs/pair/))[]

## Methods

### bind()

> **bind**(`callback`): `System`\<\[\]\>

Defined in: [src/query.ts:206](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/query.ts#L206)

Converts the query into a callback that can be scheduled just like a regular system function.

#### Pros:
- It's cached, so it's more performant when called multiple times,
  such as in a system scheduled to run every frame;
- Removes the need of an extra layer of indentation in systems.

#### Cons:
- Cannot be passed optional arguments by `Scheduler.useSystem()`.
- Cannot easily infer a label from function name, requiring it to be manually given by `Scheduler.useSystem()`.

#### Parameters

##### callback

(`entity`, ...`componentValues`) => `void`

#### Returns

`System`\<\[\]\>

#### Example

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

***

### collect()

> **collect**(): \[[`Handle`](/api/core_ecs/handle/), `...InferValues<Cs>[]`\][]

Defined in: [src/query.ts:161](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/query.ts#L161)

Collects all entities that match the query, returning an array of the entities
themselves and their corresponding component values.

#### Returns

\[[`Handle`](/api/core_ecs/handle/), `...InferValues<Cs>[]`\][]

#### Remarks

⚠️ This method allocates memory for all entities that match the query, so it should be
used sparingly in performance-critical code.

***

### filter()

> **filter**(`predicate`): `Query`\<`Cs`\>

Defined in: [src/query.ts:85](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/query.ts#L85)

Adds a filter predicate to the query that entities must satisfy in order to be queried.

#### Parameters

##### predicate

(`entity`, ...`components`) => `boolean`

#### Returns

`Query`\<`Cs`\>

***

### find()

> **find**(`predicate`): \[[`Handle`](/api/core_ecs/handle/), `...InferValues<Cs>[]`\] \| `undefined`

Defined in: [src/query.ts:107](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/query.ts#L107)

Finds the first entity that matches the query _and_ satisfies the provided
`predicate` function, returning the entity itself and its corresponding
component values, or `undefined` if no such entity exists.

#### Parameters

##### predicate

(`entity`, ...`componentValues`) => `boolean`

#### Returns

\[[`Handle`](/api/core_ecs/handle/), `...InferValues<Cs>[]`\] \| `undefined`

***

### forEach()

> **forEach**(`callback`): `void`

Defined in: [src/query.ts:94](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/query.ts#L94)

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

Defined in: [src/query.ts:129](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/query.ts#L129)

Maps each entity that matches the query to a new value using the provided
`mapper` function, returning an array of the resulting values.

#### Type Parameters

##### R

`R` *extends* `defined`

#### Parameters

##### mapper

(`entity`, ...`componentValues`) => `R`

#### Returns

`R`[]

#### Remarks

⚠️ This method allocates memory for all entities that match the query, so it should be
used sparingly in performance-critical code.

***

### onAdded()

> **onAdded**\<`C`\>(`component`, `callback`): `DisconnectFn`

Defined in: [src/query.ts:230](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/query.ts#L230)

Registers a callback that fires whenever the specified component is added to an
entity that matches this query.

The callback receives the entity, the values of the queried components, and the
newly added component's value.

#### Type Parameters

##### C

`C` *extends* [`ComponentHandle`](/api/core_ecs/componenthandle/)\<`unknown`\>

#### Parameters

##### component

`C`

##### callback

(`entity`, ...`componentValues`) => `void`

#### Returns

`DisconnectFn`

#### Example

```ts
query(Player).onAdded(Health, (entity, player, health) => {
    print(`${health}hp was added to ${player}!`)
})
```

***

### onChanged()

> **onChanged**\<`C`\>(`component`, `callback`): `DisconnectFn`

Defined in: [src/query.ts:260](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/query.ts#L260)

Registers a callback that fires whenever the specified component's value changes
on an entity that matches this query.

The callback receives the entity, the values of the queried components, the
new value of the changed component, and its previous value.

#### Type Parameters

##### C

`C` *extends* [`ComponentHandle`](/api/core_ecs/componenthandle/)\<`unknown`\>

#### Parameters

##### component

`C`

##### callback

(`entity`, ...`componentValues`) => `void`

#### Returns

`DisconnectFn`

#### Example

```ts
query(Player).onChanged(Health, (entity, player, newHealth, oldHealth) => {
    print(`${player}'s health changed from ${oldHealth} to ${newHealth}!`)
})
```

***

### onRemoved()

> **onRemoved**\<`C`\>(`component`, `callback`): `DisconnectFn`

Defined in: [src/query.ts:297](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/query.ts#L297)

Registers a callback that fires whenever the specified component is removed from
an entity that matches this query, or when the entity itself is despawned.

The callback receives the entity, the values of the queried components, the
component's last known value before removal, and a boolean indicating if the
removal was caused by the entity despawning.

#### Type Parameters

##### C

`C` *extends* [`ComponentHandle`](/api/core_ecs/componenthandle/)\<`unknown`\>

#### Parameters

##### component

`C`

##### callback

(`entity`, ...`componentValues`) => `void`

#### Returns

`DisconnectFn`

#### Example

```ts
query(Player).onRemoved(Health, (entity, player, oldHealth, despawned) => {
    if (despawned) {
        print(`${player} had ${oldHealth}hp before their entity was completely annihilated.`)
    } else {
        print(`${player} had ${oldHealth}hp before their Health component was removed.`)
    }
})
```

***

### reduce()

> **reduce**\<`R`\>(`reducer`, `initialValue`): `R`

Defined in: [src/query.ts:143](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/query.ts#L143)

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

Defined in: [src/query.ts:51](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/query.ts#L51)

Includes only entities with _all_ of the specified components in the query's results.

Does not append the values of these components to the results.

#### Parameters

##### components

...([`Pair`](/api/core_ecs/pair/)\<`unknown`\> \| [`ComponentHandle`](/api/core_ecs/componenthandle/)\<`unknown`\>)[]

#### Returns

`Query`\<`Cs`\>

***

### withAny()

> **withAny**(...`components`): `Query`\<`Cs`\>

Defined in: [src/query.ts:61](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/query.ts#L61)

Includes entities with _any_ of the specified components in the query's results.

Does not append the values of these components to the results.

#### Parameters

##### components

...([`Pair`](/api/core_ecs/pair/)\<`unknown`\> \| [`ComponentHandle`](/api/core_ecs/componenthandle/)\<`unknown`\>)[]

#### Returns

`Query`\<`Cs`\>

***

### without()

> **without**(...`components`): `Query`\<`Cs`\>

Defined in: [src/query.ts:69](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/query.ts#L69)

Excludes entities with _all_ of the specified components from the query's results.

#### Parameters

##### components

...([`Pair`](/api/core_ecs/pair/)\<`unknown`\> \| [`ComponentHandle`](/api/core_ecs/componenthandle/)\<`unknown`\>)[]

#### Returns

`Query`\<`Cs`\>

***

### withoutAny()

> **withoutAny**(...`components`): `Query`\<`Cs`\>

Defined in: [src/query.ts:77](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/query.ts#L77)

Excludes entities with _any_ of the specified components from the query's results.

#### Parameters

##### components

...([`Pair`](/api/core_ecs/pair/)\<`unknown`\> \| [`ComponentHandle`](/api/core_ecs/componenthandle/)\<`unknown`\>)[]

#### Returns

`Query`\<`Cs`\>
