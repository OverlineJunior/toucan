import { Assert, BeforeEach, Test } from '@rbxts/lunit'
import { entity, component, pair, query, Wildcard, Internal, External, Label } from '@rbxts/toucan'

class QueryTests {
	@BeforeEach
	public reset() {
		query(Wildcard)
			.filter((e) => !e.has(Internal) && !e.has(External))
			.collect() // We collect due to iterator invalidation; see issue #2.
			.forEach(([e]) => e.despawn())
	}

	@Test
	public query_matchesEntitiesWithRequiredComponent() {
		const Health = component<number>('Health')
		const alice = entity('Alice').set(Health, 100)
		entity('Bob')

		const results = query(Health).collect()
		Assert.equal(results.size(), 1)
		Assert.equal(results[0][0], alice)
		Assert.equal(results[0][1], 100)
	}

	@Test
	public with_includesOnlyEntitiesThatAlsoHaveExtraComponent() {
		const Health = component<number>('Health')
		const Stamina = component<number>('Stamina')
		const alice = entity('Alice').set(Health, 100).set(Stamina, 50)
		entity('Bob').set(Health, 100)

		const results = query(Health).with(Stamina).collect()
		Assert.equal(results.size(), 1)
		Assert.equal(results[0][0], alice)
	}

	@Test
	public without_excludesEntitiesThatHaveExcludedComponent() {
		const Health = component<number>('Health')
		const Stunned = component('Stunned')
		entity('Alice').set(Health, 100).set(Stunned)
		const bob = entity('Bob').set(Health, 100)

		const results = query(Health).without(Stunned).collect()
		Assert.equal(results.size(), 1)
		Assert.equal(results[0][0], bob)
	}

	@Test
	public filter_appliesAdditionalPredicateLogic() {
		const Health = component<number>('Health')
		entity('Alice').set(Health, 5)
		const bob = entity('Bob').set(Health, 15)

		const result = query(Health)
			.filter((_, health) => health > 10)
			.find((_, health) => health > 10)

		Assert.equal(result?.[0], bob)
		Assert.equal(result?.[1], 15)
	}

	@Test
	public find_returnsUndefinedWhenNoEntityMatches() {
		const Health = component<number>('Health')
		entity('Alice').set(Health, 1)

		const result = query(Health).find((_, health) => health > 10)
		Assert.equal(result, undefined)
	}

	@Test
	public map_returnsTransformedValues() {
		const Health = component<number>('Health')
		entity('Alice').set(Health, 10)
		entity('Bob').set(Health, 20)

		const values = query(Health).map((entity, health) => ({ id: entity.id, health }))
		Assert.equal(values.size(), 2)
		Assert.true(values.find((value) => value.health === 10) !== undefined)
		Assert.true(values.find((value) => value.health === 20) !== undefined)
	}

	@Test
	public bind_executesMatchedEntities() {
		const Health = component<number>('Health')
		entity('Alice').set(Health, 42)

		let called = false
		const system = query(Health).bind((_, health) => {
			called = true
			Assert.equal(health, 42)
		})

		system()
		Assert.true(called)
	}

	@Test
	public pair_matchesAndReturnsPairValue() {
		const Owns = component<number>('Owns')
		const car = entity('Car')
		const alice = entity('Alice').set(pair(Owns, car), 2)

		const result = query(pair(Owns, car)).find((entity, amount) => amount === 2)

		Assert.equal(result?.[0], alice)
		Assert.equal(result?.[1], 2)
	}

	@Test
	public withAnyAndWithoutAny_workTogether() {
		const Health = component<number>('Health')
		const Stamina = component<number>('Stamina')
		const Poisoned = component('Poisoned')
		entity('Alice').set(Health, 5).set(Poisoned)
		const bob = entity('Bob').set(Health, 5).set(Stamina, 10)

		const results = query(Health).withAny(Stamina, Poisoned).withoutAny(Poisoned).collect()

		Assert.equal(results.size(), 1)
		Assert.equal(results[0][0], bob)
	}

	@Test
	public forEach_iteratesMatchedEntities() {
		const Health = component<number>('Health')
		entity('Alice').set(Health, 5)
		entity('Bob').set(Health, 15)

		let sum = 0
		let count = 0

		query(Health).forEach((_, health) => {
			sum += health
			count += 1
		})

		Assert.equal(count, 2)
		Assert.equal(sum, 20)
	}

	@Test
	public reduce_accumulatesValues() {
		const Score = component<number>('Score')
		entity('Player1').set(Score, 1)
		entity('Player2').set(Score, 2)
		entity('Player3').set(Score, 3)

		const total = query(Score).reduce((acc, _, score) => acc + score, 0)

		Assert.equal(total, 6)
	}

	@Test
	public wildcard_returnsAllEntities() {
		const alice = entity('Alice')
		const bob = entity('Bob')

		const results = query(Wildcard)
			.filter((e) => !e.has(Internal) && !e.has(External))
			.collect()

		Assert.equal(results.size(), 2)
		Assert.true(results.find((entry) => entry[0] === alice) !== undefined)
		Assert.true(results.find((entry) => entry[0] === bob) !== undefined)
	}

	@Test
	public onAdded_firesWhenComponentIsAddedToMatchingEntity() {
		const Health = component<number>('Health')
		const e = entity('Alice')

		let called = false
		const unsubscribe = query(Label).onAdded(Health, (entity, label, health) => {
			called = true
			Assert.equal(entity, e)
			Assert.equal(health, 100)
		})

		e.set(Health, 100)
		unsubscribe()

		Assert.true(called)
	}

	@Test
	public onChanged_firesWhenComponentValueChanges() {
		const Health = component<number>('Health')
		const e = entity('Alice').set(Health, 10)

		let called = false
		const unsubscribe = query(Label).onChanged(Health, (entity, label, newHealth, oldHealth) => {
			called = true
			Assert.equal(entity, e)
			Assert.equal(newHealth, 20)
			Assert.equal(oldHealth, 10)
		})

		e.set(Health, 20)
		unsubscribe()

		Assert.true(called)
	}

	@Test
	public onRemoved_firesWhenComponentIsRemoved() {
		const Health = component<number>('Health')
		const e = entity('Alice').set(Health, 10)

		let called = false
		const unsubscribe = query(Label).onRemoved(Health, (entity, label, oldHealth, despawned) => {
			called = true
			Assert.equal(entity, e)
			Assert.equal(oldHealth, 10)
			Assert.equal(despawned, false)
		})

		e.remove(Health)
		unsubscribe()

		Assert.true(called)
	}
}

export = QueryTests
