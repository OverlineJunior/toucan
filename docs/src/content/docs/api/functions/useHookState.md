---
editUrl: false
next: false
prev: false
title: "useHookState"
---

> **useHookState**\<`S`\>(`initial`, `identifier?`, `cleanup?`): `S`

Defined in: [src/topoRuntime.ts:81](https://github.com/OverlineJunior/toucan/blob/1c94ed864ac1c53d93ff8719b10efe66053841ce/src/topoRuntime.ts#L81)

**Don't use this function directly in your systems.**

This function is used for implementing your own topologically-aware functions. It should not be used in your
systems directly. You should use this function to implement your own utilities, similar to `useEvent` and
`useThrottle`.
:::

`useHookState` does one thing: it returns a table. An empty, pristine table. Here's the cool thing though:
it always returns the *same* table, based on the script and line where *your function* (the function calling
`useHookState`) was called.

### Uniqueness

If your function is called multiple times from the same line, perhaps within a loop, the default behavior of
`useHookState` is to uniquely identify these by call count, and will return a unique table for each call.

However, you can override this behavior: you can choose to key by any other value. This means that in addition to
script and line number, the storage will also only return the same table if the unique value (otherwise known as the
"discriminator") is the same.

### Cleaning up

As a second optional parameter, you can pass a function that is automatically invoked when your storage is about
to be cleaned up. This happens when your function (and by extension, `useHookState`) ceases to be called again
next frame (keyed by script, line number, and discriminator).

Your cleanup callback is passed the storage table that's about to be cleaned up. You can then perform cleanup work,
like disconnecting events.

*Or*, you could return `true`, and abort cleaning up altogether. If you abort cleanup, your storage will stick
around another frame (even if your function wasn't called again). This can be used when you know that the user will
(or might) eventually call your function again, even if they didn't this frame. (For example, caching a value for
a number of seconds).

If cleanup is aborted, your cleanup function will continue to be called every frame, until you don't abort cleanup,
or the user actually calls your function again.

### Example: useThrottle

This is the entire implementation of the built-in `useThrottle` function:

```ts
export function useThrottle(seconds: number, identifier?: unknown): boolean {
    const state = useHookState(
        {} as { time?: number; expiry?: number },
        identifier,
        (state) => os.clock() < (state.expiry ?? 0)
    );

    const now = os.clock();

    if (state.time === undefined || now - state.time >= seconds) {
        state.time = now;
        state.expiry = now + seconds;
        return true;
    }

    return false;
}
```

A lot of talk for something so simple, right?

## Type Parameters

### S

`S` *extends* `object`

## Parameters

### initial

`S`

The initial storage object.

### identifier?

`any`

A unique value to additionally key by (optional).

### cleanup?

`CleanupFn`\<`S`\>

A function to run when the storage for this hook is cleaned up (optional).

## Returns

`S`

The persistent hook storage object.
