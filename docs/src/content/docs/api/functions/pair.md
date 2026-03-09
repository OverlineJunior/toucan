---
editUrl: false
next: false
prev: false
title: "pair"
---

## Call Signature

> **pair**\<`R`\>(`relation`, `target`): [`Pair`](/api/interfaces/pair/)\<`R`\>

Defined in: [src/pair.ts:76](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/pair.ts#L76)

Creates a relationship _pair_ `relation → target` (e.g.: `Likes → Bob`),
where both `relation` and `target` can be either _entities_ or _components_.
Pairs can be assigned to any _id_, forming something like `Alice → Likes → Bob`.

Like _components_, _pairs_ can be associated to values. The value type of a
_pair_ is determined by its `relation` and `target` arguments:

- If `relation` is a _component_ with a value, then the _pair_ takes the same value type;
- Else if `target` is a _component_ with a value, then the _pair_ takes the same value type;
- Otherwise, the _pair_ is a _tag pair_ and does not hold a value.

# Example

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

# Example 2

```ts
const Begin = component()
const End = component()
const Position = component<Vector3>()

const line = entity()
    // Because `Begin` and `End` hold no values, those pairs take the value from `Position`.
    .set(pair(Begin, Position), new Vector3(0, 0, 0))
    .set(pair(End, Position), new Vector3(10, 0, 0))
```

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

## Call Signature

> **pair**\<`T`\>(`relation`, `target`): [`Pair`](/api/interfaces/pair/)\<`T`\>

Defined in: [src/pair.ts:77](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/pair.ts#L77)

Creates a relationship _pair_ `relation → target` (e.g.: `Likes → Bob`),
where both `relation` and `target` can be either _entities_ or _components_.
Pairs can be assigned to any _id_, forming something like `Alice → Likes → Bob`.

Like _components_, _pairs_ can be associated to values. The value type of a
_pair_ is determined by its `relation` and `target` arguments:

- If `relation` is a _component_ with a value, then the _pair_ takes the same value type;
- Else if `target` is a _component_ with a value, then the _pair_ takes the same value type;
- Otherwise, the _pair_ is a _tag pair_ and does not hold a value.

# Example

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

# Example 2

```ts
const Begin = component()
const End = component()
const Position = component<Vector3>()

const line = entity()
    // Because `Begin` and `End` hold no values, those pairs take the value from `Position`.
    .set(pair(Begin, Position), new Vector3(0, 0, 0))
    .set(pair(End, Position), new Vector3(10, 0, 0))
```

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

## Call Signature

> **pair**\<`R`, `T`\>(`relation`, `target`): [`Pair`](/api/interfaces/pair/)\<`R`\>

Defined in: [src/pair.ts:78](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/pair.ts#L78)

Creates a relationship _pair_ `relation → target` (e.g.: `Likes → Bob`),
where both `relation` and `target` can be either _entities_ or _components_.
Pairs can be assigned to any _id_, forming something like `Alice → Likes → Bob`.

Like _components_, _pairs_ can be associated to values. The value type of a
_pair_ is determined by its `relation` and `target` arguments:

- If `relation` is a _component_ with a value, then the _pair_ takes the same value type;
- Else if `target` is a _component_ with a value, then the _pair_ takes the same value type;
- Otherwise, the _pair_ is a _tag pair_ and does not hold a value.

# Example

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

# Example 2

```ts
const Begin = component()
const End = component()
const Position = component<Vector3>()

const line = entity()
    // Because `Begin` and `End` hold no values, those pairs take the value from `Position`.
    .set(pair(Begin, Position), new Vector3(0, 0, 0))
    .set(pair(End, Position), new Vector3(10, 0, 0))
```

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

## Call Signature

> **pair**\<`R`\>(`relation`, `target`): [`Pair`](/api/interfaces/pair/)\<`R`\>

Defined in: [src/pair.ts:79](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/pair.ts#L79)

Creates a relationship _pair_ `relation → target` (e.g.: `Likes → Bob`),
where both `relation` and `target` can be either _entities_ or _components_.
Pairs can be assigned to any _id_, forming something like `Alice → Likes → Bob`.

Like _components_, _pairs_ can be associated to values. The value type of a
_pair_ is determined by its `relation` and `target` arguments:

- If `relation` is a _component_ with a value, then the _pair_ takes the same value type;
- Else if `target` is a _component_ with a value, then the _pair_ takes the same value type;
- Otherwise, the _pair_ is a _tag pair_ and does not hold a value.

# Example

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

# Example 2

```ts
const Begin = component()
const End = component()
const Position = component<Vector3>()

const line = entity()
    // Because `Begin` and `End` hold no values, those pairs take the value from `Position`.
    .set(pair(Begin, Position), new Vector3(0, 0, 0))
    .set(pair(End, Position), new Vector3(10, 0, 0))
```

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

## Call Signature

> **pair**\<`T`\>(`relation`, `target`): [`Pair`](/api/interfaces/pair/)\<`T`\>

Defined in: [src/pair.ts:80](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/pair.ts#L80)

Creates a relationship _pair_ `relation → target` (e.g.: `Likes → Bob`),
where both `relation` and `target` can be either _entities_ or _components_.
Pairs can be assigned to any _id_, forming something like `Alice → Likes → Bob`.

Like _components_, _pairs_ can be associated to values. The value type of a
_pair_ is determined by its `relation` and `target` arguments:

- If `relation` is a _component_ with a value, then the _pair_ takes the same value type;
- Else if `target` is a _component_ with a value, then the _pair_ takes the same value type;
- Otherwise, the _pair_ is a _tag pair_ and does not hold a value.

# Example

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

# Example 2

```ts
const Begin = component()
const End = component()
const Position = component<Vector3>()

const line = entity()
    // Because `Begin` and `End` hold no values, those pairs take the value from `Position`.
    .set(pair(Begin, Position), new Vector3(0, 0, 0))
    .set(pair(End, Position), new Vector3(10, 0, 0))
```

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

## Call Signature

> **pair**(`relation`, `target`): [`Pair`](/api/interfaces/pair/)\<`undefined`\>

Defined in: [src/pair.ts:81](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/pair.ts#L81)

Creates a relationship _pair_ `relation → target` (e.g.: `Likes → Bob`),
where both `relation` and `target` can be either _entities_ or _components_.
Pairs can be assigned to any _id_, forming something like `Alice → Likes → Bob`.

Like _components_, _pairs_ can be associated to values. The value type of a
_pair_ is determined by its `relation` and `target` arguments:

- If `relation` is a _component_ with a value, then the _pair_ takes the same value type;
- Else if `target` is a _component_ with a value, then the _pair_ takes the same value type;
- Otherwise, the _pair_ is a _tag pair_ and does not hold a value.

# Example

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

# Example 2

```ts
const Begin = component()
const End = component()
const Position = component<Vector3>()

const line = entity()
    // Because `Begin` and `End` hold no values, those pairs take the value from `Position`.
    .set(pair(Begin, Position), new Vector3(0, 0, 0))
    .set(pair(End, Position), new Vector3(10, 0, 0))
```

### Parameters

#### relation

[`EntityHandle`](/api/interfaces/entityhandle/)

#### target

[`EntityHandle`](/api/interfaces/entityhandle/)

### Returns

[`Pair`](/api/interfaces/pair/)\<`undefined`\>
