---
editUrl: false
next: false
prev: false
title: "ComponentHandle"
---

Defined in: [src/handle.ts:501](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/handle.ts#L501)

A handle for components spawned with `component()`.

Currently, it has no unique methods, so it only serves as a marker.

## Extends

- [`Handle`](/api/core_ecs/handle/)

## Type Parameters

### Value

`Value` = `unknown`

## Properties

### \[VALUE\_SYMBOL\]

> **\[VALUE\_SYMBOL\]**: `Value`

Defined in: [src/handle.ts:502](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/handle.ts#L502)

***

### id

> `readonly` **id**: [`RawId`](/api/core_ecs/rawid/)

Defined in: [src/handle.ts:130](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/handle.ts#L130)

The numeric ID underlying this handle.

Meant to be used when one cannot use the higher-level abstractions
provided by Toucan, such as storing an entity's ID in an
instance's attribute, which cannot hold complex data structures.

In order to get back the high-level handle from an ID, use the
`resolveId` function.

#### Inherited from

[`Handle`](/api/core_ecs/handle/).[`id`](/api/core_ecs/handle/#id)

## Methods

### children()

> **children**(): [`Handle`](/api/core_ecs/handle/)[]

Defined in: [src/handle.ts:347](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/handle.ts#L347)

Gets all children (the sources of `ChildOf` relationships) for this entity.

#### Returns

[`Handle`](/api/core_ecs/handle/)[]

#### Example

```ts
const alice = entity()
const charlie = entity().set(pair(ChildOf, alice))
const bob = entity().set(pair(ChildOf,  alice))

const children = alice.children() // [charlie, bob]
```

#### Inherited from

[`Handle`](/api/core_ecs/handle/).[`children`](/api/core_ecs/handle/#children)

***

### clear()

> **clear**(): `this`

Defined in: [src/handle.ts:262](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/handle.ts#L262)

Clears all components and relationship pairs from this entity, but
does not despawn the entity.

#### Returns

`this`

#### Inherited from

[`Handle`](/api/core_ecs/handle/).[`clear`](/api/core_ecs/handle/#clear)

***

### components()

> **components**(): `ComponentHandle`\<`unknown`\>[]

Defined in: [src/handle.ts:271](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/handle.ts#L271)

Returns all components associated with this entity.

#### Returns

`ComponentHandle`\<`unknown`\>[]

#### Inherited from

[`Handle`](/api/core_ecs/handle/).[`components`](/api/core_ecs/handle/#components)

***

### despawn()

> **despawn**(): `void`

Defined in: [src/handle.ts:449](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/handle.ts#L449)

Completely deletes this entity from the world.

#### Returns

`void`

#### Inherited from

[`Handle`](/api/core_ecs/handle/).[`despawn`](/api/core_ecs/handle/#despawn)

***

### exists()

> **exists**(): `boolean`

Defined in: [src/handle.ts:358](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/handle.ts#L358)

Returns `true` if this entity exists.

#### Returns

`boolean`

#### Inherited from

[`Handle`](/api/core_ecs/handle/).[`exists`](/api/core_ecs/handle/#exists)

***

### get()

> **get**\<`Args`\>(...`componentsOrPairs`): `Flatten`\<`Nullable`\<`InferValues`\<`Args`\>\>\>

Defined in: [src/handle.ts:216](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/handle.ts#L216)

Retrieves the values of up to 4 components or relationship pairs on
this entity.

Missing components or pairs will return `undefined`.

#### Type Parameters

##### Args

`Args` *extends* `OneUpToFour`\<[`Pair`](/api/core_ecs/pair/)\<`unknown`\> \| `ComponentHandle`\<`unknown`\>\>

#### Parameters

##### componentsOrPairs

...`Args`

#### Returns

`Flatten`\<`Nullable`\<`InferValues`\<`Args`\>\>\>

#### Example

```ts
const name = myEntity.get(Name)

const [position, velocity] = myEntity.get(Position, Velocity)

const carCount = myEntity.get(pair(Owns, car))
```

#### Inherited from

[`Handle`](/api/core_ecs/handle/).[`get`](/api/core_ecs/handle/#get)

***

### has()

> **has**(...`componentsOrPairs`): `boolean`

Defined in: [src/handle.ts:245](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/handle.ts#L245)

Returns `true` if this entity has _all_ of the specified components or
relationship pairs.

A maximum of 4 components or pairs can be checked at once.

#### Parameters

##### componentsOrPairs

...`OneUpToFour`\<[`Pair`](/api/core_ecs/pair/)\<`unknown`\> \| `ComponentHandle`\<`unknown`\>\>

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

[`Handle`](/api/core_ecs/handle/).[`has`](/api/core_ecs/handle/#has)

***

### parent()

> **parent**(): [`Handle`](/api/core_ecs/handle/) \| `undefined`

Defined in: [src/handle.ts:330](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/handle.ts#L330)

Gets the parent (the target of a `ChildOf` relationship) for this entity, if such a relationship exists.

#### Returns

[`Handle`](/api/core_ecs/handle/) \| `undefined`

#### Example

```ts
const alice = entity()
const charlie = entity().set(pair(ChildOf, alice))

const parent = charlie.parent() // alice
```

#### Inherited from

[`Handle`](/api/core_ecs/handle/).[`parent`](/api/core_ecs/handle/#parent)

***

### relationships()

> **relationships**(): [`Pair`](/api/core_ecs/pair/)\<`unknown`\>[]

Defined in: [src/handle.ts:292](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/handle.ts#L292)

Returns all relationship pairs associated with this entity.

#### Returns

[`Pair`](/api/core_ecs/pair/)\<`unknown`\>[]

#### Inherited from

[`Handle`](/api/core_ecs/handle/).[`relationships`](/api/core_ecs/handle/#relationships)

***

### remove()

> **remove**(`componentOrPair`): `this`

Defined in: [src/handle.ts:252](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/handle.ts#L252)

Removes a component or relationship pair from this entity.

#### Parameters

##### componentOrPair

[`Pair`](/api/core_ecs/pair/)\<`unknown`\> | `ComponentHandle`\<`unknown`\>

#### Returns

`this`

#### Inherited from

[`Handle`](/api/core_ecs/handle/).[`remove`](/api/core_ecs/handle/#remove)

***

### set()

#### Call Signature

> **set**(`tagComponent`): `this`

Defined in: [src/handle.ts:145](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/handle.ts#L145)

Assigns a tag component to this entity.

##### Parameters

###### tagComponent

`ComponentHandle`\<`undefined`\>

##### Returns

`this`

##### Example

```ts
const IsAlive = component()
myEntity.set(IsAlive)
```

##### Inherited from

[`Handle`](/api/core_ecs/handle/).[`set`](/api/core_ecs/handle/#set)

#### Call Signature

> **set**\<`V`\>(`component`, `value`): `this`

Defined in: [src/handle.ts:159](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/handle.ts#L159)

Assigns a component and its value to this entity.

##### Type Parameters

###### V

`V`

##### Parameters

###### component

`ComponentHandle`\<`V`\>

###### value

`NoInfer`

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

[`Handle`](/api/core_ecs/handle/).[`set`](/api/core_ecs/handle/#set)

#### Call Signature

> **set**(`tagPair`): `this`

Defined in: [src/handle.ts:172](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/handle.ts#L172)

Assigns a relationship pair to this entity.

##### Parameters

###### tagPair

[`Pair`](/api/core_ecs/pair/)\<`undefined`\>

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

[`Handle`](/api/core_ecs/handle/).[`set`](/api/core_ecs/handle/#set)

#### Call Signature

> **set**\<`P`\>(`pair`, `value`): `this`

Defined in: [src/handle.ts:188](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/handle.ts#L188)

Assigns a relationship pair and its value to this entity.

##### Type Parameters

###### P

`P` *extends* [`Pair`](/api/core_ecs/pair/)\<`unknown`\>

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

##### Inherited from

[`Handle`](/api/core_ecs/handle/).[`set`](/api/core_ecs/handle/#set)

***

### targetOf()

> **targetOf**(`relation`, `nth?`): [`Handle`](/api/core_ecs/handle/) \| `undefined`

Defined in: [src/handle.ts:383](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/handle.ts#L383)

Returns the target entity of a relationship pair from this entity.

If there are multiple targets for the given relationship, the `nth` index
can be specified (starting at 0).

#### Parameters

##### relation

`ComponentHandle`

##### nth?

`number` = `0`

#### Returns

[`Handle`](/api/core_ecs/handle/) \| `undefined`

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

[`Handle`](/api/core_ecs/handle/).[`targetOf`](/api/core_ecs/handle/#targetof)

***

### targetsOf()

> **targetsOf**(`relation`): [`Handle`](/api/core_ecs/handle/)[]

Defined in: [src/handle.ts:404](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/handle.ts#L404)

Returns all target entities of a relationship pair from this entity.

#### Parameters

##### relation

`ComponentHandle`

#### Returns

[`Handle`](/api/core_ecs/handle/)[]

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

[`Handle`](/api/core_ecs/handle/).[`targetsOf`](/api/core_ecs/handle/#targetsof)

***

### toString()

> **toString**(): `string`

Defined in: [src/handle.ts:315](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/handle.ts#L315)

Gets the label assigned to this entity.

#### Returns

`string`

#### Inherited from

[`Handle`](/api/core_ecs/handle/).[`toString`](/api/core_ecs/handle/#tostring)
