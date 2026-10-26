import { type Component, entity, type InferValue } from './entities'
import { Builtin } from './entities/builtins'
import type { Pair } from './entities/pair'
import type { RawId } from './id'
import type { SystemData } from './scheduler/system'
import { isArray } from './util'
import { world } from './world'

type Term = Component | Pair

type Payload = Term | readonly [Term, unknown]

type NormalizedArg<Arg> = Arg extends readonly [infer T, infer V]
	? [T, V]
	: [Arg, undefined]

type ValidArg<Arg> =
	NormalizedArg<Arg> extends [infer T extends Term, infer V]
		? [V] extends [InferValue<T>]
			? Arg
			: never
		: never

type ValidArgs<Args extends readonly Payload[]> = Args & {
	readonly [K in keyof Args]: ValidArg<Args[K]>
}

// Sequence number given to the next emitted message. Never reused.
let nextSequence = 0
// First sequence number of the current frame, recorded by the last cleanup.
let frameFirstSequence = 0

export function getCurrentMessageSequence(): number {
	return nextSequence
}

/**
 * Returns the first message sequence the given system hasn't read yet for the
 * given signature, and marks every message emitted so far (up to `now`) as read.
 */
export function advanceMessageCursor(
	systemRawId: RawId,
	signature: string,
	now: number,
): number {
	const sysData = world.get(systemRawId, Builtin.System.id) as
		| SystemData
		| undefined
	if (sysData === undefined) {
		return 0
	}

	let cursors = sysData.cursors
	if (cursors === undefined) {
		cursors = new Map()
		sysData.cursors = cursors
	}

	const cursor = cursors.get(signature) ?? 0
	cursors.set(signature, now)
	return cursor
}

/**
 * Must run once at the start of every frame.
 *
 * Messages live through the frame they were emitted in plus the next one, so
 * systems that run before the emitter still get to read them.
 *
 * Instead of storing a frame number on each message, we only remember where
 * the current frame started in sequence numbers. Anything below the previous
 * frame's start was emitted two or more frames ago.
 */
export function clearStaleMessages() {
	// Start of the previous frame.
	const threshold = frameFirstSequence
	// Start of the frame that's beginning now.
	frameFirstSequence = nextSequence

	const staleIds: RawId[] = []
	for (const [id, seq] of world.query(Builtin.MessageSequence.id)) {
		if ((seq as number) < threshold) staleIds.push(id)
	}
	// TODO! Might be able to do directly in the previous loop.
	// Unsure if Jecs supports mutation during iteration.
	for (const id of staleIds) world.delete(id)
}

/**
 * Spawns a message entity with the given terms and emits it.
 *
 * Tags are passed as bare components or pairs, while components and pairs with
 * a value are passed as `[term, value]` tuples.
 *
 * See {@link Query.on} to read messages.
 *
 * @example
 * ```ts
 * const Died = component()
 * const Damage = component<number>()
 * const Attacker = component()
 * const Bounty = component<number>()
 *
 * const goblin = entity()
 *
 * message(
 *     Died,
 *     [Damage, 25],
 *     pair(Attacker, goblin),
 *     [pair(Bounty, goblin), 10],
 * )
 * ```
 *
 * @group Core
 */
export function message<const Args extends readonly [Payload, ...Payload[]]>(
	...args: ValidArgs<Args>
): void {
	// TODO! Creating a raw entity would be more performant.
	// Or better yet, optimizing `entity()` so that's not needed.
	const e = entity().set(Builtin.MessageSequence, nextSequence++)

	for (const arg of args) {
		if (isArray(arg)) {
			const [term, value] = arg as readonly [Term, unknown]
			e.set(term as Component, value)
		} else {
			e.set(arg as Component, undefined)
		}
	}
}
