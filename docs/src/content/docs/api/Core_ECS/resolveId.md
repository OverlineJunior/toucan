---
editUrl: false
next: false
prev: false
title: "resolveId"
---

> **resolveId**(`rawId`): [`EntityHandle`](/toucan/api/core_ecs/entityhandle/) \| [`ComponentHandle`](/toucan/api/core_ecs/componenthandle/)\<`unknown`\> \| [`ResourceHandle`](/toucan/api/core_ecs/resourcehandle/)\<`unknown`\>

Defined in: [src/handle.ts:65](https://github.com/OverlineJunior/toucan/blob/master/src/handle.ts#L65)

Returns the appropriate handle for `rawId`, or `undefined` if it does not exist in the world.

## Parameters

### rawId

[`RawId`](/toucan/api/core_ecs/rawid/)

## Returns

[`EntityHandle`](/toucan/api/core_ecs/entityhandle/) \| [`ComponentHandle`](/toucan/api/core_ecs/componenthandle/)\<`unknown`\> \| [`ResourceHandle`](/toucan/api/core_ecs/resourcehandle/)\<`unknown`\>
