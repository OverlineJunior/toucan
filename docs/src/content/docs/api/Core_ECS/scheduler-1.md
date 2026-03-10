---
editUrl: false
next: false
prev: false
title: "scheduler"
---

> **scheduler**(): [`Scheduler`](/toucan/api/core_ecs/scheduler/)

Defined in: [scheduler.ts:322](https://github.com/OverlineJunior/toucan/blob/d7a6e6d9807f9afe6ad990c7456c15691aa2daa2/src/scheduler.ts#L322)

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
