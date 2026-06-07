---
editUrl: false
next: false
prev: false
title: "pair"
---

## Call Signature

> **pair**\<`R`\>(`relation`, `target`): [`Pair`](/toucan/api/types/pair/)\<`R`\>

Defined in: [pair.ts:113](https://github.com/OverlineJunior/toucan/blob/master/src/pair.ts#L113)

Creates a relationship pair `relation -> target` (e.g.: `Likes -> Bob`),
where both `relation` and `target` can be either regular entities or components.
Pairs can be assigned to any entity, forming something like `Alice → Likes → Bob`.

Like components, pairs can be associated with values. The value type of a
pair is determined by its `relation` and `target` arguments:
- If `relation` is a component with a value, then the pair takes the same value type;
- Else if `target` is a component with a value, then the pair takes the same value type;
- Otherwise, the pair is a tag pair and does not hold a value.

### Type Parameters

#### R

`R`

### Parameters

#### relation

[`ComponentHandle`](/toucan/api/types/componenthandle/)\<`R`\>

#### target

[`ComponentHandle`](/toucan/api/types/componenthandle/)\<`undefined`\>

### Returns

[`Pair`](/toucan/api/types/pair/)\<`R`\>

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

> **pair**\<`T`\>(`relation`, `target`): [`Pair`](/toucan/api/types/pair/)\<`T`\>

Defined in: [pair.ts:117](https://github.com/OverlineJunior/toucan/blob/master/src/pair.ts#L117)

Creates a relationship pair `relation -> target` (e.g.: `Likes -> Bob`),
where both `relation` and `target` can be either regular entities or components.
Pairs can be assigned to any entity, forming something like `Alice → Likes → Bob`.

Like components, pairs can be associated with values. The value type of a
pair is determined by its `relation` and `target` arguments:
- If `relation` is a component with a value, then the pair takes the same value type;
- Else if `target` is a component with a value, then the pair takes the same value type;
- Otherwise, the pair is a tag pair and does not hold a value.

### Type Parameters

#### T

`T`

### Parameters

#### relation

[`ComponentHandle`](/toucan/api/types/componenthandle/)\<`undefined`\>

#### target

[`ComponentHandle`](/toucan/api/types/componenthandle/)\<`T`\>

### Returns

[`Pair`](/toucan/api/types/pair/)\<`T`\>

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

> **pair**\<`R`, `T`\>(`relation`, `target`): [`Pair`](/toucan/api/types/pair/)\<`R`\>

Defined in: [pair.ts:121](https://github.com/OverlineJunior/toucan/blob/master/src/pair.ts#L121)

Creates a relationship pair `relation -> target` (e.g.: `Likes -> Bob`),
where both `relation` and `target` can be either regular entities or components.
Pairs can be assigned to any entity, forming something like `Alice → Likes → Bob`.

Like components, pairs can be associated with values. The value type of a
pair is determined by its `relation` and `target` arguments:
- If `relation` is a component with a value, then the pair takes the same value type;
- Else if `target` is a component with a value, then the pair takes the same value type;
- Otherwise, the pair is a tag pair and does not hold a value.

### Type Parameters

#### R

`R`

#### T

`T`

### Parameters

#### relation

[`ComponentHandle`](/toucan/api/types/componenthandle/)\<`R`\>

#### target

[`ComponentHandle`](/toucan/api/types/componenthandle/)\<`T`\>

### Returns

[`Pair`](/toucan/api/types/pair/)\<`R`\>

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

> **pair**\<`R`\>(`relation`, `target`): [`Pair`](/toucan/api/types/pair/)\<`R`\>

Defined in: [pair.ts:125](https://github.com/OverlineJunior/toucan/blob/master/src/pair.ts#L125)

Creates a relationship pair `relation -> target` (e.g.: `Likes -> Bob`),
where both `relation` and `target` can be either regular entities or components.
Pairs can be assigned to any entity, forming something like `Alice → Likes → Bob`.

Like components, pairs can be associated with values. The value type of a
pair is determined by its `relation` and `target` arguments:
- If `relation` is a component with a value, then the pair takes the same value type;
- Else if `target` is a component with a value, then the pair takes the same value type;
- Otherwise, the pair is a tag pair and does not hold a value.

### Type Parameters

#### R

`R`

### Parameters

#### relation

[`ComponentHandle`](/toucan/api/types/componenthandle/)\<`R`\>

#### target

[`EntityHandle`](/toucan/api/types/entityhandle/)

### Returns

[`Pair`](/toucan/api/types/pair/)\<`R`\>

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

> **pair**\<`T`\>(`relation`, `target`): [`Pair`](/toucan/api/types/pair/)\<`T`\>

Defined in: [pair.ts:129](https://github.com/OverlineJunior/toucan/blob/master/src/pair.ts#L129)

Creates a relationship pair `relation -> target` (e.g.: `Likes -> Bob`),
where both `relation` and `target` can be either regular entities or components.
Pairs can be assigned to any entity, forming something like `Alice → Likes → Bob`.

Like components, pairs can be associated with values. The value type of a
pair is determined by its `relation` and `target` arguments:
- If `relation` is a component with a value, then the pair takes the same value type;
- Else if `target` is a component with a value, then the pair takes the same value type;
- Otherwise, the pair is a tag pair and does not hold a value.

### Type Parameters

#### T

`T`

### Parameters

#### relation

[`EntityHandle`](/toucan/api/types/entityhandle/)

#### target

[`ComponentHandle`](/toucan/api/types/componenthandle/)\<`T`\>

### Returns

[`Pair`](/toucan/api/types/pair/)\<`T`\>

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

> **pair**(`relation`, `target`): [`Pair`](/toucan/api/types/pair/)\<`undefined`\>

Defined in: [pair.ts:133](https://github.com/OverlineJunior/toucan/blob/master/src/pair.ts#L133)

Creates a relationship pair `relation -> target` (e.g.: `Likes -> Bob`),
where both `relation` and `target` can be either regular entities or components.
Pairs can be assigned to any entity, forming something like `Alice → Likes → Bob`.

Like components, pairs can be associated with values. The value type of a
pair is determined by its `relation` and `target` arguments:
- If `relation` is a component with a value, then the pair takes the same value type;
- Else if `target` is a component with a value, then the pair takes the same value type;
- Otherwise, the pair is a tag pair and does not hold a value.

### Parameters

#### relation

[`EntityHandle`](/toucan/api/types/entityhandle/)

#### target

[`EntityHandle`](/toucan/api/types/entityhandle/)

### Returns

[`Pair`](/toucan/api/types/pair/)\<`undefined`\>

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
