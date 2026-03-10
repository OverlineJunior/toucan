---
editUrl: false
next: false
prev: false
title: "scheduler"
---

> **scheduler**(): [`Scheduler`](/api/core_ecs/scheduler/)

Defined in: [src/scheduler.ts:322](https://github.com/OverlineJunior/toucan/blob/d9d8710f3d24167621f79a1bf7051c996358ce73/src/scheduler.ts#L322)

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

[`Scheduler`](/api/core_ecs/scheduler/)
