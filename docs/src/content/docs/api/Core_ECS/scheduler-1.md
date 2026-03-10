---
editUrl: false
next: false
prev: false
title: "scheduler"
---

> **scheduler**(): [`Scheduler`](/toucan/api/core_ecs/scheduler/)

Defined in: [src/scheduler.ts:322](https://github.com/OverlineJunior/toucan/blob/5e77424d22b6c9bab6a75574fb64d27ef5785ee2/src/scheduler.ts#L322)

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

[`Scheduler`](/toucan/api/core_ecs/scheduler/)
