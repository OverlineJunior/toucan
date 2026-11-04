---
editUrl: false
next: false
prev: false
title: "EntityLike"
---

Defined in: [entities/index.ts:93](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L93)

A generic entity-like type inherited by [Entity](/toucan/api/types/entity/), [Component](/toucan/api/types/component/)
and [Resource](/toucan/api/types/resource/).

## Example

```ts
const Person = component()
const bob = entity().set(Person)

query(Person).forEach((entityLike) => {
    // If we know for certain everything with Person
    // is a regular entity, we can cast it like one.
    const entity = entityLike as Entity
})
```

## Extended by

- [`Component`](/toucan/api/types/component/)
- [`Entity`](/toucan/api/types/entity/)
- [`Resource`](/toucan/api/types/resource/)

## Constructors

### Constructor

> **new EntityLike**(`id`): `EntityLike`

Defined in: [entities/index.ts:94](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L94)

#### Parameters

##### id

[`RawId`](/toucan/api/types/rawid/)

A numerical entity identifier used internally.

Useful when you cannot pass the entire entity-like value to something, but can pass
its numerical ID instead. For example, storing an entity's ID in an
instance's attribute, which cannot hold complex data structures.

In order to get back the appropriate entity-like value from an ID, use the
[resolveId](/toucan/api/core/resolveid/) function.

#### Returns

`EntityLike`

## Properties

### id

> `readonly` **id**: [`RawId`](/toucan/api/types/rawid/)

Defined in: [entities/index.ts:105](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L105)

A numerical entity identifier used internally.

Useful when you cannot pass the entire entity-like value to something, but can pass
its numerical ID instead. For example, storing an entity's ID in an
instance's attribute, which cannot hold complex data structures.

In order to get back the appropriate entity-like value from an ID, use the
[resolveId](/toucan/api/core/resolveid/) function.

## Methods

### children()

> **children**(): `EntityLike`[]

Defined in: [entities/index.ts:374](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L374)

Gets all children (the sources of [Builtin.ChildOf](/toucan/api/variables/builtin/#childof) relationships) for this entity.

#### Returns

`EntityLike`[]

#### Example

```ts
const alice = entity()
const charlie = entity()
    .set(pair(Builtin.ChildOf, alice))
const bob = entity()
    .set(pair(Builtin.ChildOf, alice))

const children = alice.children() // [charlie, bob]
```

***

### clear()

> **clear**(): `this`

Defined in: [entities/index.ts:260](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L260)

Clears all components and relationship pairs from this entity,
but does not despawn the entity.

Components and relationship pairs with the [Builtin.Persistent](/toucan/api/variables/builtin/#persistent) component
(i.e. most built-in components) will not be removed.

#### Returns

`this`

***

### components()

> **components**(): [`Component`](/toucan/api/types/component/)\<`unknown`\>[]

Defined in: [entities/index.ts:282](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L282)

Returns all components associated with this entity.

#### Returns

[`Component`](/toucan/api/types/component/)\<`unknown`\>[]

***

### despawn()

> **despawn**(): `void`

Defined in: [entities/index.ts:482](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L482)

Completely deletes this entity from the world.

Throws an error if the entity is marked as persistent.

#### Returns

`void`

***

### exists()

> **exists**(): `boolean`

Defined in: [entities/index.ts:389](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L389)

Returns `true` if this entity exists in the world.

#### Returns

`boolean`

***

### get()

> **get**\<`Args`\>(...`componentsOrPairs`): `WrapLuaTuple`\<`Flatten`\<`Nullable`\<[`InferValues`](/toucan/api/types/infervalues/)\<`Args`\>\>\>\>

Defined in: [entities/index.ts:193](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L193)

Retrieves the values of up to 4 components or relationship pairs on
this entity.

Missing components or pairs will return `undefined`.

#### Type Parameters

##### Args

`Args` *extends* `OneUpToFour`\<[`ComponentLike`](/toucan/api/types/componentlike/)\>

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

Defined in: [entities/index.ts:223](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L223)

Returns `true` if this entity has _all_ of the specified components or
relationship pairs.

A maximum of 4 components or pairs can be checked at once.

#### Parameters

##### componentsOrPairs

...`OneUpToFour`\<[`ComponentLike`](/toucan/api/types/componentlike/)\>

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

> **parent**(): `EntityLike`

Defined in: [entities/index.ts:355](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L355)

Gets the parent (the target of a [Builtin.ChildOf](/toucan/api/variables/builtin/#childof) relationship) for this entity,
if such a relationship exists.

#### Returns

`EntityLike`

#### Example

```ts
const alice = entity()
const charlie = entity()
    .set(pair(Builtin.ChildOf, alice))

const parent = charlie.parent() // alice
```

***

### relationships()

> **relationships**(): [`Pair`](/toucan/api/types/pair/)\<`unknown`\>[]

Defined in: [entities/index.ts:300](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L300)

Returns all relationship pairs associated with this entity.

#### Returns

[`Pair`](/toucan/api/types/pair/)\<`unknown`\>[]

***

### remove()

> **remove**(`componentOrPair`): `this`

Defined in: [entities/index.ts:236](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L236)

Removes a component or relationship pair from this entity.

Throws an error if trying to remove a component or relationship pair
with the [Builtin.Persistent](/toucan/api/variables/builtin/#persistent) component (i.e. most built-in components).

#### Parameters

##### componentOrPair

[`ComponentLike`](/toucan/api/types/componentlike/)

#### Returns

`this`

***

### set()

#### Call Signature

> **set**(`tagComponent`): `this`

Defined in: [entities/index.ts:122](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L122)

Assigns a tag component to this entity.

##### Parameters

###### tagComponent

[`Component`](/toucan/api/types/component/)\<`undefined`\>

##### Returns

`this`

##### Example

```ts
const IsAlive = component()
myEntity.set(IsAlive)
```

#### Call Signature

> **set**\<`V`\>(`component`, `value`): `this`

Defined in: [entities/index.ts:136](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L136)

Assigns a component and its value to this entity.

##### Type Parameters

###### V

`V`

##### Parameters

###### component

[`Component`](/toucan/api/types/component/)\<`V`\>

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

Defined in: [entities/index.ts:149](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L149)

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

Defined in: [entities/index.ts:165](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L165)

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

> **targetOf**(`relation`, `nth?`): `EntityLike`

Defined in: [entities/index.ts:414](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L414)

Returns the target entity of a relationship pair from this entity.

If there are multiple targets for the given relationship, the `nth` index
can be specified (starting at 0).

#### Parameters

##### relation

[`Component`](/toucan/api/types/component/)

##### nth?

`number` = `0`

#### Returns

`EntityLike`

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

> **targetsOf**(`relation`): `EntityLike`[]

Defined in: [entities/index.ts:435](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L435)

Returns all target entities of a relationship pair from this entity.

#### Parameters

##### relation

[`Component`](/toucan/api/types/component/)

#### Returns

`EntityLike`[]

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

Defined in: [entities/index.ts:328](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L328)

Returns the label assigned to this entity, if any, or a fallback based on
its kind and ID.

#### Returns

`string`

#### Remarks

If the entity has been despawned, the fallback will indicate that.
