---
editUrl: false
next: false
prev: false
title: "Handle"
---

Defined in: [handle.ts:163](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L163)

A generic handle that represents any special kind of entity, such as a component or a resource.

Although the type means Typescript doesn't know the exact kind of entity,
it is known at runtime. Because of this, if you already know the kind, you
can simply type cast it:
```ts
const Person = component()
const bob = entity().set(Person)

query(Person).forEach((handle) => {
    // We know for sure that we won't be giving the `Person` component to anything
    // other than simple entities, so we can safely type cast it as one.
    const entity = handle as EntityHandle
})
```

## Extended by

- [`ComponentHandle`](/toucan/api/types/componenthandle/)
- [`EntityHandle`](/toucan/api/types/entityhandle/)
- [`ResourceHandle`](/toucan/api/types/resourcehandle/)

## Properties

### id

> `readonly` **id**: [`RawId`](/toucan/api/types/rawid/)

Defined in: [handle.ts:175](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L175)

A numerical entity identifier used internally.

Useful when you cannot pass the entire handle to something, but can pass
its numerical ID instead. For example, storing an entity's ID in an
instance's attribute, which cannot hold complex data structures.

In order to get back the appropriate handle from an ID, use the
`resolveId` function.

## Methods

### children()

> **children**(): `Handle`[]

Defined in: [handle.ts:422](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L422)

Gets all children (the sources of `ChildOf` relationships) for this entity.

#### Returns

`Handle`[]

#### Example

```ts
const alice = entity()
const charlie = entity().set(pair(ChildOf, alice))
const bob = entity().set(pair(ChildOf,  alice))

const children = alice.children() // [charlie, bob]
```

***

### clear()

> **clear**(): `this`

Defined in: [handle.ts:330](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L330)

Clears all components and relationship pairs from this entity,
but does not despawn the entity.

Components and relationship pairs with the `Persistent` component
(i.e. most built-in components) will not be removed.

#### Returns

`this`

***

### components()

> **components**(): [`ComponentHandle`](/toucan/api/types/componenthandle/)\<`unknown`\>[]

Defined in: [handle.ts:346](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L346)

Returns all components associated with this entity.

#### Returns

[`ComponentHandle`](/toucan/api/types/componenthandle/)\<`unknown`\>[]

***

### despawn()

> **despawn**(): `void`

Defined in: [handle.ts:526](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L526)

Completely deletes this entity from the world.

Throws an error if the entity is marked as persistent.

#### Returns

`void`

***

### exists()

> **exists**(): `boolean`

Defined in: [handle.ts:433](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L433)

Returns `true` if this entity exists in the world.

#### Returns

`boolean`

***

### get()

> **get**\<`Args`\>(...`componentsOrPairs`): `WrapLuaTuple`\<`Flatten`\<`Nullable`\<[`InferValues`](/toucan/api/types/infervalues/)\<`Args`\>\>\>\>

Defined in: [handle.ts:263](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L263)

Retrieves the values of up to 4 components or relationship pairs on
this entity.

Missing components or pairs will return `undefined`.

#### Type Parameters

##### Args

`Args` *extends* `OneUpToFour`\<[`ComponentHandle`](/toucan/api/types/componenthandle/)\<`unknown`\> \| [`Pair`](/toucan/api/types/pair/)\<`unknown`\>\>

#### Parameters

##### componentsOrPairs

...`Args`

#### Returns

`WrapLuaTuple`\<`Flatten`\<`Nullable`\<[`InferValues`](/toucan/api/types/infervalues/)\<`Args`\>\>\>\>

#### Example

```ts
const name = myEntity.get(Name)

const [position, velocity] = myEntity.get(Position, Velocity)

const carCount = myEntity.get(pair(Owns, car))
```

***

### has()

> **has**(...`componentsOrPairs`): `boolean`

Defined in: [handle.ts:293](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L293)

Returns `true` if this entity has _all_ of the specified components or
relationship pairs.

A maximum of 4 components or pairs can be checked at once.

#### Parameters

##### componentsOrPairs

...`OneUpToFour`\<[`ComponentHandle`](/toucan/api/types/componenthandle/)\<`unknown`\> \| [`Pair`](/toucan/api/types/pair/)\<`unknown`\>\>

#### Returns

`boolean`

#### Example

```ts
const IsDead = component()
const Owns = component()

const house = entity()
const bob = entity()
    .set(IsDead)
    .set(pair(Owns, house))

if (bob.has(IsDead, pair(Owns, house))) {
    // Why don't we rob Bob's house?
}
```

***

### parent()

> **parent**(): `Handle`

Defined in: [handle.ts:405](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L405)

Gets the parent (the target of a `ChildOf` relationship) for this entity, if such a relationship exists.

#### Returns

`Handle`

#### Example

```ts
const alice = entity()
const charlie = entity().set(pair(ChildOf, alice))

const parent = charlie.parent() // alice
```

***

### relationships()

> **relationships**(): [`Pair`](/toucan/api/types/pair/)\<`unknown`\>[]

Defined in: [handle.ts:364](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L364)

Returns all relationship pairs associated with this entity.

#### Returns

[`Pair`](/toucan/api/types/pair/)\<`unknown`\>[]

***

### remove()

> **remove**(`componentOrPair`): `this`

Defined in: [handle.ts:306](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L306)

Removes a component or relationship pair from this entity.

Throws an error if trying to remove a component or relationship pair
with the `Persistent` component (i.e. most built-in components).

#### Parameters

##### componentOrPair

[`ComponentHandle`](/toucan/api/types/componenthandle/)\<`unknown`\> \| [`Pair`](/toucan/api/types/pair/)\<`unknown`\>

#### Returns

`this`

***

### set()

#### Call Signature

> **set**(`tagComponent`): `this`

Defined in: [handle.ts:192](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L192)

Assigns a tag component to this entity.

##### Parameters

###### tagComponent

[`ComponentHandle`](/toucan/api/types/componenthandle/)\<`undefined`\>

##### Returns

`this`

##### Example

```ts
const IsAlive = component()
myEntity.set(IsAlive)
```

#### Call Signature

> **set**\<`V`\>(`component`, `value`): `this`

Defined in: [handle.ts:206](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L206)

Assigns a component and its value to this entity.

##### Type Parameters

###### V

`V`

##### Parameters

###### component

[`ComponentHandle`](/toucan/api/types/componenthandle/)\<`V`\>

###### value

`NoInfer`\<`V`\>

##### Returns

`this`

##### Example

```ts
const Health = component<number>()
const Stamina = component<number>()

entity()
    .set(Health, 100)
    .set(Stamina, 50)
```

#### Call Signature

> **set**(`tagPair`): `this`

Defined in: [handle.ts:219](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L219)

Assigns a relationship pair to this entity.

##### Parameters

###### tagPair

[`Pair`](/toucan/api/types/pair/)\<`undefined`\>

##### Returns

`this`

##### Example

```ts
const Likes = component()

const bob = entity()
const alice = entity()
    .set(pair(Likes, bob))
```

#### Call Signature

> **set**\<`P`\>(`pair`, `value`): `this`

Defined in: [handle.ts:235](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L235)

Assigns a relationship pair and its value to this entity.

##### Type Parameters

###### P

`P` *extends* [`Pair`](/toucan/api/types/pair/)\<`unknown`\>

##### Parameters

###### pair

`P`

###### value

[`InferValue`](/toucan/api/types/infervalue/)\<`P`\>

##### Returns

`this`

##### Example

```ts
const Owns = component<number>()

const car = entity()
const perfume = entity()

const alice = entity()
    .set(pair(Owns, car), 2)
    .set(pair(Owns, perfume), 5)
```

***

### targetOf()

> **targetOf**(`relation`, `nth?`): `Handle`

Defined in: [handle.ts:458](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L458)

Returns the target entity of a relationship pair from this entity.

If there are multiple targets for the given relationship, the `nth` index
can be specified (starting at 0).

#### Parameters

##### relation

[`ComponentHandle`](/toucan/api/types/componenthandle/)

##### nth?

`number` = `0`

#### Returns

`Handle`

#### Example

```ts
const Likes = component()

const bob = entity()
const charlie = entity()
const alice = entity()
    .set(pair(Likes, bob))
    .set(pair(Likes, charlie))

// The order of targets is not guaranteed.
const maybeBob = alice.targetOf(Likes, 0)
const maybeCharlie = alice.targetOf(Likes, 1)
```

***

### targetsOf()

> **targetsOf**(`relation`): `Handle`[]

Defined in: [handle.ts:479](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L479)

Returns all target entities of a relationship pair from this entity.

#### Parameters

##### relation

[`ComponentHandle`](/toucan/api/types/componenthandle/)

#### Returns

`Handle`[]

#### Example

```ts
const Likes = component()

const bob = entity()
const charlie = entity()
const alice = entity()
    .set(pair(Likes, bob))
    .set(pair(Likes, charlie))

const likedEntities = alice.targetsOf(Likes)
```

***

### toString()

> **toString**(): `string`

Defined in: [handle.ts:390](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L390)

Gets the label assigned to this entity.

#### Returns

`string`
