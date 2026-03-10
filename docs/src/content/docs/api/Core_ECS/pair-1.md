---
editUrl: false
next: false
prev: false
title: "pair"
---

## Call Signature

> **pair**\<`R`\>(`relation`, `target`): [`Pair`](/toucan/api/core_ecs/pair/)\<`R`\>

Defined in: [pair.ts:81](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/pair.ts#L81)

Creates a relationship _pair_ `relation → target` (e.g.: `Likes → Bob`),
where both `relation` and `target` can be either _entities_ or _components_.
Pairs can be assigned to any _id_, forming something like `Alice → Likes → Bob`.

Like _components_, _pairs_ can be associated to values. The value type of a
_pair_ is determined by its `relation` and `target` arguments:

- If `relation` is a _component_ with a value, then the _pair_ takes the same value type;
- Else if `target` is a _component_ with a value, then the _pair_ takes the same value type;
- Otherwise, the _pair_ is a _tag pair_ and does not hold a value.

### Type Parameters

#### R

`R`

### Parameters

#### relation

[`ComponentHandle`](/toucan/api/core_ecs/componenthandle/)\<`R`\>

#### target

[`ComponentHandle`](/toucan/api/core_ecs/componenthandle/)\<`undefined`\>

### Returns

[`Pair`](/toucan/api/core_ecs/pair/)\<`R`\>

### Examples

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

## Call Signature

> **pair**\<`T`\>(`relation`, `target`): [`Pair`](/toucan/api/core_ecs/pair/)\<`T`\>

Defined in: [pair.ts:82](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/pair.ts#L82)

Creates a relationship _pair_ `relation → target` (e.g.: `Likes → Bob`),
where both `relation` and `target` can be either _entities_ or _components_.
Pairs can be assigned to any _id_, forming something like `Alice → Likes → Bob`.

Like _components_, _pairs_ can be associated to values. The value type of a
_pair_ is determined by its `relation` and `target` arguments:

- If `relation` is a _component_ with a value, then the _pair_ takes the same value type;
- Else if `target` is a _component_ with a value, then the _pair_ takes the same value type;
- Otherwise, the _pair_ is a _tag pair_ and does not hold a value.

### Type Parameters

#### T

`T`

### Parameters

#### relation

[`ComponentHandle`](/toucan/api/core_ecs/componenthandle/)\<`undefined`\>

#### target

[`ComponentHandle`](/toucan/api/core_ecs/componenthandle/)\<`T`\>

### Returns

[`Pair`](/toucan/api/core_ecs/pair/)\<`T`\>

### Examples

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

## Call Signature

> **pair**\<`R`, `T`\>(`relation`, `target`): [`Pair`](/toucan/api/core_ecs/pair/)\<`R`\>

Defined in: [pair.ts:83](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/pair.ts#L83)

Creates a relationship _pair_ `relation → target` (e.g.: `Likes → Bob`),
where both `relation` and `target` can be either _entities_ or _components_.
Pairs can be assigned to any _id_, forming something like `Alice → Likes → Bob`.

Like _components_, _pairs_ can be associated to values. The value type of a
_pair_ is determined by its `relation` and `target` arguments:

- If `relation` is a _component_ with a value, then the _pair_ takes the same value type;
- Else if `target` is a _component_ with a value, then the _pair_ takes the same value type;
- Otherwise, the _pair_ is a _tag pair_ and does not hold a value.

### Type Parameters

#### R

`R`

#### T

`T`

### Parameters

#### relation

[`ComponentHandle`](/toucan/api/core_ecs/componenthandle/)\<`R`\>

#### target

[`ComponentHandle`](/toucan/api/core_ecs/componenthandle/)\<`T`\>

### Returns

[`Pair`](/toucan/api/core_ecs/pair/)\<`R`\>

### Examples

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

## Call Signature

> **pair**\<`R`\>(`relation`, `target`): [`Pair`](/toucan/api/core_ecs/pair/)\<`R`\>

Defined in: [pair.ts:84](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/pair.ts#L84)

Creates a relationship _pair_ `relation → target` (e.g.: `Likes → Bob`),
where both `relation` and `target` can be either _entities_ or _components_.
Pairs can be assigned to any _id_, forming something like `Alice → Likes → Bob`.

Like _components_, _pairs_ can be associated to values. The value type of a
_pair_ is determined by its `relation` and `target` arguments:

- If `relation` is a _component_ with a value, then the _pair_ takes the same value type;
- Else if `target` is a _component_ with a value, then the _pair_ takes the same value type;
- Otherwise, the _pair_ is a _tag pair_ and does not hold a value.

### Type Parameters

#### R

`R`

### Parameters

#### relation

[`ComponentHandle`](/toucan/api/core_ecs/componenthandle/)\<`R`\>

#### target

[`EntityHandle`](/toucan/api/core_ecs/entityhandle/)

### Returns

[`Pair`](/toucan/api/core_ecs/pair/)\<`R`\>

### Examples

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

## Call Signature

> **pair**\<`T`\>(`relation`, `target`): [`Pair`](/toucan/api/core_ecs/pair/)\<`T`\>

Defined in: [pair.ts:85](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/pair.ts#L85)

Creates a relationship _pair_ `relation → target` (e.g.: `Likes → Bob`),
where both `relation` and `target` can be either _entities_ or _components_.
Pairs can be assigned to any _id_, forming something like `Alice → Likes → Bob`.

Like _components_, _pairs_ can be associated to values. The value type of a
_pair_ is determined by its `relation` and `target` arguments:

- If `relation` is a _component_ with a value, then the _pair_ takes the same value type;
- Else if `target` is a _component_ with a value, then the _pair_ takes the same value type;
- Otherwise, the _pair_ is a _tag pair_ and does not hold a value.

### Type Parameters

#### T

`T`

### Parameters

#### relation

[`EntityHandle`](/toucan/api/core_ecs/entityhandle/)

#### target

[`ComponentHandle`](/toucan/api/core_ecs/componenthandle/)\<`T`\>

### Returns

[`Pair`](/toucan/api/core_ecs/pair/)\<`T`\>

### Examples

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

## Call Signature

> **pair**(`relation`, `target`): [`Pair`](/toucan/api/core_ecs/pair/)\<`undefined`\>

Defined in: [pair.ts:86](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/pair.ts#L86)

Creates a relationship _pair_ `relation → target` (e.g.: `Likes → Bob`),
where both `relation` and `target` can be either _entities_ or _components_.
Pairs can be assigned to any _id_, forming something like `Alice → Likes → Bob`.

Like _components_, _pairs_ can be associated to values. The value type of a
_pair_ is determined by its `relation` and `target` arguments:

- If `relation` is a _component_ with a value, then the _pair_ takes the same value type;
- Else if `target` is a _component_ with a value, then the _pair_ takes the same value type;
- Otherwise, the _pair_ is a _tag pair_ and does not hold a value.

### Parameters

#### relation

[`EntityHandle`](/toucan/api/core_ecs/entityhandle/)

#### target

[`EntityHandle`](/toucan/api/core_ecs/entityhandle/)

### Returns

[`Pair`](/toucan/api/core_ecs/pair/)\<`undefined`\>

### Examples

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
