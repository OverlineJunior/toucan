---
editUrl: false
next: false
prev: false
title: "ResourceHandle"
---

Defined in: [handle.ts:543](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/handle.ts#L543)

A handle for resources spawned with `resource()`.

## Extends

- [`Handle`](/toucan/api/core_ecs/handle/)

## Type Parameters

### Value

`Value` = `unknown`

## Properties

### \[VALUE\_SYMBOL\]

> **\[VALUE\_SYMBOL\]**: `Value`

Defined in: [handle.ts:544](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/handle.ts#L544)

***

### id

> `readonly` **id**: [`RawId`](/toucan/api/core_ecs/rawid/)

Defined in: [handle.ts:130](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/handle.ts#L130)

The numeric ID underlying this handle.

Meant to be used when one cannot use the higher-level abstractions
provided by Toucan, such as storing an entity's ID in an
instance's attribute, which cannot hold complex data structures.

In order to get back the high-level handle from an ID, use the
`resolveId` function.

#### Inherited from

[`Handle`](/toucan/api/core_ecs/handle/).[`id`](/toucan/api/core_ecs/handle/#id)

## Methods

### changed()

> **changed**(`listener`): () => `void`

Defined in: [handle.ts:572](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/handle.ts#L572)

Registers a listener that is called whenever the value of this resource changes.

The returned function can be called to unregister the listener.

#### Parameters

##### listener

(`newValue`) => `void`

#### Returns

> (): `void`

##### Returns

`void`

***

### children()

> **children**(): [`Handle`](/toucan/api/core_ecs/handle/)[]

Defined in: [handle.ts:347](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/handle.ts#L347)

Gets all children (the sources of `ChildOf` relationships) for this entity.

#### Returns

[`Handle`](/toucan/api/core_ecs/handle/)[]

#### Example

```ts
const alice = entity()
const charlie = entity().set(pair(ChildOf, alice))
const bob = entity().set(pair(ChildOf,  alice))

const children = alice.children() // [charlie, bob]
```

#### Inherited from

[`Handle`](/toucan/api/core_ecs/handle/).[`children`](/toucan/api/core_ecs/handle/#children)

***

### clear()

> **clear**(): `this`

Defined in: [handle.ts:262](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/handle.ts#L262)

Clears all components and relationship pairs from this entity, but
does not despawn the entity.

#### Returns

`this`

#### Inherited from

[`Handle`](/toucan/api/core_ecs/handle/).[`clear`](/toucan/api/core_ecs/handle/#clear)

***

### components()

> **components**(): [`ComponentHandle`](/toucan/api/core_ecs/componenthandle/)\<`unknown`\>[]

Defined in: [handle.ts:271](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/handle.ts#L271)

Returns all components associated with this entity.

#### Returns

[`ComponentHandle`](/toucan/api/core_ecs/componenthandle/)\<`unknown`\>[]

#### Inherited from

[`Handle`](/toucan/api/core_ecs/handle/).[`components`](/toucan/api/core_ecs/handle/#components)

***

### despawn()

> **despawn**(): `void`

Defined in: [handle.ts:449](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/handle.ts#L449)

Completely deletes this entity from the world.

#### Returns

`void`

#### Inherited from

[`Handle`](/toucan/api/core_ecs/handle/).[`despawn`](/toucan/api/core_ecs/handle/#despawn)

***

### exists()

> **exists**(): `boolean`

Defined in: [handle.ts:358](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/handle.ts#L358)

Returns `true` if this entity exists.

#### Returns

`boolean`

#### Inherited from

[`Handle`](/toucan/api/core_ecs/handle/).[`exists`](/toucan/api/core_ecs/handle/#exists)

***

### get()

> **get**\<`Args`\>(...`componentsOrPairs`): `Flatten`\<`Nullable`\<`InferValues`\<`Args`\>\>\>

Defined in: [handle.ts:216](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/handle.ts#L216)

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

`Flatten`\<`Nullable`\<`InferValues`\<`Args`\>\>\>

#### Example

```ts
const name = myEntity.get(Name)

const [position, velocity] = myEntity.get(Position, Velocity)

const carCount = myEntity.get(pair(Owns, car))
```

#### Inherited from

[`Handle`](/toucan/api/core_ecs/handle/).[`get`](/toucan/api/core_ecs/handle/#get)

***

### has()

> **has**(...`componentsOrPairs`): `boolean`

Defined in: [handle.ts:245](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/handle.ts#L245)

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

#### Inherited from

[`Handle`](/toucan/api/core_ecs/handle/).[`has`](/toucan/api/core_ecs/handle/#has)

***

### parent()

> **parent**(): [`Handle`](/toucan/api/core_ecs/handle/) \| `undefined`

Defined in: [handle.ts:330](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/handle.ts#L330)

Gets the parent (the target of a `ChildOf` relationship) for this entity, if such a relationship exists.

#### Returns

[`Handle`](/toucan/api/core_ecs/handle/) \| `undefined`

#### Example

```ts
const alice = entity()
const charlie = entity().set(pair(ChildOf, alice))

const parent = charlie.parent() // alice
```

#### Inherited from

[`Handle`](/toucan/api/core_ecs/handle/).[`parent`](/toucan/api/core_ecs/handle/#parent)

***

### read()

> **read**(): `Value`

Defined in: [handle.ts:552](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/handle.ts#L552)

Returns the current value of this resource.

Not to be confused with `get`, which can be used to retrieve the value of
components attached to resources, just like with entities.

#### Returns

`Value`

***

### relationships()

> **relationships**(): [`Pair`](/toucan/api/core_ecs/pair/)\<`unknown`\>[]

Defined in: [handle.ts:292](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/handle.ts#L292)

Returns all relationship pairs associated with this entity.

#### Returns

[`Pair`](/toucan/api/core_ecs/pair/)\<`unknown`\>[]

#### Inherited from

[`Handle`](/toucan/api/core_ecs/handle/).[`relationships`](/toucan/api/core_ecs/handle/#relationships)

***

### remove()

> **remove**(`componentOrPair`): `this`

Defined in: [handle.ts:252](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/handle.ts#L252)

Removes a component or relationship pair from this entity.

#### Parameters

##### componentOrPair

[`ComponentHandle`](/toucan/api/core_ecs/componenthandle/)\<`unknown`\> | [`Pair`](/toucan/api/core_ecs/pair/)\<`unknown`\>

#### Returns

`this`

#### Inherited from

[`Handle`](/toucan/api/core_ecs/handle/).[`remove`](/toucan/api/core_ecs/handle/#remove)

***

### set()

#### Call Signature

> **set**(`tagComponent`): `this`

Defined in: [handle.ts:145](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/handle.ts#L145)

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

##### Inherited from

[`Handle`](/toucan/api/core_ecs/handle/).[`set`](/toucan/api/core_ecs/handle/#set)

#### Call Signature

> **set**\<`V`\>(`component`, `value`): `this`

Defined in: [handle.ts:159](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/handle.ts#L159)

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

##### Inherited from

[`Handle`](/toucan/api/core_ecs/handle/).[`set`](/toucan/api/core_ecs/handle/#set)

#### Call Signature

> **set**(`tagPair`): `this`

Defined in: [handle.ts:172](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/handle.ts#L172)

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

##### Inherited from

[`Handle`](/toucan/api/core_ecs/handle/).[`set`](/toucan/api/core_ecs/handle/#set)

#### Call Signature

> **set**\<`P`\>(`pair`, `value`): `this`

Defined in: [handle.ts:188](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/handle.ts#L188)

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

##### Inherited from

[`Handle`](/toucan/api/core_ecs/handle/).[`set`](/toucan/api/core_ecs/handle/#set)

***

### targetOf()

> **targetOf**(`relation`, `nth?`): [`Handle`](/toucan/api/core_ecs/handle/) \| `undefined`

Defined in: [handle.ts:383](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/handle.ts#L383)

Returns the target entity of a relationship pair from this entity.

If there are multiple targets for the given relationship, the `nth` index
can be specified (starting at 0).

#### Parameters

##### relation

[`ComponentHandle`](/toucan/api/core_ecs/componenthandle/)

##### nth?

`number` = `0`

#### Returns

[`Handle`](/toucan/api/core_ecs/handle/) \| `undefined`

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

[`Handle`](/toucan/api/core_ecs/handle/).[`targetOf`](/toucan/api/core_ecs/handle/#targetof)

***

### targetsOf()

> **targetsOf**(`relation`): [`Handle`](/toucan/api/core_ecs/handle/)[]

Defined in: [handle.ts:404](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/handle.ts#L404)

Returns all target entities of a relationship pair from this entity.

#### Parameters

##### relation

[`ComponentHandle`](/toucan/api/core_ecs/componenthandle/)

#### Returns

[`Handle`](/toucan/api/core_ecs/handle/)[]

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

[`Handle`](/toucan/api/core_ecs/handle/).[`targetsOf`](/toucan/api/core_ecs/handle/#targetsof)

***

### toString()

> **toString**(): `string`

Defined in: [handle.ts:315](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/handle.ts#L315)

Gets the label assigned to this entity.

#### Returns

`string`

#### Inherited from

[`Handle`](/toucan/api/core_ecs/handle/).[`toString`](/toucan/api/core_ecs/handle/#tostring)

***

### write()

> **write**(`value`): `this`

Defined in: [handle.ts:562](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/handle.ts#L562)

Updates the value of the resource.

Not to be confused with `set`, which can be used to set the value of
components attached to resources, just like with entities.

#### Parameters

##### value

`Value`

#### Returns

`this`
