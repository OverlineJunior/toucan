---
editUrl: false
next: false
prev: false
title: "Component"
---

Defined in: [entities/index.ts:547](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L547)

A component spawned with [component](/toucan/api/core/component/).

## Extends

- [`EntityLike`](/toucan/api/types/entitylike/)

## Type Parameters

### Value

`Value` = `unknown`

## Properties

### \[VALUE\_SYMBOL\]

> **\[VALUE\_SYMBOL\]**: `Value`

Defined in: [entities/index.ts:548](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L548)

***

### id

> `readonly` **id**: [`RawId`](/toucan/api/types/rawid/)

Defined in: [entities/index.ts:99](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L99)

A numerical entity identifier used internally.

Useful when you cannot pass the entire entity-like value to something, but can pass
its numerical ID instead. For example, storing an entity's ID in an
instance's attribute, which cannot hold complex data structures.

In order to get back the appropriate entity-like value from an ID, use the
[resolveId](/toucan/api/core/resolveid/) function.

#### Inherited from

[`EntityLike`](/toucan/api/types/entitylike/).[`id`](/toucan/api/types/entitylike/#id)

## Methods

### children()

> **children**(): [`EntityLike`](/toucan/api/types/entitylike/)[]

Defined in: [entities/index.ts:362](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L362)

Gets all children (the sources of [Builtin.ChildOf](/toucan/api/variables/builtin/#childof) relationships) for this entity.

#### Returns

[`EntityLike`](/toucan/api/types/entitylike/)[]

#### Example

```ts
const alice = entity()
const charlie = entity()
    .set(pair(Builtin.ChildOf, alice))
const bob = entity()
    .set(pair(Builtin.ChildOf, alice))

const children = alice.children() // [charlie, bob]
```

#### Inherited from

[`EntityLike`](/toucan/api/types/entitylike/).[`children`](/toucan/api/types/entitylike/#children)

***

### clear()

> **clear**(): `this`

Defined in: [entities/index.ts:254](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L254)

Clears all components and relationship pairs from this entity,
but does not despawn the entity.

Components and relationship pairs with the [Builtin.Persistent](/toucan/api/variables/builtin/#persistent) component
(i.e. most built-in components) will not be removed.

#### Returns

`this`

#### Inherited from

[`EntityLike`](/toucan/api/types/entitylike/).[`clear`](/toucan/api/types/entitylike/#clear)

***

### components()

> **components**(): `Component`\<`unknown`\>[]

Defined in: [entities/index.ts:276](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L276)

Returns all components associated with this entity.

#### Returns

`Component`\<`unknown`\>[]

#### Inherited from

[`EntityLike`](/toucan/api/types/entitylike/).[`components`](/toucan/api/types/entitylike/#components)

***

### despawn()

> **despawn**(): `void`

Defined in: [entities/index.ts:470](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L470)

Completely deletes this entity from the world.

Throws an error if the entity is marked as persistent.

#### Returns

`void`

#### Inherited from

[`EntityLike`](/toucan/api/types/entitylike/).[`despawn`](/toucan/api/types/entitylike/#despawn)

***

### exists()

> **exists**(): `boolean`

Defined in: [entities/index.ts:377](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L377)

Returns `true` if this entity exists in the world.

#### Returns

`boolean`

#### Inherited from

[`EntityLike`](/toucan/api/types/entitylike/).[`exists`](/toucan/api/types/entitylike/#exists)

***

### get()

> **get**\<`Args`\>(...`componentsOrPairs`): `WrapLuaTuple`\<`Flatten`\<`Nullable`\<[`InferValues`](/toucan/api/types/infervalues/)\<`Args`\>\>\>\>

Defined in: [entities/index.ts:187](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L187)

Retrieves the values of up to 4 components or relationship pairs on
this entity.

Missing components or pairs will return `undefined`.

#### Type Parameters

##### Args

`Args` *extends* `OneUpToFour`\<[`Pair`](/toucan/api/types/pair/)\<`unknown`\> \| `Component`\<`unknown`\>\>

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

[`EntityLike`](/toucan/api/types/entitylike/).[`get`](/toucan/api/types/entitylike/#get)

***

### has()

> **has**(...`componentsOrPairs`): `boolean`

Defined in: [entities/index.ts:217](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L217)

Returns `true` if this entity has _all_ of the specified components or
relationship pairs.

A maximum of 4 components or pairs can be checked at once.

#### Parameters

##### componentsOrPairs

...`OneUpToFour`\<[`Pair`](/toucan/api/types/pair/)\<`unknown`\> \| `Component`\<`unknown`\>\>

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

[`EntityLike`](/toucan/api/types/entitylike/).[`has`](/toucan/api/types/entitylike/#has)

***

### onAdded()

> **onAdded**(`callback`): () => `void`

Defined in: [entities/index.ts:562](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L562)

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

Defined in: [entities/index.ts:583](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L583)

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

Defined in: [entities/index.ts:606](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L606)

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

> **parent**(): [`EntityLike`](/toucan/api/types/entitylike/)

Defined in: [entities/index.ts:343](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L343)

Gets the parent (the target of a [Builtin.ChildOf](/toucan/api/variables/builtin/#childof) relationship) for this entity,
if such a relationship exists.

#### Returns

[`EntityLike`](/toucan/api/types/entitylike/)

#### Example

```ts
const alice = entity()
const charlie = entity()
    .set(pair(Builtin.ChildOf, alice))

const parent = charlie.parent() // alice
```

#### Inherited from

[`EntityLike`](/toucan/api/types/entitylike/).[`parent`](/toucan/api/types/entitylike/#parent)

***

### relationships()

> **relationships**(): [`Pair`](/toucan/api/types/pair/)\<`unknown`\>[]

Defined in: [entities/index.ts:294](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L294)

Returns all relationship pairs associated with this entity.

#### Returns

[`Pair`](/toucan/api/types/pair/)\<`unknown`\>[]

#### Inherited from

[`EntityLike`](/toucan/api/types/entitylike/).[`relationships`](/toucan/api/types/entitylike/#relationships)

***

### remove()

> **remove**(`componentOrPair`): `this`

Defined in: [entities/index.ts:230](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L230)

Removes a component or relationship pair from this entity.

Throws an error if trying to remove a component or relationship pair
with the [Builtin.Persistent](/toucan/api/variables/builtin/#persistent) component (i.e. most built-in components).

#### Parameters

##### componentOrPair

[`Pair`](/toucan/api/types/pair/)\<`unknown`\> \| `Component`\<`unknown`\>

#### Returns

`this`

#### Inherited from

[`EntityLike`](/toucan/api/types/entitylike/).[`remove`](/toucan/api/types/entitylike/#remove)

***

### set()

#### Call Signature

> **set**(`tagComponent`): `this`

Defined in: [entities/index.ts:116](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L116)

Assigns a tag component to this entity.

##### Parameters

###### tagComponent

`Component`\<`undefined`\>

##### Returns

`this`

##### Example

```ts
const IsAlive = component()
myEntity.set(IsAlive)
```

##### Inherited from

[`EntityLike`](/toucan/api/types/entitylike/).[`set`](/toucan/api/types/entitylike/#set)

#### Call Signature

> **set**\<`V`\>(`component`, `value`): `this`

Defined in: [entities/index.ts:130](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L130)

Assigns a component and its value to this entity.

##### Type Parameters

###### V

`V`

##### Parameters

###### component

`Component`\<`V`\>

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

[`EntityLike`](/toucan/api/types/entitylike/).[`set`](/toucan/api/types/entitylike/#set)

#### Call Signature

> **set**(`tagPair`): `this`

Defined in: [entities/index.ts:143](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L143)

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

[`EntityLike`](/toucan/api/types/entitylike/).[`set`](/toucan/api/types/entitylike/#set)

#### Call Signature

> **set**\<`P`\>(`pair`, `value`): `this`

Defined in: [entities/index.ts:159](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L159)

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

[`EntityLike`](/toucan/api/types/entitylike/).[`set`](/toucan/api/types/entitylike/#set)

***

### targetOf()

> **targetOf**(`relation`, `nth?`): [`EntityLike`](/toucan/api/types/entitylike/)

Defined in: [entities/index.ts:402](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L402)

Returns the target entity of a relationship pair from this entity.

If there are multiple targets for the given relationship, the `nth` index
can be specified (starting at 0).

#### Parameters

##### relation

`Component`

##### nth?

`number` = `0`

#### Returns

[`EntityLike`](/toucan/api/types/entitylike/)

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

[`EntityLike`](/toucan/api/types/entitylike/).[`targetOf`](/toucan/api/types/entitylike/#targetof)

***

### targetsOf()

> **targetsOf**(`relation`): [`EntityLike`](/toucan/api/types/entitylike/)[]

Defined in: [entities/index.ts:423](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L423)

Returns all target entities of a relationship pair from this entity.

#### Parameters

##### relation

`Component`

#### Returns

[`EntityLike`](/toucan/api/types/entitylike/)[]

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

[`EntityLike`](/toucan/api/types/entitylike/).[`targetsOf`](/toucan/api/types/entitylike/#targetsof)

***

### toString()

> **toString**(): `string`

Defined in: [entities/index.ts:321](https://github.com/OverlineJunior/toucan/blob/master/src/entities/index.ts#L321)

Gets the label assigned to this entity.

#### Returns

`string`

#### Remarks

If the entity has been despawned, it will return a label indicating that.

#### Inherited from

[`EntityLike`](/toucan/api/types/entitylike/).[`toString`](/toucan/api/types/entitylike/#tostring)
