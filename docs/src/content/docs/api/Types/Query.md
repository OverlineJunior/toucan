---
editUrl: false
next: false
prev: false
title: "Query"
---

Defined in: [query.ts:74](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L74)

The type for queries created with [query](/toucan/api/core/query/).

`Cs` are the components and pairs that entities must have, and `Ms` are the
terms passed to [Query.on](/toucan/api/types/query/#on) (empty when the query doesn't read messages).

## Type Parameters

### Cs

`Cs` *extends* ([`ComponentHandle`](/toucan/api/types/componenthandle/) \| [`Pair`](/toucan/api/types/pair/))[]

### Ms

`Ms` *extends* ([`ComponentHandle`](/toucan/api/types/componenthandle/) \| [`Pair`](/toucan/api/types/pair/))[] = \[\]

## Methods

### bind()

> **bind**(`callback`): [`SystemFn`](/toucan/api/types/systemfn/)\<\[\]\>

Defined in: [query.ts:318](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L318)

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

`QueryCallback`\<`Cs`, `Ms`\>

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

> **collect**(): `QueryResult`\<`Cs`, `Ms`\>[]

Defined in: [query.ts:273](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L273)

Collects all entities that match the query, returning an array of the entities
themselves and their corresponding component values.

#### Returns

`QueryResult`\<`Cs`, `Ms`\>[]

#### Remarks

⚠️ This method allocates memory for all entities that match the query, so it should be
used sparingly in performance-critical code.

***

### filter()

> **filter**(`predicate`): `Query`\<`Cs`, `Ms`\>

Defined in: [query.ts:131](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L131)

Adds a filter predicate to the query that entities must satisfy in order to be queried.

#### Parameters

##### predicate

(`entity`, ...`components`) => `boolean`

#### Returns

`Query`\<`Cs`, `Ms`\>

***

### find()

> **find**(`predicate`): `QueryResult`\<`Cs`, `Ms`\>

Defined in: [query.ts:205](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L205)

Finds the first entity that matches the query _and_ satisfies the provided
`predicate` function, returning the entity itself and its corresponding
component values, or `undefined` if no such entity exists.

#### Parameters

##### predicate

`QueryCallback`\<`Cs`, `Ms`, `boolean`\>

#### Returns

`QueryResult`\<`Cs`, `Ms`\>

***

### forEach()

> **forEach**(`callback`): `void`

Defined in: [query.ts:196](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L196)

Iterates over each entity that matches the query, calling the provided `callback`
with the entity itself and its corresponding component values.

#### Parameters

##### callback

`QueryCallback`\<`Cs`, `Ms`\>

#### Returns

`void`

***

### map()

> **map**\<`R`\>(`mapper`): `R`[]

Defined in: [query.ts:232](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L232)

Maps each entity that matches the query to a new value using the provided
`mapper` function, returning an array of the resulting values.

#### Type Parameters

##### R

`R` *extends* `defined`

#### Parameters

##### mapper

`QueryCallback`\<`Cs`, `Ms`, `R`\>

#### Returns

`R`[]

#### Remarks

⚠️ This method allocates memory for all entities that match the query, so it should be
used sparingly in performance-critical code.

***

### on()

> **on**\<`NewMs`\>(...`terms`): `Query`\<`Cs`, `NewMs`\>

Defined in: [query.ts:180](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L180)

Reads messages that have _all_ of the specified components or pairs, pairing
each one with every entity that matches this query.

The callback receives `(entity, ...entityValues, message, ...messageValues)`.
With no required components (`query().on(...)`), it receives only
`(message, ...messageValues)`.

Messages can be read even by systems that run before they're emitted, at the cost of a one-frame delay.

#### Type Parameters

##### NewMs

`NewMs` *extends* `OneUpToEight`\<[`ComponentHandle`](/toucan/api/types/componenthandle/)\<`unknown`\> \| [`Pair`](/toucan/api/types/pair/)\<`unknown`\>\>

#### Parameters

##### terms

...`NewMs`

#### Returns

`Query`\<`Cs`, `NewMs`\>

#### Remarks

- The query's own terms never match message entities unless `MessageSequence`
  is explicitly required; `on()` is the cursor-aware way to read them.
- Calling `on()` more than once will throw an error.
- Calling `on()` outside of a system will throw an error.

#### Examples

```ts
const Health = component<number>()
const Damaged = component<number>()

function applyDamage() {
    query(Health).on(Damaged).forEach((e, health, _msg, damage) => {
        e.set(Health, health - damage)
    })
}
```

```ts
function announceDamage() {
    query().on(Damaged).forEach((_msg, damage) => {
        print(`Ouch! ${damage} damage!`)
    })
}
```

***

### onAdded()

> **onAdded**\<`C`\>(`component`, `callback`): `DisconnectFn`

Defined in: [query.ts:355](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L355)

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

Defined in: [query.ts:388](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L388)

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

Defined in: [query.ts:432](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L432)

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

Defined in: [query.ts:247](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L247)

Reduces the entities that match the query to a single value using the provided
`reducer` function and `initialValue`.

#### Type Parameters

##### R

`R`

#### Parameters

##### reducer

(`accumulator`, ...`args`) => `R`

##### initialValue

`R`

#### Returns

`R`

***

### with()

> **with**(...`components`): `Query`\<`Cs`, `Ms`\>

Defined in: [query.ts:97](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L97)

Includes only entities with _all_ of the specified components in the query's results.

Does not append the values of these components to the results.

#### Parameters

##### components

...([`ComponentHandle`](/toucan/api/types/componenthandle/)\<`unknown`\> \| [`Pair`](/toucan/api/types/pair/)\<`unknown`\>)[]

#### Returns

`Query`\<`Cs`, `Ms`\>

***

### withAny()

> **withAny**(...`components`): `Query`\<`Cs`, `Ms`\>

Defined in: [query.ts:107](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L107)

Includes entities with _any_ of the specified components in the query's results.

Does not append the values of these components to the results.

#### Parameters

##### components

...([`ComponentHandle`](/toucan/api/types/componenthandle/)\<`unknown`\> \| [`Pair`](/toucan/api/types/pair/)\<`unknown`\>)[]

#### Returns

`Query`\<`Cs`, `Ms`\>

***

### without()

> **without**(...`components`): `Query`\<`Cs`, `Ms`\>

Defined in: [query.ts:115](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L115)

Excludes entities with _all_ of the specified components from the query's results.

#### Parameters

##### components

...([`ComponentHandle`](/toucan/api/types/componenthandle/)\<`unknown`\> \| [`Pair`](/toucan/api/types/pair/)\<`unknown`\>)[]

#### Returns

`Query`\<`Cs`, `Ms`\>

***

### withoutAny()

> **withoutAny**(...`components`): `Query`\<`Cs`, `Ms`\>

Defined in: [query.ts:123](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L123)

Excludes entities with _any_ of the specified components from the query's results.

#### Parameters

##### components

...([`ComponentHandle`](/toucan/api/types/componenthandle/)\<`unknown`\> \| [`Pair`](/toucan/api/types/pair/)\<`unknown`\>)[]

#### Returns

`Query`\<`Cs`, `Ms`\>
