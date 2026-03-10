---
editUrl: false
next: false
prev: false
title: "pair"
---

## Call Signature

> **pair**\<`R`\>(`relation`, `target`): [`Pair`](/api/interfaces/pair/)\<`R`\>

Defined in: [src/pair.ts:74](https://github.com/OverlineJunior/toucan/blob/f28f04d91a1f401a88e2816c1566e4ef64224416/src/pair.ts#L74)

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

[`ComponentHandle`](/api/interfaces/componenthandle/)\<`R`\>

#### target

[`ComponentHandle`](/api/interfaces/componenthandle/)\<`undefined`\>

### Returns

[`Pair`](/api/interfaces/pair/)\<`R`\>

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

> **pair**\<`T`\>(`relation`, `target`): [`Pair`](/api/interfaces/pair/)\<`T`\>

Defined in: [src/pair.ts:75](https://github.com/OverlineJunior/toucan/blob/f28f04d91a1f401a88e2816c1566e4ef64224416/src/pair.ts#L75)

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

[`ComponentHandle`](/api/interfaces/componenthandle/)\<`undefined`\>

#### target

[`ComponentHandle`](/api/interfaces/componenthandle/)\<`T`\>

### Returns

[`Pair`](/api/interfaces/pair/)\<`T`\>

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

> **pair**\<`R`, `T`\>(`relation`, `target`): [`Pair`](/api/interfaces/pair/)\<`R`\>

Defined in: [src/pair.ts:76](https://github.com/OverlineJunior/toucan/blob/f28f04d91a1f401a88e2816c1566e4ef64224416/src/pair.ts#L76)

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

[`ComponentHandle`](/api/interfaces/componenthandle/)\<`R`\>

#### target

[`ComponentHandle`](/api/interfaces/componenthandle/)\<`T`\>

### Returns

[`Pair`](/api/interfaces/pair/)\<`R`\>

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

> **pair**\<`R`\>(`relation`, `target`): [`Pair`](/api/interfaces/pair/)\<`R`\>

Defined in: [src/pair.ts:77](https://github.com/OverlineJunior/toucan/blob/f28f04d91a1f401a88e2816c1566e4ef64224416/src/pair.ts#L77)

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

[`ComponentHandle`](/api/interfaces/componenthandle/)\<`R`\>

#### target

[`EntityHandle`](/api/interfaces/entityhandle/)

### Returns

[`Pair`](/api/interfaces/pair/)\<`R`\>

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

> **pair**\<`T`\>(`relation`, `target`): [`Pair`](/api/interfaces/pair/)\<`T`\>

Defined in: [src/pair.ts:78](https://github.com/OverlineJunior/toucan/blob/f28f04d91a1f401a88e2816c1566e4ef64224416/src/pair.ts#L78)

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

[`EntityHandle`](/api/interfaces/entityhandle/)

#### target

[`ComponentHandle`](/api/interfaces/componenthandle/)\<`T`\>

### Returns

[`Pair`](/api/interfaces/pair/)\<`T`\>

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

> **pair**(`relation`, `target`): [`Pair`](/api/interfaces/pair/)\<`undefined`\>

Defined in: [src/pair.ts:79](https://github.com/OverlineJunior/toucan/blob/f28f04d91a1f401a88e2816c1566e4ef64224416/src/pair.ts#L79)

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

[`EntityHandle`](/api/interfaces/entityhandle/)

#### target

[`EntityHandle`](/api/interfaces/entityhandle/)

### Returns

[`Pair`](/api/interfaces/pair/)\<`undefined`\>

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
