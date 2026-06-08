---
editUrl: false
next: false
prev: false
title: "scheduler"
---

> **scheduler**(): [`Scheduler`](/toucan/api/types/scheduler/)

Defined in: [scheduler/scheduler.ts:479](https://github.com/OverlineJunior/toucan/blob/master/src/scheduler/scheduler.ts#L479)

Returns a new [Scheduler](/toucan/api/types/scheduler/), the starting point of a game made with Toucan.

It is responsible for running systems, building plugins and configuring system sets.

## Returns

[`Scheduler`](/toucan/api/types/scheduler/)

## Remarks

Only one scheduler can exist at a time. Calling `scheduler()` multiple times will throw an error.

## Example

```ts
const Person = component()
const Age = component<number>()

function spawnPeople() {
    entity('Alice').set(Age, 25)
    entity('Bob').set(Age, 30)
}

const greetPeople = query(Age).with(Person).bind((entity, age) => {
    print(`Hello, ${entity}! I can magically sense that you're ${age} years old!`)
})

scheduler()
    .useSystem('startup', spawnPeople)
    .useSystem('update', greetPeople)
    .run()
```
