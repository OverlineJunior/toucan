---
editUrl: false
next: false
prev: false
title: "ComponentHandle"
---

Defined in: [handle/index.ts:529](https://github.com/OverlineJunior/toucan/blob/master/src/handle/index.ts#L529)

A handle for components spawned with `component()`.

## Extends

- [`Handle`](/toucan/api/types/handle/)

## Extended by

- [`ResourceHandle`](/toucan/api/types/resourcehandle/)

## Type Parameters

### Value

`Value` = `unknown`

## Properties

### \[VALUE\_SYMBOL\]

> **\[VALUE\_SYMBOL\]**: `Value`

Defined in: [handle/index.ts:530](https://github.com/OverlineJunior/toucan/blob/master/src/handle/index.ts#L530)

***

### id

> `readonly` **id**: [`RawId`](/toucan/api/types/rawid/)

Defined in: [handle/index.ts:100](https://github.com/OverlineJunior/toucan/blob/master/src/handle/index.ts#L100)

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

Defined in: [handle/index.ts:361](https://github.com/OverlineJunior/toucan/blob/master/src/handle/index.ts#L361)

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

Defined in: [handle/index.ts:255](https://github.com/OverlineJunior/toucan/blob/master/src/handle/index.ts#L255)

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

> **components**(): `ComponentHandle`\<`unknown`\>[]

Defined in: [handle/index.ts:277](https://github.com/OverlineJunior/toucan/blob/master/src/handle/index.ts#L277)

Returns all components associated with this entity.

#### Returns

`ComponentHandle`\<`unknown`\>[]

#### Inherited from

[`Handle`](/toucan/api/types/handle/).[`components`](/toucan/api/types/handle/#components)

***

### despawn()

> **despawn**(): `void`

Defined in: [handle/index.ts:469](https://github.com/OverlineJunior/toucan/blob/master/src/handle/index.ts#L469)

Completely deletes this entity from the world.

Throws an error if the entity is marked as persistent.

#### Returns

`void`

#### Inherited from

[`Handle`](/toucan/api/types/handle/).[`despawn`](/toucan/api/types/handle/#despawn)

***

### exists()

> **exists**(): `boolean`

Defined in: [handle/index.ts:376](https://github.com/OverlineJunior/toucan/blob/master/src/handle/index.ts#L376)

Returns `true` if this entity exists in the world.

#### Returns

`boolean`

#### Inherited from

[`Handle`](/toucan/api/types/handle/).[`exists`](/toucan/api/types/handle/#exists)

***

### get()

> **get**\<`Args`\>(...`componentsOrPairs`): `WrapLuaTuple`\<`Flatten`\<`Nullable`\<[`InferValues`](/toucan/api/types/infervalues/)\<`Args`\>\>\>\>

Defined in: [handle/index.ts:188](https://github.com/OverlineJunior/toucan/blob/master/src/handle/index.ts#L188)

Retrieves the values of up to 4 components or relationship pairs on
this entity.

Missing components or pairs will return `undefined`.

#### Type Parameters

##### Args

`Args` *extends* `OneUpToFour`\<`ComponentHandle`\<`unknown`\> \| [`Pair`](/toucan/api/types/pair/)\<`unknown`\>\>

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

Defined in: [handle/index.ts:218](https://github.com/OverlineJunior/toucan/blob/master/src/handle/index.ts#L218)

Returns `true` if this entity has _all_ of the specified components or
relationship pairs.

A maximum of 4 components or pairs can be checked at once.

#### Parameters

##### componentsOrPairs

...`OneUpToFour`\<`ComponentHandle`\<`unknown`\> \| [`Pair`](/toucan/api/types/pair/)\<`unknown`\>\>

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

### onAdded()

> **onAdded**(`callback`): () => `void`

Defined in: [handle/index.ts:544](https://github.com/OverlineJunior/toucan/blob/master/src/handle/index.ts#L544)

Registers a callback that fires whenever this component is added to an entity.

#### Parameters

##### callback

(`entity`, `value`) => `void`

#### Returns

() => `void`

#### Example

```ts
const Health = component<number>()

Health.onAdded((entity, health) => {
    print(`${health}hp was added to entity ${entity.id}!`)
})
```

***

### onChanged()

> **onChanged**(`callback`): () => `void`

Defined in: [handle/index.ts:565](https://github.com/OverlineJunior/toucan/blob/master/src/handle/index.ts#L565)

Registers a callback that fires whenever this component's value changes on an entity.

#### Parameters

##### callback

(`entity`, `newValue`, `oldValue`) => `void`

#### Returns

() => `void`

#### Example

```ts
const Health = component<number>()

Health.onChanged((entity, newHealth, oldHealth) => {
    print(`Entity ${entity.id}'s health changed from ${oldHealth} to ${newHealth}!`)
})
```

***

### onRemoved()

> **onRemoved**(`callback`): () => `void`

Defined in: [handle/index.ts:593](https://github.com/OverlineJunior/toucan/blob/master/src/handle/index.ts#L593)

Registers a callback that fires whenever this component is removed from an
entity, or when the entity itself is despawned.

#### Parameters

##### callback

(`entity`, `oldValue`, `despawned`) => `void`

#### Returns

() => `void`

#### Example

```ts
const Health = component<number>()

Health.onRemoved((entity, oldHealth, despawned) => {
    if (despawned) {
        print(`Entity ${entity.id} had ${oldHealth}hp before being despawned.`)
    } else {
        print(`Entity ${entity.id} had ${oldHealth}hp before losing Health.`)
    }
})
```

***

### parent()

> **parent**(): [`Handle`](/toucan/api/types/handle/)

Defined in: [handle/index.ts:344](https://github.com/OverlineJunior/toucan/blob/master/src/handle/index.ts#L344)

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

Defined in: [handle/index.ts:295](https://github.com/OverlineJunior/toucan/blob/master/src/handle/index.ts#L295)

Returns all relationship pairs associated with this entity.

#### Returns

[`Pair`](/toucan/api/types/pair/)\<`unknown`\>[]

#### Inherited from

[`Handle`](/toucan/api/types/handle/).[`relationships`](/toucan/api/types/handle/#relationships)

***

### remove()

> **remove**(`componentOrPair`): `this`

Defined in: [handle/index.ts:231](https://github.com/OverlineJunior/toucan/blob/master/src/handle/index.ts#L231)

Removes a component or relationship pair from this entity.

Throws an error if trying to remove a component or relationship pair
with the `Persistent` component (i.e. most built-in components).

#### Parameters

##### componentOrPair

`ComponentHandle`\<`unknown`\> \| [`Pair`](/toucan/api/types/pair/)\<`unknown`\>

#### Returns

`this`

#### Inherited from

[`Handle`](/toucan/api/types/handle/).[`remove`](/toucan/api/types/handle/#remove)

***

### set()

#### Call Signature

> **set**(`tagComponent`): `this`

Defined in: [handle/index.ts:117](https://github.com/OverlineJunior/toucan/blob/master/src/handle/index.ts#L117)

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

[`Handle`](/toucan/api/types/handle/).[`set`](/toucan/api/types/handle/#set)

#### Call Signature

> **set**\<`V`\>(`component`, `value`): `this`

Defined in: [handle/index.ts:131](https://github.com/OverlineJunior/toucan/blob/master/src/handle/index.ts#L131)

Assigns a component and its value to this entity.

##### Type Parameters

###### V

`V`

##### Parameters

###### component

`ComponentHandle`\<`V`\>

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

Defined in: [handle/index.ts:144](https://github.com/OverlineJunior/toucan/blob/master/src/handle/index.ts#L144)

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

Defined in: [handle/index.ts:160](https://github.com/OverlineJunior/toucan/blob/master/src/handle/index.ts#L160)

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

Defined in: [handle/index.ts:401](https://github.com/OverlineJunior/toucan/blob/master/src/handle/index.ts#L401)

Returns the target entity of a relationship pair from this entity.

If there are multiple targets for the given relationship, the `nth` index
can be specified (starting at 0).

#### Parameters

##### relation

`ComponentHandle`

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

Defined in: [handle/index.ts:422](https://github.com/OverlineJunior/toucan/blob/master/src/handle/index.ts#L422)

Returns all target entities of a relationship pair from this entity.

#### Parameters

##### relation

`ComponentHandle`

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

Defined in: [handle/index.ts:324](https://github.com/OverlineJunior/toucan/blob/master/src/handle/index.ts#L324)

Gets the label assigned to this entity.

#### Returns

`string`

#### Remarks

If the entity has been despawned, it will return a label indicating that.

#### Inherited from

[`Handle`](/toucan/api/types/handle/).[`toString`](/toucan/api/types/handle/#tostring)
