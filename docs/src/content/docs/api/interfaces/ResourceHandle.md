---
editUrl: false
next: false
prev: false
title: "ResourceHandle"
---

Defined in: [src/handle.ts:525](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/handle.ts#L525)

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

## Extends

- [`Handle`](/api/interfaces/handle/)

## Type Parameters

### Value

`Value` = `unknown`

## Properties

### \[VALUE\_SYMBOL\]

> **\[VALUE\_SYMBOL\]**: `Value`

Defined in: [src/handle.ts:526](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/handle.ts#L526)

***

### id

> `readonly` **id**: [`RawId`](/api/type-aliases/rawid/)

Defined in: [src/handle.ts:124](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/handle.ts#L124)

The numeric ID underlying this handle.

Meant to be used when one cannot use the higher-level abstractions
provided by Toucan, such as storing an entity's ID in an
instance's attribute, which cannot hold complex data structures.

In order to get back the high-level handle from an ID, use the
`resolveId` function.

#### Inherited from

[`Handle`](/api/interfaces/handle/).[`id`](/api/interfaces/handle/#id)

## Methods

### changed()

> **changed**(`listener`): () => `void`

Defined in: [src/handle.ts:554](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/handle.ts#L554)

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

> **children**(): [`Handle`](/api/interfaces/handle/)[]

Defined in: [src/handle.ts:349](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/handle.ts#L349)

Gets all children (the sources of `ChildOf` relationships) for this entity.

# Example

```ts
const alice = entity()
const charlie = entity().set(pair(ChildOf, alice))
const bob = entity().set(pair(ChildOf,  alice))

const children = alice.children() // [charlie, bob]
```

#### Returns

[`Handle`](/api/interfaces/handle/)[]

#### Inherited from

[`Handle`](/api/interfaces/handle/).[`children`](/api/interfaces/handle/#children)

***

### clear()

> **clear**(): `this`

Defined in: [src/handle.ts:262](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/handle.ts#L262)

Clears all components and relationship pairs from this entity, but
does not despawn the entity.

#### Returns

`this`

#### Inherited from

[`Handle`](/api/interfaces/handle/).[`clear`](/api/interfaces/handle/#clear)

***

### components()

> **components**(): [`ComponentHandle`](/api/interfaces/componenthandle/)\<`unknown`\>[]

Defined in: [src/handle.ts:271](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/handle.ts#L271)

Returns all components associated with this entity.

#### Returns

[`ComponentHandle`](/api/interfaces/componenthandle/)\<`unknown`\>[]

#### Inherited from

[`Handle`](/api/interfaces/handle/).[`components`](/api/interfaces/handle/#components)

***

### despawn()

> **despawn**(): `void`

Defined in: [src/handle.ts:453](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/handle.ts#L453)

Completely deletes this entity from the world.

#### Returns

`void`

#### Inherited from

[`Handle`](/api/interfaces/handle/).[`despawn`](/api/interfaces/handle/#despawn)

***

### exists()

> **exists**(): `boolean`

Defined in: [src/handle.ts:360](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/handle.ts#L360)

Returns `true` if this entity exists.

#### Returns

`boolean`

#### Inherited from

[`Handle`](/api/interfaces/handle/).[`exists`](/api/interfaces/handle/#exists)

***

### get()

> **get**\<`Args`\>(...`componentsOrPairs`): `Flatten`\<`Nullable`\<`InferValues`\<`Args`\>\>\>

Defined in: [src/handle.ts:215](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/handle.ts#L215)

Retrieves the values of up to 4 components or relationship pairs on
this entity.

Missing components or pairs will return `undefined`.

# Example

```ts
const name = myEntity.get(Name)

const [position, velocity] = myEntity.get(Position, Velocity)

const carCount = myEntity.get(pair(Owns, car))
```

#### Type Parameters

##### Args

`Args` *extends* `OneUpToFour`\<[`Pair`](/api/interfaces/pair/)\<`unknown`\> \| [`ComponentHandle`](/api/interfaces/componenthandle/)\<`unknown`\>\>

#### Parameters

##### componentsOrPairs

...`Args`

#### Returns

`Flatten`\<`Nullable`\<`InferValues`\<`Args`\>\>\>

#### Inherited from

[`Handle`](/api/interfaces/handle/).[`get`](/api/interfaces/handle/#get)

***

### has()

> **has**(...`componentsOrPairs`): `boolean`

Defined in: [src/handle.ts:245](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/handle.ts#L245)

Returns `true` if this entity has _all_ of the specified components or
relationship pairs.

A maximum of 4 components or pairs can be checked at once.

# Example

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

#### Parameters

##### componentsOrPairs

...`OneUpToFour`\<[`Pair`](/api/interfaces/pair/)\<`unknown`\> \| [`ComponentHandle`](/api/interfaces/componenthandle/)\<`unknown`\>\>

#### Returns

`boolean`

#### Inherited from

[`Handle`](/api/interfaces/handle/).[`has`](/api/interfaces/handle/#has)

***

### parent()

> **parent**(): [`Handle`](/api/interfaces/handle/) \| `undefined`

Defined in: [src/handle.ts:331](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/handle.ts#L331)

Gets the parent (the target of a `ChildOf` relationship) for this entity, if such a relationship exists.

# Example

```ts
const alice = entity()
const charlie = entity().set(pair(ChildOf, alice))

const parent = charlie.parent() // alice
```

#### Returns

[`Handle`](/api/interfaces/handle/) \| `undefined`

#### Inherited from

[`Handle`](/api/interfaces/handle/).[`parent`](/api/interfaces/handle/#parent)

***

### read()

> **read**(): `Value`

Defined in: [src/handle.ts:534](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/handle.ts#L534)

Returns the current value of this resource.

Not to be confused with `get`, which can be used to retrieve the value of
components attached to resources, just like with entities.

#### Returns

`Value`

***

### relationships()

> **relationships**(): [`Pair`](/api/interfaces/pair/)\<`unknown`\>[]

Defined in: [src/handle.ts:292](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/handle.ts#L292)

Returns all relationship pairs associated with this entity.

#### Returns

[`Pair`](/api/interfaces/pair/)\<`unknown`\>[]

#### Inherited from

[`Handle`](/api/interfaces/handle/).[`relationships`](/api/interfaces/handle/#relationships)

***

### remove()

> **remove**(`componentOrPair`): `this`

Defined in: [src/handle.ts:252](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/handle.ts#L252)

Removes a component or relationship pair from this entity.

#### Parameters

##### componentOrPair

[`Pair`](/api/interfaces/pair/)\<`unknown`\> | [`ComponentHandle`](/api/interfaces/componenthandle/)\<`unknown`\>

#### Returns

`this`

#### Inherited from

[`Handle`](/api/interfaces/handle/).[`remove`](/api/interfaces/handle/#remove)

***

### set()

#### Call Signature

> **set**(`tagComponent`): `this`

Defined in: [src/handle.ts:140](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/handle.ts#L140)

Assigns a tag component to this entity.

# Example

```ts
const IsAlive = component()
myEntity.set(IsAlive)
```

##### Parameters

###### tagComponent

[`ComponentHandle`](/api/interfaces/componenthandle/)\<`undefined`\>

##### Returns

`this`

##### Inherited from

[`Handle`](/api/interfaces/handle/).[`set`](/api/interfaces/handle/#set)

#### Call Signature

> **set**\<`V`\>(`component`, `value`): `this`

Defined in: [src/handle.ts:155](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/handle.ts#L155)

Assigns a component and its value to this entity.

# Example

```ts
const Health = component<number>()
const Stamina = component<number>()

entity()
    .set(Health, 100)
    .set(Stamina, 50)
```

##### Type Parameters

###### V

`V`

##### Parameters

###### component

[`ComponentHandle`](/api/interfaces/componenthandle/)\<`V`\>

###### value

`NoInfer`

##### Returns

`this`

##### Inherited from

[`Handle`](/api/interfaces/handle/).[`set`](/api/interfaces/handle/#set)

#### Call Signature

> **set**(`tagPair`): `this`

Defined in: [src/handle.ts:169](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/handle.ts#L169)

Assigns a relationship pair to this entity.

# Example

```ts
const Likes = component()

const bob = entity()
const alice = entity()
    .set(pair(Likes, bob))
```

##### Parameters

###### tagPair

[`Pair`](/api/interfaces/pair/)\<`undefined`\>

##### Returns

`this`

##### Inherited from

[`Handle`](/api/interfaces/handle/).[`set`](/api/interfaces/handle/#set)

#### Call Signature

> **set**\<`P`\>(`pair`, `value`): `this`

Defined in: [src/handle.ts:186](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/handle.ts#L186)

Assigns a relationship pair and its value to this entity.

# Example

```ts
const Owns = component<number>()

const car = entity()
const perfume = entity()

const alice = entity()
    .set(pair(Owns, car), 2)
    .set(pair(Owns, perfume), 5)
```

##### Type Parameters

###### P

`P` *extends* [`Pair`](/api/interfaces/pair/)\<`unknown`\>

##### Parameters

###### pair

`P`

###### value

`InferValue`\<`P`\>

##### Returns

`this`

##### Inherited from

[`Handle`](/api/interfaces/handle/).[`set`](/api/interfaces/handle/#set)

***

### targetOf()

> **targetOf**(`relation`, `nth?`): [`Handle`](/api/interfaces/handle/) \| `undefined`

Defined in: [src/handle.ts:386](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/handle.ts#L386)

Returns the target entity of a relationship pair from this entity.

If there are multiple targets for the given relationship, the `nth` index
can be specified (starting at 0).

# Example

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

#### Parameters

##### relation

[`ComponentHandle`](/api/interfaces/componenthandle/)

##### nth?

`number` = `0`

#### Returns

[`Handle`](/api/interfaces/handle/) \| `undefined`

#### Inherited from

[`Handle`](/api/interfaces/handle/).[`targetOf`](/api/interfaces/handle/#targetof)

***

### targetsOf()

> **targetsOf**(`relation`): [`Handle`](/api/interfaces/handle/)[]

Defined in: [src/handle.ts:408](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/handle.ts#L408)

Returns all target entities of a relationship pair from this entity.

# Example

```ts
const Likes = component()

const bob = entity()
const charlie = entity()
const alice = entity()
    .set(pair(Likes, bob))
    .set(pair(Likes, charlie))

const likedEntities = alice.targetsOf(Likes)
```

#### Parameters

##### relation

[`ComponentHandle`](/api/interfaces/componenthandle/)

#### Returns

[`Handle`](/api/interfaces/handle/)[]

#### Inherited from

[`Handle`](/api/interfaces/handle/).[`targetsOf`](/api/interfaces/handle/#targetsof)

***

### toString()

> **toString**(): `string`

Defined in: [src/handle.ts:315](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/handle.ts#L315)

Gets the label assigned to this entity.

#### Returns

`string`

#### Inherited from

[`Handle`](/api/interfaces/handle/).[`toString`](/api/interfaces/handle/#tostring)

***

### write()

> **write**(`value`): `this`

Defined in: [src/handle.ts:544](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/handle.ts#L544)

Updates the value of the resource.

Not to be confused with `set`, which can be used to set the value of
components attached to resources, just like with entities.

#### Parameters

##### value

`Value`

#### Returns

`this`
