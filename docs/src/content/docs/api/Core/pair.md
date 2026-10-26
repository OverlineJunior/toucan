---
editUrl: false
next: false
prev: false
title: "pair"
---

> **pair**\<`Rel`, `Tar`\>(`relation`, `target`): [`Pair`](/toucan/api/types/pair/)\<`PairValue`\<`Rel`, `Tar`\>\>

Defined in: [entities/pair.ts:88](https://github.com/OverlineJunior/toucan/blob/master/src/entities/pair.ts#L88)

Creates a relationship [Pair](/toucan/api/types/pair/) of `relation -> target` (e.g.: `Likes -> Bob`),
where both `relation` and `target` can be either regular entities or components.
Pairs can be assigned to any entity, forming something like `Alice → Likes → Bob`.

Like components, pairs can be associated with values. The value type of a
pair is determined by its `relation` and `target` arguments:
- If `relation` is a component with a value, then the pair takes the same value type;
- Else if `target` is a component with a value, then the pair takes the same value type;
- Otherwise, the pair is a tag pair and does not hold a value.

## Type Parameters

### Rel

`Rel` *extends* [`EntityLike`](/toucan/api/types/entitylike/)

### Tar

`Tar` *extends* [`EntityLike`](/toucan/api/types/entitylike/)

## Parameters

### relation

`Rel`

### target

`Tar`

## Returns

[`Pair`](/toucan/api/types/pair/)\<`PairValue`\<`Rel`, `Tar`\>\>

## Examples

```ts
const Likes = component()
const Owns = component<number>()

const car = entity()
const bob = entity()
    // Because neither `Likes` nor `car` hold values, we have no value to assign.
    .set(pair(Likes, car))
    // Because `Owns` holds a number value, the pair takes a number value.
    .set(pair(Owns, car), 2)
```

```ts
const Begin = component()
const End = component()
const Position = component<Vector3>()

const line = entity()
    // Because `Begin` and `End` hold no values, those pairs take the value from `Position`.
    .set(pair(Begin, Position), new Vector3(0, 0, 0))
    .set(pair(End, Position), new Vector3(10, 0, 0))
```
