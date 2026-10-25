---
editUrl: false
next: false
prev: false
title: "Query"
---

Defined in: [query.ts:72](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L72)

The type for queries created with [query](/toucan/api/core/query/).

`Cs` are the components and pairs that entities must have, and `Ms` are the
terms passed to [Query.on](/toucan/api/types/query/#on) (empty when the query doesn't read messages).

## Type Parameters

### Cs

`Cs` *extends* ([`ComponentHandle`](/toucan/api/types/componenthandle/) \| [`Pair`](/toucan/api/types/pair/))[]

### Ms

`Ms` *extends* ([`ComponentHandle`](/toucan/api/types/componenthandle/) \| [`Pair`](/toucan/api/types/pair/))[] = \[\]

## Methods

### allow()

> **allow**(...`hiddenComponents`): `Query`\<`Cs`, `Ms`\>

Defined in: [query.ts:158](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L158)

Allows entities with the specified hidden components to appear in the query's results.

See [Builtin.QueryHidden](/toucan/api/variables/builtin/#queryhidden) for more details.

#### Parameters

##### hiddenComponents

...[`ComponentHandle`](/toucan/api/types/componenthandle/)\<`unknown`\>[]

#### Returns

`Query`\<`Cs`, `Ms`\>

#### Example

```ts
// We add Description to both entities and components, and we wanna query from both.
query(Description)
    .allow(Builtin.Component)
    .forEach(...)
```

***

### allowAll()

> **allowAll**(): `Query`\<`Cs`, `Ms`\>

Defined in: [query.ts:187](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L187)

Allows entities with any hidden components to appear in the query's results.

See [Builtin.QueryHidden](/toucan/api/variables/builtin/#queryhidden) for more details.

#### Returns

`Query`\<`Cs`, `Ms`\>

#### Example

```ts
function forceDespawn(e: Handle) {
    e.remove(Builtin.Persistent)
    e.despawn()
}

const allEntityKinds = [
    Builtin.Entity,
    Builtin.Component,
    Builtin.Resource,
]

// Despawn every single entity, no matter what.
for (const enttKind of allEntityKinds) {
    query(enttKind).forEach((e) => forceDespawn(e))
}
```

***

### bind()

> **bind**(`callback`): [`SystemFn`](/toucan/api/types/systemfn/)\<\[\]\>

Defined in: [query.ts:370](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L370)

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

Defined in: [query.ts:325](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L325)

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

Defined in: [query.ts:133](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L133)

Adds a filter predicate to the query that entities must satisfy in order to be queried.

#### Parameters

##### predicate

(`entity`, ...`components`) => `boolean`

#### Returns

`Query`\<`Cs`, `Ms`\>

***

### find()

> **find**(`predicate`): `QueryResult`\<`Cs`, `Ms`\>

Defined in: [query.ts:257](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L257)

Finds the first entity that matches the query _and_ satisfies the provided
`predicate` function, returning the entity itself and its corresponding
component values, or `undefined` if no such entity exists.

#### Parameters

##### predicate

`QueryCallback`\<`Cs`, `Ms`, `boolean`\>

#### Returns

`QueryResult`\<`Cs`, `Ms`\>

#### Remarks

With [Query.on](/toucan/api/types/query/#on), only the first matching message is read.

***

### forEach()

> **forEach**(`callback`): `void`

Defined in: [query.ts:245](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L245)

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

Defined in: [query.ts:284](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L284)

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

Defined in: [query.ts:229](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L229)

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
- Iterating a query with `on()` outside of a system will throw an error.

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

### reduce()

> **reduce**\<`R`\>(`reducer`, `initialValue`): `R`

Defined in: [query.ts:299](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L299)

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

Defined in: [query.ts:98](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L98)

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

Defined in: [query.ts:108](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L108)

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

Defined in: [query.ts:117](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L117)

Excludes entities with _all_ of the specified components from the query's results.

#### Parameters

##### components

...([`ComponentHandle`](/toucan/api/types/componenthandle/)\<`unknown`\> \| [`Pair`](/toucan/api/types/pair/)\<`unknown`\>)[]

#### Returns

`Query`\<`Cs`, `Ms`\>

***

### withoutAny()

> **withoutAny**(...`components`): `Query`\<`Cs`, `Ms`\>

Defined in: [query.ts:125](https://github.com/OverlineJunior/toucan/blob/master/src/query.ts#L125)

Excludes entities with _any_ of the specified components from the query's results.

#### Parameters

##### components

...([`ComponentHandle`](/toucan/api/types/componenthandle/)\<`unknown`\> \| [`Pair`](/toucan/api/types/pair/)\<`unknown`\>)[]

#### Returns

`Query`\<`Cs`, `Ms`\>
