---
editUrl: false
next: false
prev: false
title: "Pipeline"
---

Defined in: node\_modules/@rbxts/planck/src/Pipeline.d.ts:8

Pipelines represent a set of ordered Phases. Systems cannot be
assigned to Pipelines themselves, but rather to Phases within
those Pipelines.

## Methods

### insert()

> **insert**(`phase`): `this`

Defined in: node\_modules/@rbxts/planck/src/Pipeline.d.ts:19

Adds a Phase to the Pipeline, ordering it implicitly.

#### Parameters

##### phase

[`Phase`](/toucan/api/interfaces/phase/)

#### Returns

`this`

***

### insertAfter()

> **insertAfter**(`phase`, `after`): `this`

Defined in: node\_modules/@rbxts/planck/src/Pipeline.d.ts:21

Adds a Phase to the Pipeline after another Phase, ordering it explicitly.

#### Parameters

##### phase

[`Phase`](/toucan/api/interfaces/phase/)

##### after

[`Phase`](/toucan/api/interfaces/phase/)

#### Returns

`this`

***

### insertBefore()

> **insertBefore**(`phase`, `before`): `this`

Defined in: node\_modules/@rbxts/planck/src/Pipeline.d.ts:23

Adds a Phase to the Pipeline before another Phase, ordering it explicitly.

#### Parameters

##### phase

[`Phase`](/toucan/api/interfaces/phase/)

##### before

[`Phase`](/toucan/api/interfaces/phase/)

#### Returns

`this`
