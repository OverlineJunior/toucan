---
editUrl: false
next: false
prev: false
title: "Handle"
---

Defined in: [src/handle.ts:136](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L136)

The base class that represents any kind of entity, may it be a simple entity,
a component, or any other variation.

Although the type means Typescript doesn't know the exact entity variation,
it is known at runtime. Because of this, one that knows the exact variation
can simply type cast it, like so:
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

- [`EntityHandle`](/toucan/api/core_ecs/entityhandle/)
- [`ComponentHandle`](/toucan/api/core_ecs/componenthandle/)
- [`ResourceHandle`](/toucan/api/core_ecs/resourcehandle/)

## Properties

### id

> `readonly` **id**: [`RawId`](/toucan/api/core_ecs/rawid/)

Defined in: [src/handle.ts:148](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L148)

The numeric ID underlying this handle.

Meant to be used when one cannot use the higher-level abstractions
provided by Toucan, such as storing an entity's ID in an
instance's attribute, which cannot hold complex data structures.

In order to get back the high-level handle from an ID, use the
`resolveId` function.

## Methods

### children()

> **children**(): `Handle`[]

Defined in: [src/handle.ts:372](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L372)

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

Defined in: [src/handle.ts:286](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L286)

Clears all components and relationship pairs from this entity, but does not despawn the entity.

Components with the `Persistent` component (i.e. built-in components) will not removed.

#### Returns

`this`

***

### components()

> **components**(): [`ComponentHandle`](/toucan/api/core_ecs/componenthandle/)\<`unknown`\>[]

Defined in: [src/handle.ts:298](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L298)

Returns all components associated with this entity.

#### Returns

[`ComponentHandle`](/toucan/api/core_ecs/componenthandle/)\<`unknown`\>[]

***

### despawn()

> **despawn**(): `void`

Defined in: [src/handle.ts:474](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L474)

Completely deletes this entity from the world.

#### Returns

`void`

***

### exists()

> **exists**(): `boolean`

Defined in: [src/handle.ts:383](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L383)

Returns `true` if this entity exists.

#### Returns

`boolean`

***

### get()

> **get**\<`Args`\>(...`componentsOrPairs`): `WrapLuaTuple`\<`Flatten`\<`Nullable`\<`InferValues`\<`Args`\>\>\>\>

Defined in: [src/handle.ts:234](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L234)

Retrieves the values of up to 4 components or relationship pairs on
this entity.

Missing components or pairs will return `undefined`.

#### Type Parameters

##### Args

`Args` *extends* `OneUpToFour`\<[`ComponentHandle`](/toucan/api/core_ecs/componenthandle/)\<`unknown`\> \| [`Pair`](/toucan/api/core_ecs/pair/)\<`unknown`\>\>

#### Parameters

##### componentsOrPairs

...`Args`

#### Returns

`WrapLuaTuple`\<`Flatten`\<`Nullable`\<`InferValues`\<`Args`\>\>\>\>

#### Example

```ts
const name = myEntity.get(Name)

const [position, velocity] = myEntity.get(Position, Velocity)

const carCount = myEntity.get(pair(Owns, car))
```

***

### has()

> **has**(...`componentsOrPairs`): `boolean`

Defined in: [src/handle.ts:259](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L259)

Returns `true` if this entity has _all_ of the specified components or
relationship pairs.

A maximum of 4 components or pairs can be checked at once.

#### Parameters

##### componentsOrPairs

...`OneUpToFour`\<[`ComponentHandle`](/toucan/api/core_ecs/componenthandle/)\<`unknown`\> \| [`Pair`](/toucan/api/core_ecs/pair/)\<`unknown`\>\>

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

Defined in: [src/handle.ts:355](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L355)

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

> **relationships**(): [`Pair`](/toucan/api/core_ecs/pair/)\<`unknown`\>[]

Defined in: [src/handle.ts:316](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L316)

Returns all relationship pairs associated with this entity.

#### Returns

[`Pair`](/toucan/api/core_ecs/pair/)\<`unknown`\>[]

***

### remove()

> **remove**(`componentOrPair`): `this`

Defined in: [src/handle.ts:268](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L268)

Removes a component or relationship pair from this entity.

Throws an error if trying to remove a component with the `Persistent` component (i.e. built-in components).

#### Parameters

##### componentOrPair

[`ComponentHandle`](/toucan/api/core_ecs/componenthandle/)\<`unknown`\> \| [`Pair`](/toucan/api/core_ecs/pair/)\<`unknown`\>

#### Returns

`this`

***

### set()

#### Call Signature

> **set**(`tagComponent`): `this`

Defined in: [src/handle.ts:163](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L163)

Assigns a tag component to this entity.

##### Parameters

###### tagComponent

[`ComponentHandle`](/toucan/api/core_ecs/componenthandle/)\<`undefined`\>

##### Returns

`this`

##### Example

```ts
const IsAlive = component()
myEntity.set(IsAlive)
```

#### Call Signature

> **set**\<`V`\>(`component`, `value`): `this`

Defined in: [src/handle.ts:177](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L177)

Assigns a component and its value to this entity.

##### Type Parameters

###### V

`V`

##### Parameters

###### component

[`ComponentHandle`](/toucan/api/core_ecs/componenthandle/)\<`V`\>

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

Defined in: [src/handle.ts:190](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L190)

Assigns a relationship pair to this entity.

##### Parameters

###### tagPair

[`Pair`](/toucan/api/core_ecs/pair/)\<`undefined`\>

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

Defined in: [src/handle.ts:206](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L206)

Assigns a relationship pair and its value to this entity.

##### Type Parameters

###### P

`P` *extends* [`Pair`](/toucan/api/core_ecs/pair/)\<`unknown`\>

##### Parameters

###### pair

`P`

###### value

`InferValue`\<`P`\>

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

Defined in: [src/handle.ts:408](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L408)

Returns the target entity of a relationship pair from this entity.

If there are multiple targets for the given relationship, the `nth` index
can be specified (starting at 0).

#### Parameters

##### relation

[`ComponentHandle`](/toucan/api/core_ecs/componenthandle/)

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

Defined in: [src/handle.ts:429](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L429)

Returns all target entities of a relationship pair from this entity.

#### Parameters

##### relation

[`ComponentHandle`](/toucan/api/core_ecs/componenthandle/)

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

Defined in: [src/handle.ts:340](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L340)

Gets the label assigned to this entity.

#### Returns

`string`
