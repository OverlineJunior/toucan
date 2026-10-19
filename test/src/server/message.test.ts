import { Assert, BeforeEach, Test } from '@rbxts/lunit'
import { Each } from '@rbxts/lunit/out/lib/decorator'
import {
	Builtin,
	component,
	entity,
	type Handle,
	message,
	pair,
	query,
	scheduler,
} from '@rbxts/toucan'
import { clearWorld } from './helpers'

class MessageTests {
	@BeforeEach
	reset() {
		clearWorld()
	}

	@Test
	message_emit_withComponent_isReadByOnQuery() {
		const sched = scheduler()
		const Fired = component<number>('Fired')
		let seenEntity: Handle | undefined
		let seenValue: number | undefined

		sched.useSystem('update', () => {
			query()
				.on(Fired)
				.forEach((msg, value) => {
					seenEntity = msg
					seenValue = value
				})
		})

		message().set(Fired, 1).emit()
		sched.__tick()

		Assert.true(seenEntity !== undefined, 'Expected the message to be read')
		Assert.true(seenEntity!.exists(), 'Expected the message entity to exist')
		Assert.equal(seenValue, 1, 'Expected the message value to be 1')
	}

	@Test
	message_emit_withTagComponent_passesUndefined() {
		const sched = scheduler()
		const Fired = component('Fired')
		let seenValue: unknown = 'unset'

		sched.useSystem('update', () => {
			query()
				.on(Fired)
				.forEach((_msg, value) => {
					seenValue = value
				})
		})

		message().set(Fired).emit()
		sched.__tick()

		Assert.equal(
			seenValue,
			undefined,
			'Expected a tag message to pass undefined',
		)
	}

	@Test
	message_emit_withMultipleTerms_passesValuesInOrder() {
		const sched = scheduler()
		const A = component<number>('A')
		const B = component<number>('B')
		let seenA: number | undefined
		let seenB: number | undefined

		sched.useSystem('update', () => {
			query()
				.on(A, B)
				.forEach((_msg, a, b) => {
					seenA = a
					seenB = b
				})
		})

		message().set(A, 1).set(B, 2).emit()
		sched.__tick()

		Assert.equal(seenA, 1, 'Expected the first term value to be 1')
		Assert.equal(seenB, 2, 'Expected the second term value to be 2')
	}

	@Test
	message_emit_withPair_passesPairValue() {
		const sched = scheduler()
		const Owns = component<number>('Owns')
		const car = entity('Car')
		const ownsCar = pair(Owns, car)
		let seenValue: number | undefined

		sched.useSystem('update', () => {
			query()
				.on(ownsCar)
				.forEach((_msg, value) => {
					seenValue = value
				})
		})

		message().set(ownsCar, 5).emit()
		sched.__tick()

		Assert.equal(seenValue, 5, 'Expected the pair value to be 5')
	}

	@Test
	message_emit_withTagPair_passesUndefined() {
		const sched = scheduler()
		const Likes = component('Likes')
		const bob = entity('Bob')
		const likesBob = pair(Likes, bob)
		let seenValue: unknown = 'unset'

		sched.useSystem('update', () => {
			query()
				.on(likesBob)
				.forEach((_msg, value) => {
					seenValue = value
				})
		})

		message().set(likesBob).emit()
		sched.__tick()

		Assert.equal(seenValue, undefined, 'Expected a tag pair to pass undefined')
	}

	@Test
	@Each([[0], [false], [''], [-1]])
	message_emit_withFalsyValues_preservesThem(value: number | boolean | string) {
		const sched = scheduler()
		const Value = component<number | boolean | string>('Value')
		let seenValue: unknown = 'unset'

		sched.useSystem('update', () => {
			query()
				.on(Value)
				.forEach((_msg, v) => {
					seenValue = v
				})
		})

		message().set(Value, value).emit()
		sched.__tick()

		Assert.equal(
			seenValue,
			value,
			`Expected ${tostring(value)} to be preserved`,
		)
	}

	@Test
	message_emit_withNoTerms_throws() {
		const sched = scheduler()
		const Fired = component<number>('Fired')
		let called = false

		sched.useSystem('update', () => {
			query()
				.on(Fired)
				.forEach(() => {
					called = true
				})
		})

		Assert.throws(
			() => message().emit(),
			undefined,
			'Expected emitting a message with no terms to throw',
		)

		sched.__tick()
		Assert.false(called, 'Expected no message to be read')
	}

	@Test
	message_emit_multipleMessagesInSameFrame_preservesOrder() {
		const sched = scheduler()
		const Fired = component<number>('Fired')
		const seen: [Handle, number][] = []

		sched.useSystem('update', () => {
			query()
				.on(Fired)
				.forEach((msg, value) => {
					seen.push([msg, value])
				})
		})

		message().set(Fired, 1).emit()
		message().set(Fired, 2).emit()
		message().set(Fired, 3).emit()
		sched.__tick()

		Assert.equal(seen.size(), 3, 'Expected three messages to be read')
		Assert.equal(seen[0][1], 1, 'Expected the first message value to be 1')
		Assert.equal(seen[1][1], 2, 'Expected the second message value to be 2')
		Assert.equal(seen[2][1], 3, 'Expected the third message value to be 3')
		Assert.true(
			seen[0][0].id !== seen[1][0].id &&
				seen[1][0].id !== seen[2][0].id &&
				seen[0][0].id !== seen[2][0].id,
			'Expected each message to be a distinct entity',
		)
	}

	@Test
	query_on_withNoRequiredComponents_receivesMessageAndValues() {
		const sched = scheduler()
		const Fired = component<number>('Fired')
		let seenEntity: Handle | undefined
		let seenValue: number | undefined

		sched.useSystem('update', () => {
			query()
				.on(Fired)
				.forEach((msg, value) => {
					seenEntity = msg
					seenValue = value
				})
		})

		message().set(Fired, 42).emit()
		sched.__tick()

		Assert.true(seenEntity !== undefined, 'Expected the message to be read')
		Assert.equal(seenValue, 42, 'Expected the message value to be 42')
	}

	@Test
	query_on_withRequiredComponents_receivesEntityThenMessage() {
		const sched = scheduler()
		const Health = component<number>('Health')
		const Damaged = component<number>('Damaged')
		const alice = entity('Alice').set(Health, 100)
		let seenEntity: Handle | undefined
		let seenHealth: number | undefined
		let seenMessage: Handle | undefined
		let seenDamage: number | undefined

		sched.useSystem('update', () => {
			query(Health)
				.on(Damaged)
				.forEach((e, health, msg, damage) => {
					seenEntity = e
					seenHealth = health
					seenMessage = msg
					seenDamage = damage
				})
		})

		message().set(Damaged, 10).emit()
		sched.__tick()

		Assert.equal(seenEntity, alice, 'Expected the base entity to be Alice')
		Assert.equal(seenHealth, 100, 'Expected the base entity health to be 100')
		Assert.true(seenMessage !== undefined, 'Expected the message to be read')
		Assert.equal(seenDamage, 10, 'Expected the message damage to be 10')
	}

	@Test
	query_on_withMultipleRequiredComponents_preservesArgumentOrder() {
		const sched = scheduler()
		const A = component<number>('A')
		const B = component<number>('B')
		const Msg = component<number>('Msg')
		const e = entity('E').set(A, 1).set(B, 2)
		let seen: [Handle, number, number, Handle, number] | undefined

		sched.useSystem('update', () => {
			query(A, B)
				.on(Msg)
				.forEach((entity, a, b, msg, value) => {
					seen = [entity, a, b, msg, value]
				})
		})

		message().set(Msg, 3).emit()
		sched.__tick()

		Assert.true(seen !== undefined, 'Expected the message to be read')
		Assert.equal(seen![0], e, 'Expected the base entity to be E')
		Assert.equal(seen![1], 1, 'Expected the first component value to be 1')
		Assert.equal(seen![2], 2, 'Expected the second component value to be 2')
		Assert.true(seen![3].exists(), 'Expected the message entity to exist')
		Assert.equal(seen![4], 3, 'Expected the message value to be 3')
	}

	@Test
	query_on_withMultipleMessageTerms_requiresAllTerms() {
		const sched = scheduler()
		const A = component<number>('A')
		const B = component<number>('B')
		const seen: number[] = []

		sched.useSystem('update', () => {
			query()
				.on(A, B)
				.forEach((_msg, a, b) => {
					seen.push(a + b)
				})
		})

		message().set(A, 1).emit()
		message().set(A, 2).set(B, 3).emit()
		sched.__tick()

		Assert.equal(
			seen.size(),
			1,
			'Expected only the message with both terms to match',
		)
		Assert.equal(
			seen[0],
			5,
			'Expected the matching message values to be 2 and 3',
		)
	}

	@Test
	query_on_withSubsetOfMessageTerms_matches() {
		const sched = scheduler()
		const A = component<number>('A')
		const B = component<number>('B')
		const seenA: number[] = []
		const seenB: number[] = []

		sched.useSystem('update', () => {
			query()
				.on(A)
				.forEach((_msg, a) => seenA.push(a))
			query()
				.on(B)
				.forEach((_msg, b) => seenB.push(b))
		})

		message().set(A, 1).set(B, 2).emit()
		sched.__tick()

		Assert.equal(seenA.size(), 1, 'Expected on(A) to match the message')
		Assert.equal(seenA[0], 1, 'Expected on(A) to receive 1')
		Assert.equal(seenB.size(), 1, 'Expected on(B) to match the message')
		Assert.equal(seenB[0], 2, 'Expected on(B) to receive 2')
	}

	@Test
	query_on_withNoMatchingMessages_doesNotCallCallback() {
		const sched = scheduler()
		const Fired = component<number>('Fired')
		const Other = component<number>('Other')
		let called = false

		sched.useSystem('update', () => {
			query()
				.on(Fired)
				.forEach(() => {
					called = true
				})
		})

		message().set(Other, 1).emit()
		sched.__tick()

		Assert.false(called, 'Expected an unrelated message not to match')
	}

	@Test
	query_on_withNoMessages_doesNotCallCallback() {
		const sched = scheduler()
		const Fired = component<number>('Fired')
		let called = false

		sched.useSystem('update', () => {
			query()
				.on(Fired)
				.forEach(() => {
					called = true
				})
		})

		sched.__tick()

		Assert.false(called, 'Expected no callback without messages')
	}

	@Test
	query_on_doesNotMatchPlainEntities() {
		const sched = scheduler()
		const Fired = component<number>('Fired')
		let called = false

		sched.useSystem('update', () => {
			query()
				.on(Fired)
				.forEach(() => {
					called = true
				})
		})

		entity('Alice').set(Fired, 1)
		sched.__tick()

		Assert.false(called, 'Expected a plain entity not to be read as a message')
	}

	@Test
	query_on_withBaseQuery_pairsEachMessageWithEveryMatchingEntity() {
		const sched = scheduler()
		const Health = component<number>('Health')
		const Damaged = component<number>('Damaged')
		const alice = entity('Alice').set(Health, 100)
		const bob = entity('Bob').set(Health, 50)
		const seen: [Handle, number, Handle, number][] = []

		sched.useSystem('update', () => {
			query(Health)
				.on(Damaged)
				.forEach((e, health, msg, damage) => {
					seen.push([e, health, msg, damage])
				})
		})

		message().set(Damaged, 10).emit()
		sched.__tick()

		Assert.equal(
			seen.size(),
			2,
			'Expected the message to pair with both entities',
		)
		const aliceEntry = seen.find(([e]) => e === alice)
		const bobEntry = seen.find(([e]) => e === bob)
		Assert.true(aliceEntry !== undefined, 'Expected Alice to be paired')
		Assert.true(bobEntry !== undefined, 'Expected Bob to be paired')
		Assert.equal(aliceEntry![1], 100, 'Expected Alice health to be 100')
		Assert.equal(bobEntry![1], 50, 'Expected Bob health to be 50')
		Assert.equal(aliceEntry![3], 10, 'Expected Alice damage to be 10')
		Assert.equal(bobEntry![3], 10, 'Expected Bob damage to be 10')
		Assert.equal(
			aliceEntry![2].id,
			bobEntry![2].id,
			'Expected both pairs to use the same message',
		)
	}

	@Test
	query_on_withBaseQuery_andNoMatchingEntities_doesNotCallCallback() {
		const sched = scheduler()
		const Health = component<number>('Health')
		const Damaged = component<number>('Damaged')
		let called = false

		sched.useSystem('update', () => {
			query(Health)
				.on(Damaged)
				.forEach(() => {
					called = true
				})
		})

		message().set(Damaged, 10).emit()
		sched.__tick()

		Assert.false(called, 'Expected no callback without matching base entities')
	}

	@Test
	query_on_withBaseQuery_excludesMessageEntities() {
		const sched = scheduler()
		const Health = component<number>('Health')
		const Damaged = component<number>('Damaged')
		const alice = entity('Alice').set(Health, 100)
		const seen: Handle[] = []

		sched.useSystem('update', () => {
			query(Health)
				.on(Damaged)
				.forEach((e) => {
					seen.push(e)
				})
		})

		message().set(Health, 999).set(Damaged, 10).emit()
		sched.__tick()

		Assert.equal(seen.size(), 1, 'Expected only the real entity to match')
		Assert.equal(seen[0], alice, 'Expected the real entity to be Alice')
	}

	@Test
	query_on_withBaseQuery_appliesWithWithoutFilter() {
		const sched = scheduler()
		const Health = component<number>('Health')
		const Stamina = component<number>('Stamina')
		const Stunned = component('Stunned')
		const Damaged = component<number>('Damaged')
		const alice = entity('Alice').set(Health, 100).set(Stamina, 50)
		entity('Bob').set(Health, 100).set(Stamina, 50).set(Stunned)
		entity('Charlie').set(Health, 100)
		entity('Dave').set(Health, 5).set(Stamina, 50)
		const seen: Handle[] = []

		sched.useSystem('update', () => {
			query(Health)
				.with(Stamina)
				.without(Stunned)
				.filter((_e, health) => health > 10)
				.on(Damaged)
				.forEach((e) => {
					seen.push(e)
				})
		})

		message().set(Damaged, 10).emit()
		sched.__tick()

		Assert.equal(seen.size(), 1, 'Expected only Alice to match all criteria')
		Assert.equal(seen[0], alice, 'Expected the matching entity to be Alice')
	}

	@Test
	query_on_sameSystemReadsEachMessageOnce() {
		const sched = scheduler()
		const Fired = component<number>('Fired')
		const seen: number[] = []

		sched.useSystem('update', () => {
			query()
				.on(Fired)
				.forEach((_msg, value) => seen.push(value))
			query()
				.on(Fired)
				.forEach((_msg, value) => seen.push(value))
		})

		message().set(Fired, 1).emit()
		sched.__tick()

		Assert.equal(seen.size(), 1, 'Expected the message to be read only once')
		Assert.equal(seen[0], 1, 'Expected the message value to be 1')
	}

	@Test
	query_on_differentSystemsReadSameMessageIndependently() {
		const sched = scheduler()
		const Fired = component<number>('Fired')
		const seenA: number[] = []
		const seenB: number[] = []

		sched.useSystem('update', () => {
			query()
				.on(Fired)
				.forEach((_msg, value) => seenA.push(value))
		})
		sched.useSystem('update', () => {
			query()
				.on(Fired)
				.forEach((_msg, value) => seenB.push(value))
		})

		message().set(Fired, 1).emit()
		sched.__tick()

		Assert.equal(
			seenA.size(),
			1,
			'Expected the first system to read the message',
		)
		Assert.equal(
			seenB.size(),
			1,
			'Expected the second system to read the message',
		)
	}

	@Test
	query_on_differentSignaturesHaveIndependentCursors() {
		const sched = scheduler()
		const A = component<number>('A')
		const B = component<number>('B')
		const seenA: number[] = []
		const seenB: number[] = []

		sched.useSystem('update', () => {
			query()
				.on(A)
				.forEach((_msg, value) => seenA.push(value))
			query()
				.on(B)
				.forEach((_msg, value) => seenB.push(value))
		})

		message().set(A, 1).emit()
		message().set(B, 2).emit()
		sched.__tick()

		Assert.equal(seenA.size(), 1, 'Expected on(A) to read its message')
		Assert.equal(seenA[0], 1, 'Expected on(A) to receive 1')
		Assert.equal(seenB.size(), 1, 'Expected on(B) to read its message')
		Assert.equal(seenB[0], 2, 'Expected on(B) to receive 2')
	}

	@Test
	query_on_messageEmittedBeforeQuery_isReadInSamePass() {
		const sched = scheduler()
		const Fired = component<number>('Fired')
		let seenValue: number | undefined

		sched.useSystem('update', () => {
			message().set(Fired, 1).emit()
			query()
				.on(Fired)
				.forEach((_msg, value) => {
					seenValue = value
				})
		})

		sched.__tick()

		Assert.equal(
			seenValue,
			1,
			'Expected the message to be read in the same pass',
		)
	}

	@Test
	query_on_messageEmittedDuringCallback_isNotReadInSamePass() {
		const sched = scheduler()
		const Fired = component<number>('Fired')
		const seen: number[] = []
		let emitted = false

		sched.useSystem('update', () => {
			query()
				.on(Fired)
				.forEach((_msg, value) => {
					seen.push(value)
					if (!emitted) {
						emitted = true
						message().set(Fired, 2).emit()
					}
				})
		})

		message().set(Fired, 1).emit()
		sched.__tick()

		Assert.equal(
			seen.size(),
			1,
			'Expected only the original message in the first pass',
		)
		Assert.equal(seen[0], 1, 'Expected the original message value to be 1')

		sched.__tick()

		Assert.equal(
			seen.size(),
			2,
			'Expected the emitted message to be read next frame',
		)
		Assert.equal(seen[1], 2, 'Expected the emitted message value to be 2')
	}

	@Test
	query_on_messageEmittedAfterQuery_isReadNextFrame() {
		const sched = scheduler()
		const Fired = component<number>('Fired')
		const seen: number[] = []
		let emitted = false

		sched.useSystem('update', () => {
			query()
				.on(Fired)
				.forEach((_msg, value) => seen.push(value))
			if (!emitted) {
				emitted = true
				message().set(Fired, 1).emit()
			}
		})

		sched.__tick()
		Assert.equal(seen.size(), 0, 'Expected no message in the first pass')

		sched.__tick()
		Assert.equal(seen.size(), 1, 'Expected the message to be read next frame')
		Assert.equal(seen[0], 1, 'Expected the message value to be 1')
	}

	@Test
	query_on_cursorAdvancesPastMessagesWithNoMatchingBaseEntities() {
		const sched = scheduler()
		const Health = component<number>('Health')
		const Damaged = component<number>('Damaged')
		const seen: number[] = []

		sched.useSystem('update', () => {
			query(Health)
				.on(Damaged)
				.forEach((_e, _health, _msg, damage) => {
					seen.push(damage)
				})

			entity('Alice').set(Health, 100)

			query(Health)
				.on(Damaged)
				.forEach((_e, _health, _msg, damage) => {
					seen.push(damage)
				})
		})

		message().set(Damaged, 10).emit()
		sched.__tick()

		Assert.equal(
			seen.size(),
			0,
			'Expected the cursor to advance past the message',
		)
	}

	@Test
	query_on_find_stopsAtFirstMatchAndConsumesRest() {
		const sched = scheduler()
		const Fired = component<number>('Fired')
		const seen: number[] = []
		let found: number | undefined

		sched.useSystem('update', () => {
			const result = query()
				.on(Fired)
				.find((_msg, value) => {
					seen.push(value)
					return value === 2
				})
			found = result?.[1]
		})

		message().set(Fired, 1).emit()
		message().set(Fired, 2).emit()
		message().set(Fired, 3).emit()
		sched.__tick()

		Assert.equal(found, 2, 'Expected find to return the matching message value')
		Assert.equal(seen.size(), 2, 'Expected find to stop after the first match')
		Assert.equal(seen[0], 1, 'Expected the first message to be seen')
		Assert.equal(seen[1], 2, 'Expected the second message to be seen')

		sched.__tick()
		Assert.equal(
			seen.size(),
			2,
			'Expected the remaining message to be consumed',
		)
	}

	@Test
	query_on_find_withNoMatch_consumesAllMessages() {
		const sched = scheduler()
		const Fired = component<number>('Fired')
		const seen: number[] = []
		let found: unknown = 'unset'

		sched.useSystem('update', () => {
			found = query()
				.on(Fired)
				.find((_msg, value) => {
					seen.push(value)
					return false
				})
		})

		message().set(Fired, 1).emit()
		message().set(Fired, 2).emit()
		sched.__tick()

		Assert.equal(found, undefined, 'Expected find to return undefined')
		Assert.equal(seen.size(), 2, 'Expected find to visit every message')

		sched.__tick()
		Assert.equal(seen.size(), 2, 'Expected all messages to be consumed')
	}

	@Test
	query_on_find_withBaseQuery_stopsAtFirstEntityMessagePair() {
		const sched = scheduler()
		const Health = component<number>('Health')
		const Damaged = component<number>('Damaged')
		entity('Alice').set(Health, 100)
		entity('Bob').set(Health, 50)
		const seen: [Handle, number][] = []

		sched.useSystem('update', () => {
			query(Health)
				.on(Damaged)
				.find((e, _health, _msg, damage) => {
					seen.push([e, damage])
					return true
				})
		})

		message().set(Damaged, 10).emit()
		message().set(Damaged, 20).emit()
		sched.__tick()

		Assert.equal(seen.size(), 1, 'Expected find to stop at the first pair')
		Assert.equal(seen[0][1], 10, 'Expected the first message to be matched')

		sched.__tick()
		Assert.equal(seen.size(), 1, 'Expected the second message to be consumed')
	}

	@Test
	message_emittedInFrame_isReadByLaterSystemInSameFrame() {
		const sched = scheduler()
		const Fired = component<number>('Fired')
		const seen: number[] = []

		function emit() {
			message().set(Fired, 1).emit()
		}

		function read() {
			query()
				.on(Fired)
				.forEach((_msg, value) => seen.push(value))
		}

		sched.useSystemChain('update', [emit, read])
		sched.__tick()

		Assert.equal(
			seen.size(),
			1,
			'Expected the later system to read the message',
		)
		Assert.equal(seen[0], 1, 'Expected the message value to be 1')
	}

	@Test
	message_emittedInFrame_isReadByEarlierSystemNextFrame() {
		const sched = scheduler()
		const Fired = component<number>('Fired')
		const seen: number[] = []
		let emitted = false

		function read() {
			query()
				.on(Fired)
				.forEach((_msg, value) => seen.push(value))
		}

		function emit() {
			if (emitted) return
			emitted = true
			message().set(Fired, 1).emit()
		}

		sched.useSystemChain('update', [read, emit])
		sched.__tick()

		Assert.equal(seen.size(), 0, 'Expected no message in the first frame')

		sched.__tick()
		Assert.equal(
			seen.size(),
			1,
			'Expected the earlier system to read it next frame',
		)
		Assert.equal(seen[0], 1, 'Expected the message value to be 1')
	}

	@Test
	message_isNotReadAfterTwoFrames() {
		const sched = scheduler()
		const Fired = component<number>('Fired')
		const seen: number[] = []
		let emitted = false

		function read() {
			query()
				.on(Fired)
				.forEach((_msg, value) => seen.push(value))
		}

		function emit() {
			if (emitted) return
			emitted = true
			message().set(Fired, 1).emit()
		}

		sched.useSystemChain('update', [read, emit])

		sched.__tick()
		Assert.equal(seen.size(), 0, 'Expected no message in the first frame')

		sched.__tick()
		Assert.equal(
			seen.size(),
			1,
			'Expected the message to be read in the second frame',
		)

		sched.__tick()
		Assert.equal(
			seen.size(),
			1,
			'Expected the message not to be read in the third frame',
		)
	}

	@Test
	message_entity_isDespawnedAfterTwoFrames() {
		const sched = scheduler()
		const Fired = component<number>('Fired')
		let messageEntity: Handle | undefined
		let emitted = false

		function emit() {
			if (emitted) return
			emitted = true
			message().set(Fired, 1).emit()
		}

		function read() {
			query()
				.on(Fired)
				.forEach((msg) => {
					messageEntity = msg
				})
		}

		sched.useSystemChain('update', [emit, read])

		sched.__tick()
		Assert.true(messageEntity !== undefined, 'Expected the message to be read')
		Assert.true(
			messageEntity!.exists(),
			'Expected the message to exist in frame 1',
		)

		sched.__tick()
		Assert.true(
			messageEntity!.exists(),
			'Expected the message to exist in frame 2',
		)

		sched.__tick()
		Assert.false(
			messageEntity!.exists(),
			'Expected the message to be despawned in frame 3',
		)
	}

	@Test
	message_emittedOutsideSystem_isReadInNextTick() {
		const sched = scheduler()
		const Fired = component<number>('Fired')
		const seen: number[] = []

		sched.useSystem('update', () => {
			query()
				.on(Fired)
				.forEach((_msg, value) => seen.push(value))
		})

		message().set(Fired, 1).emit()
		sched.__tick()

		Assert.equal(
			seen.size(),
			1,
			'Expected the message to be read in the next tick',
		)
		Assert.equal(seen[0], 1, 'Expected the message value to be 1')

		sched.__tick()
		Assert.equal(seen.size(), 1, 'Expected the message not to be read again')
	}

	@Test
	message_cleanup_deletesOnlyStaleMessages() {
		const sched = scheduler()
		const Fired = component<number>('Fired')
		const seen: number[] = []
		let frame = 0

		function read() {
			query()
				.on(Fired)
				.forEach((_msg, value) => seen.push(value))
		}

		function emit() {
			frame++
			if (frame === 1) {
				message().set(Fired, 1).emit()
			} else if (frame === 2) {
				message().set(Fired, 2).emit()
			}
		}

		sched.useSystemChain('update', [read, emit])

		sched.__tick()
		sched.__tick()
		sched.__tick()

		Assert.equal(seen.size(), 2, 'Expected the reader to see A then B')
		Assert.equal(seen[0], 1, 'Expected the first message to be A')
		Assert.equal(seen[1], 2, 'Expected the second message to be B')
	}

	@Test
	message_emittedInStartup_isReadInFirstUpdateFrame() {
		const sched = scheduler()
		const Fired = component<number>('Fired')
		const seen: number[] = []
		let emitted = false

		sched.useSystem('startup', () => {
			if (emitted) return
			emitted = true
			message().set(Fired, 1).emit()
		})
		sched.useSystem('update', () => {
			query()
				.on(Fired)
				.forEach((_msg, value) => seen.push(value))
		})

		sched.__runSchedule('startup')
		sched.__tick()

		Assert.equal(
			seen.size(),
			1,
			'Expected the message to be read in the first update frame',
		)
		Assert.equal(seen[0], 1, 'Expected the message value to be 1')

		sched.__tick()
		Assert.equal(seen.size(), 1, 'Expected the message not to be read again')
	}

	@Test
	message_isNotMatchedByPlainQuery() {
		const Fired = component<number>('Fired')

		message().set(Fired, 1).emit()

		Assert.equal(
			query(Fired).collect().size(),
			0,
			'Expected a plain query not to match message entities',
		)
	}

	@Test
	message_isNotMatchedByWildcardQuery() {
		const Fired = component<number>('Fired')

		message().set(Fired, 1).emit()

		const results = query(Builtin.Wildcard).collect()
		Assert.true(
			results.find(([e]) => e.has(Builtin.MessageSequence)) === undefined,
			'Expected a wildcard query not to match message entities',
		)
	}

	@Test
	message_isNotMatchedByOnAdded() {
		const Fired = component<number>('Fired')
		const added: Handle[] = []
		const unsubscribe = query().onAdded(Fired, (e) => {
			added.push(e)
		})

		const alice = entity('Alice')
		alice.set(Fired, 1)
		message().set(Fired, 2).emit()
		unsubscribe()

		Assert.equal(
			added.size(),
			1,
			'Expected onAdded to fire only for the plain entity',
		)
		Assert.equal(added[0], alice, 'Expected onAdded to fire for Alice')
	}

	@Test
	message_isNotMatchedByOnChanged() {
		const sched = scheduler()
		const Fired = component<number>('Fired')
		const changed: Handle[] = []
		const unsubscribe = query().onChanged(Fired, (e) => {
			changed.push(e)
		})

		const alice = entity('Alice').set(Fired, 1)
		alice.set(Fired, 2)

		sched.useSystem('update', () => {
			query()
				.on(Fired)
				.forEach((msg) => {
					msg.set(Fired, 3)
				})
		})

		message().set(Fired, 10).emit()
		sched.__tick()
		unsubscribe()

		Assert.equal(
			changed.size(),
			1,
			'Expected onChanged to fire only for the plain entity',
		)
		Assert.equal(changed[0], alice, 'Expected onChanged to fire for Alice')
	}

	@Test
	message_isNotMatchedByOnRemoved() {
		const sched = scheduler()
		const Fired = component<number>('Fired')
		const removed: Handle[] = []
		const unsubscribe = query().onRemoved(Fired, (e) => {
			removed.push(e)
		})

		message().set(Fired, 1).emit()
		sched.__tick()
		sched.__tick()
		sched.__tick()
		unsubscribe()

		Assert.equal(
			removed.size(),
			0,
			'Expected onRemoved not to fire for message cleanup',
		)
	}

	@Test
	query_on_calledTwice_throws() {
		const A = component<number>('A')
		const B = component<number>('B')

		Assert.throws(
			() => {
				const q = query()
				q.on(A)
				q.on(B)
			},
			undefined,
			'Expected calling on() twice to throw',
		)
	}

	@Test
	query_on_calledOutsideSystem_doesNotThrow() {
		const Fired = component<number>('Fired')
		const q = query().on(Fired)
		Assert.true(
			q !== undefined,
			'Expected on() to be callable outside a system',
		)
	}

	@Test
	query_on_iteratedOutsideSystem_throws() {
		const Fired = component<number>('Fired')

		Assert.throws(
			() =>
				query()
					.on(Fired)
					.forEach(() => {}),
			undefined,
			'Expected iterating a message query outside a system to throw',
		)
	}

	@Test
	query_on_collect_returnsAllMessagesInOrder() {
		const sched = scheduler()
		const Fired = component<number>('Fired')
		const seen: [Handle, number][] = []

		sched.useSystem('update', () => {
			query()
				.on(Fired)
				.collect()
				.forEach(([msg, value]) => {
					seen.push([msg, value])
				})
		})

		message().set(Fired, 1).emit()
		message().set(Fired, 2).emit()
		message().set(Fired, 3).emit()
		sched.__tick()

		Assert.equal(seen.size(), 3, 'Expected collect to return all messages')
		Assert.equal(seen[0][1], 1, 'Expected the first message value to be 1')
		Assert.equal(seen[1][1], 2, 'Expected the second message value to be 2')
		Assert.equal(seen[2][1], 3, 'Expected the third message value to be 3')
	}

	@Test
	query_on_bind_readsMessagesWhenScheduled() {
		const sched = scheduler()
		const Fired = component<number>('Fired')
		const seen: number[] = []
		const bound = query()
			.on(Fired)
			.bind((_msg, value) => {
				seen.push(value)
			})

		sched.useSystem('update', bound)
		message().set(Fired, 1).emit()
		sched.__tick()

		Assert.equal(
			seen.size(),
			1,
			'Expected the bound system to read the message',
		)
		Assert.equal(seen[0], 1, 'Expected the message value to be 1')
	}

	@Test
	query_on_bind_withBaseQuery_pairsEntitiesAndMessages() {
		const sched = scheduler()
		const Health = component<number>('Health')
		const Damaged = component<number>('Damaged')
		const alice = entity('Alice').set(Health, 100)
		const seen: [Handle, number, Handle, number][] = []
		const bound = query(Health)
			.on(Damaged)
			.bind((e, health, msg, damage) => {
				seen.push([e, health, msg, damage])
			})

		sched.useSystem('update', bound)
		message().set(Damaged, 10).emit()
		sched.__tick()

		Assert.equal(
			seen.size(),
			1,
			'Expected the bound system to pair the entity and message',
		)
		Assert.equal(seen[0][0], alice, 'Expected the base entity to be Alice')
		Assert.equal(seen[0][1], 100, 'Expected the base entity health to be 100')
		Assert.true(seen[0][2].exists(), 'Expected the message entity to exist')
		Assert.equal(seen[0][3], 10, 'Expected the message damage to be 10')
	}

	@Test
	query_on_withEightTerms_receivesAllValues() {
		const sched = scheduler()
		const C1 = component<number>('C1')
		const C2 = component<number>('C2')
		const C3 = component<number>('C3')
		const C4 = component<number>('C4')
		const C5 = component<number>('C5')
		const C6 = component<number>('C6')
		const C7 = component<number>('C7')
		const C8 = component<number>('C8')
		let seen: number[] = []

		sched.useSystem('update', () => {
			query()
				.on(C1, C2, C3, C4, C5, C6, C7, C8)
				.forEach((_msg, v1, v2, v3, v4, v5, v6, v7, v8) => {
					seen = [v1, v2, v3, v4, v5, v6, v7, v8]
				})
		})

		message()
			.set(C1, 1)
			.set(C2, 2)
			.set(C3, 3)
			.set(C4, 4)
			.set(C5, 5)
			.set(C6, 6)
			.set(C7, 7)
			.set(C8, 8)
			.emit()
		sched.__tick()

		Assert.equal(seen.size(), 8, 'Expected all eight values to be received')
		for (let i = 0; i < 8; i++) {
			Assert.equal(seen[i], i + 1, `Expected value ${i + 1} at index ${i}`)
		}
	}

	@Test
	query_on_messageSequence_readsAllMessages() {
		const sched = scheduler()
		const Fired = component<number>('Fired')
		const seen: number[] = []

		sched.useSystem('update', () => {
			query()
				.on(Builtin.MessageSequence)
				.forEach((_msg, sequence) => {
					seen.push(sequence)
				})
		})

		message().set(Fired, 1).emit()
		message().set(Fired, 2).emit()
		message().set(Fired, 3).emit()
		sched.__tick()

		Assert.equal(
			seen.size(),
			3,
			'Expected MessageSequence to read all messages',
		)
		Assert.true(
			seen[0] < seen[1] && seen[1] < seen[2],
			'Expected message sequences to increase',
		)
	}
}

export = MessageTests
