---
editUrl: false
next: false
prev: false
title: "ValidatedComponentPayload"
---

> **ValidatedComponentPayload**\<`Payload`\> = `Payload` & `{ readonly [K in keyof Payload]: ValidatedPayloadItem<Payload[K]> }`

Defined in: [util.ts:88](https://github.com/OverlineJunior/toucan/blob/master/src/util.ts#L88)

A component payload whose items are checked against their component value
types.

Bare items must be tags, while `[componentLike, value]` tuples require `value`
to match the component's value type.

## Type Parameters

### Payload

`Payload` *extends* readonly [`ComponentPayloadItem`](/toucan/api/types/componentpayloaditem/)[]

## Example

```ts
const Died = component()
const Damage = component<number>()

function emit<
    const Payload extends ComponentPayloadItem[],
>(...payload: ValidatedComponentPayload<Payload>): void {
    message<Payload>(...payload)
}

emit(Died)           // ok, tag
emit([Damage, 25])   // ok, number
emit([Damage, '25']) // type error
```
