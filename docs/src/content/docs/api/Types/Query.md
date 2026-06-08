---
editUrl: false
next: false
prev: false
title: "Query"
---

Defined in: [query.ts:29](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L29)

The type for queries created with [query](/toucan/api/core/query/).

## Type Parameters

### Cs

`Cs` *extends* ([`ComponentHandle`](/toucan/api/types/componenthandle/) \| [`Pair`](/toucan/api/types/pair/))[]

## Methods

### bind()

> **bind**(`callback`): [`SystemFn`](/toucan/api/types/systemfn/)\<\[\]\>

Defined in: [query.ts:232](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L232)

Converts the query into a callback that can be scheduled just like a regular system function.

#### Pros:
- It's cached, so it's more performant when called multiple times,
  such as in a system scheduled to run every frame;
- Removes the need of an extra layer of indentation in systems.

#### Cons:
- Cannot be passed optional arguments in [SystemConfig](/toucan/api/types/systemconfig/).
- Better used with arrow functions, meaning labels cannot be automatically inferred from function names.

#### Parameters

##### callback

(`entity`, ...`componentValues`) => `void`

#### Returns

[`SystemFn`](/toucan/api/types/systemfn/)\<\[\]\>

#### Example

```ts
const greetPeople = query(Name, Person).bind((_e, name) => {
    print(`Hello, ${name}!`)
})

scheduler()
    .useSystem('update', greetPeople, { label: 'greetPeople' })
    .run()

// Equivalent to...

function greetPeople() {
    query(Name, Person).forEach((_e, name) => {
        print(`Hello, ${name}!`)
    })
}

scheduler()
    .useSystem('update', greetPeople)
    .run()
```

***

### collect()

> **collect**(): \[[`Handle`](/toucan/api/types/handle/), `...InferValues<Cs>[]`\][]

Defined in: [query.ts:187](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L187)

Collects all entities that match the query, returning an array of the entities
themselves and their corresponding component values.

#### Returns

\[[`Handle`](/toucan/api/types/handle/), `...InferValues<Cs>[]`\][]

#### Remarks

⚠️ This method allocates memory for all entities that match the query, so it should be
used sparingly in performance-critical code.

***

### filter()

> **filter**(`predicate`): `Query`\<`Cs`\>

Defined in: [query.ts:79](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L79)

Adds a filter predicate to the query that entities must satisfy in order to be queried.

#### Parameters

##### predicate

(`entity`, ...`components`) => `boolean`

#### Returns

`Query`\<`Cs`\>

***

### find()

> **find**(`predicate`): \[[`Handle`](/toucan/api/types/handle/), `...InferValues<Cs>[]`\]

Defined in: [query.ts:109](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L109)

Finds the first entity that matches the query _and_ satisfies the provided
`predicate` function, returning the entity itself and its corresponding
component values, or `undefined` if no such entity exists.

#### Parameters

##### predicate

(`entity`, ...`componentValues`) => `boolean`

#### Returns

\[[`Handle`](/toucan/api/types/handle/), `...InferValues<Cs>[]`\]

***

### forEach()

> **forEach**(`callback`): `void`

Defined in: [query.ts:94](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L94)

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

Defined in: [query.ts:146](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L146)

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

Defined in: [query.ts:261](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L261)

Registers a callback that fires whenever the specified component is added to an
entity that matches this query.

The callback receives the entity, the values of the queried components, and the
newly added component's value.

#### Type Parameters

##### C

`C` *extends* [`ComponentHandle`](/toucan/api/types/componenthandle/)\<`unknown`\>

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

Defined in: [query.ts:294](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L294)

Registers a callback that fires whenever the specified component's value changes
on an entity that matches this query.

The callback receives the entity, the values of the queried components, the
new value of the changed component, and its previous value.

#### Type Parameters

##### C

`C` *extends* [`ComponentHandle`](/toucan/api/types/componenthandle/)\<`unknown`\>

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

Defined in: [query.ts:338](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L338)

Registers a callback that fires whenever the specified component is removed from
an entity that matches this query, or when the entity itself is despawned.

The callback receives the entity, the values of the queried components, the
component's last known value before removal, and a boolean indicating if the
removal was caused by the entity despawning.

#### Type Parameters

##### C

`C` *extends* [`ComponentHandle`](/toucan/api/types/componenthandle/)\<`unknown`\>

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

Defined in: [query.ts:162](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L162)

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

Defined in: [query.ts:47](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L47)

Includes only entities with _all_ of the specified components in the query's results.

Does not append the values of these components to the results.

#### Parameters

##### components

...([`ComponentHandle`](/toucan/api/types/componenthandle/)\<`unknown`\> \| [`Pair`](/toucan/api/types/pair/)\<`unknown`\>)[]

#### Returns

`Query`\<`Cs`\>

***

### withAny()

> **withAny**(...`components`): `Query`\<`Cs`\>

Defined in: [query.ts:57](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L57)

Includes entities with _any_ of the specified components in the query's results.

Does not append the values of these components to the results.

#### Parameters

##### components

...([`ComponentHandle`](/toucan/api/types/componenthandle/)\<`unknown`\> \| [`Pair`](/toucan/api/types/pair/)\<`unknown`\>)[]

#### Returns

`Query`\<`Cs`\>

***

### without()

> **without**(...`components`): `Query`\<`Cs`\>

Defined in: [query.ts:64](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L64)

Excludes entities with _all_ of the specified components from the query's results.

#### Parameters

##### components

...([`ComponentHandle`](/toucan/api/types/componenthandle/)\<`unknown`\> \| [`Pair`](/toucan/api/types/pair/)\<`unknown`\>)[]

#### Returns

`Query`\<`Cs`\>

***

### withoutAny()

> **withoutAny**(...`components`): `Query`\<`Cs`\>

Defined in: [query.ts:72](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L72)

Excludes entities with _any_ of the specified components from the query's results.

#### Parameters

##### components

...([`ComponentHandle`](/toucan/api/types/componenthandle/)\<`unknown`\> \| [`Pair`](/toucan/api/types/pair/)\<`unknown`\>)[]

#### Returns

`Query`\<`Cs`\>
