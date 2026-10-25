import { type Component, entity, type InferValue } from './entities'
import { Builtin } from './entities/builtins'
import type { Pair } from './entities/pair'
import type { RawId } from './id'
import { System, type SystemData } from './scheduler/system'
import { world } from './world'

type Term = Component | Pair

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
	const sysData = world.get(systemRawId, System.id) as SystemData | undefined
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

class MessageBuilder {
	private readonly termValues: [Term, unknown][] = []

	set(tagComponent: Component<undefined>): this
	set<C extends Component>(component: C, value: InferValue<C>): this
	set(tagPair: Pair<undefined>): this
	set<P extends Pair>(pair: P, value: InferValue<P>): this
	set(term: Term, value?: unknown): this {
		this.termValues.push([term, value])
		return this
	}

	emit() {
		if (this.termValues.isEmpty()) {
			error('Cannot emit a message with no component or pair')
		}

		// TODO! Creating a raw entity would be more performant.
		// Or better yet, optimizing `entity()` so that's not needed.
		const e = entity().set(Builtin.MessageSequence, nextSequence++)

		for (const [t, v] of this.termValues) {
			e.set(t as Component, v)
		}
	}
}

export function message(): MessageBuilder {
	return new MessageBuilder()
}
