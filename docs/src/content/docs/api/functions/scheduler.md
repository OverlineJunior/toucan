---
editUrl: false
next: false
prev: false
title: "scheduler"
---

> **scheduler**(): [`Scheduler`](/api/interfaces/scheduler/)

Defined in: [src/scheduler.ts:318](https://github.com/OverlineJunior/toucan/blob/f28f04d91a1f401a88e2816c1566e4ef64224416/src/scheduler.ts#L318)

Returns a new `Scheduler`, the starting point of a game made with Toucan.

Responsible for running systems, building plugins and organizing phases.

 @example*
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
    .useSystem(spawnPeople, STARTUP)
    .useSystem(greetPeople, UPDATE)
    .run()
```

## Returns

[`Scheduler`](/api/interfaces/scheduler/)
