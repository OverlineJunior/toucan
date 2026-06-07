---
editUrl: false
next: false
prev: false
title: "EntityHandle"
---

Defined in: [handle.ts:548](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L548)

A handle for entities spawned with `entity()`.

## Extends

- [`Handle`](/toucan/api/types/handle/)

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

#### Inherited from

[`Handle`](/toucan/api/types/handle/).[`id`](/toucan/api/types/handle/#id)

## Methods

### children()

> **children**(): [`Handle`](/toucan/api/types/handle/)[]

Defined in: [handle.ts:422](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L422)

Gets all children (the sources of `ChildOf` relationships) for this entity.

#### Returns

[`Handle`](/toucan/api/types/handle/)[]

#### Example

```ts
const alice = entity()
const charlie = entity().set(pair(ChildOf, alice))
const bob = entity().set(pair(ChildOf,  alice))

const children = alice.children() // [charlie, bob]
```

#### Inherited from

[`Handle`](/toucan/api/types/handle/).[`children`](/toucan/api/types/handle/#children)

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

#### Inherited from

[`Handle`](/toucan/api/types/handle/).[`clear`](/toucan/api/types/handle/#clear)

***

### components()

> **components**(): [`ComponentHandle`](/toucan/api/types/componenthandle/)\<`unknown`\>[]

Defined in: [handle.ts:346](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L346)

Returns all components associated with this entity.

#### Returns

[`ComponentHandle`](/toucan/api/types/componenthandle/)\<`unknown`\>[]

#### Inherited from

[`Handle`](/toucan/api/types/handle/).[`components`](/toucan/api/types/handle/#components)

***

### despawn()

> **despawn**(): `void`

Defined in: [handle.ts:526](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L526)

Completely deletes this entity from the world.

Throws an error if the entity is marked as persistent.

#### Returns

`void`

#### Inherited from

[`Handle`](/toucan/api/types/handle/).[`despawn`](/toucan/api/types/handle/#despawn)

***

### exists()

> **exists**(): `boolean`

Defined in: [handle.ts:433](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L433)

Returns `true` if this entity exists in the world.

#### Returns

`boolean`

#### Inherited from

[`Handle`](/toucan/api/types/handle/).[`exists`](/toucan/api/types/handle/#exists)

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

#### Inherited from

[`Handle`](/toucan/api/types/handle/).[`get`](/toucan/api/types/handle/#get)

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

#### Inherited from

[`Handle`](/toucan/api/types/handle/).[`has`](/toucan/api/types/handle/#has)

***

### parent()

> **parent**(): [`Handle`](/toucan/api/types/handle/)

Defined in: [handle.ts:405](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L405)

Gets the parent (the target of a `ChildOf` relationship) for this entity, if such a relationship exists.

#### Returns

[`Handle`](/toucan/api/types/handle/)

#### Example

```ts
const alice = entity()
const charlie = entity().set(pair(ChildOf, alice))

const parent = charlie.parent() // alice
```

#### Inherited from

[`Handle`](/toucan/api/types/handle/).[`parent`](/toucan/api/types/handle/#parent)

***

### relationships()

> **relationships**(): [`Pair`](/toucan/api/types/pair/)\<`unknown`\>[]

Defined in: [handle.ts:364](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L364)

Returns all relationship pairs associated with this entity.

#### Returns

[`Pair`](/toucan/api/types/pair/)\<`unknown`\>[]

#### Inherited from

[`Handle`](/toucan/api/types/handle/).[`relationships`](/toucan/api/types/handle/#relationships)

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

#### Inherited from

[`Handle`](/toucan/api/types/handle/).[`remove`](/toucan/api/types/handle/#remove)

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

##### Inherited from

[`Handle`](/toucan/api/types/handle/).[`set`](/toucan/api/types/handle/#set)

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

##### Inherited from

[`Handle`](/toucan/api/types/handle/).[`set`](/toucan/api/types/handle/#set)

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

##### Inherited from

[`Handle`](/toucan/api/types/handle/).[`set`](/toucan/api/types/handle/#set)

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

##### Inherited from

[`Handle`](/toucan/api/types/handle/).[`set`](/toucan/api/types/handle/#set)

***

### targetOf()

> **targetOf**(`relation`, `nth?`): [`Handle`](/toucan/api/types/handle/)

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

[`Handle`](/toucan/api/types/handle/)

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

#### Inherited from

[`Handle`](/toucan/api/types/handle/).[`targetOf`](/toucan/api/types/handle/#targetof)

***

### targetsOf()

> **targetsOf**(`relation`): [`Handle`](/toucan/api/types/handle/)[]

Defined in: [handle.ts:479](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L479)

Returns all target entities of a relationship pair from this entity.

#### Parameters

##### relation

[`ComponentHandle`](/toucan/api/types/componenthandle/)

#### Returns

[`Handle`](/toucan/api/types/handle/)[]

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

#### Inherited from

[`Handle`](/toucan/api/types/handle/).[`targetsOf`](/toucan/api/types/handle/#targetsof)

***

### toString()

> **toString**(): `string`

Defined in: [handle.ts:390](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L390)

Gets the label assigned to this entity.

#### Returns

`string`

#### Inherited from

[`Handle`](/toucan/api/types/handle/).[`toString`](/toucan/api/types/handle/#tostring)
