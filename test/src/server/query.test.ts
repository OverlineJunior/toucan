import { Assert, BeforeEach, Test } from '@rbxts/lunit'
import { component, entity, pair, query } from '@rbxts/toucan'
import { clearWorld } from './helpers'

class QueryTests {
	@BeforeEach
	public reset() {
		clearWorld()
	}

	@Test
	public query_matchesEntitiesWithRequiredComponent() {
		const Health = component<number>('Health')
		const alice = entity('Alice').set(Health, 100)
		entity('Bob')

		const results = query(Health).collect()
		Assert.equal(
			results.size(),
			1,
			'Expected exactly 1 entity to match the Health query',
		)
		Assert.equal(
			results[0][0],
			alice,
			'Expected the matched entity to be Alice',
		)
		Assert.equal(
			results[0][1],
			100,
			'Expected the Health component value to be 100',
		)
	}

	@Test
	public with_includesOnlyEntitiesThatAlsoHaveExtraComponent() {
		const Health = component<number>('Health')
		const Stamina = component<number>('Stamina')
		const alice = entity('Alice').set(Health, 100).set(Stamina, 50)
		entity('Bob').set(Health, 100)

		const results = query(Health).with(Stamina).collect()
		Assert.equal(
			results.size(),
			1,
			'Expected exactly 1 entity to match Health with Stamina',
		)
		Assert.equal(
			results[0][0],
			alice,
			'Expected the matched entity to be Alice',
		)
	}

	@Test
	public without_excludesEntitiesThatHaveExcludedComponent() {
		const Health = component<number>('Health')
		const Stunned = component('Stunned')
		entity('Alice').set(Health, 100).set(Stunned)
		const bob = entity('Bob').set(Health, 100)

		const results = query(Health).without(Stunned).collect()
		Assert.equal(
			results.size(),
			1,
			'Expected exactly 1 entity to match Health without Stunned',
		)
		Assert.equal(results[0][0], bob, 'Expected the matched entity to be Bob')
	}

	@Test
	public filter_appliesAdditionalPredicateLogic() {
		const Health = component<number>('Health')
		entity('Alice').set(Health, 5)
		const bob = entity('Bob').set(Health, 15)

		const result = query(Health)
			.filter((_, health) => health > 10)
			.find((_, health) => health > 10)

		Assert.equal(
			result?.[0],
			bob,
			'Expected Bob to be found after applying the filter',
		)
		Assert.equal(
			result?.[1],
			15,
			'Expected the filtered Health component value to be 15',
		)
	}

	@Test
	public find_returnsUndefinedWhenNoEntityMatches() {
		const Health = component<number>('Health')
		entity('Alice').set(Health, 1)

		const result = query(Health).find((_, health) => health > 10)
		Assert.equal(
			result,
			undefined,
			'Expected find to return undefined when no entities match the criteria',
		)
	}

	@Test
	public map_returnsTransformedValues() {
		const Health = component<number>('Health')
		entity('Alice').set(Health, 10)
		entity('Bob').set(Health, 20)

		const values = query(Health).map((entity, health) => ({
			id: entity.id,
			health,
		}))
		Assert.equal(
			values.size(),
			2,
			'Expected map to return exactly 2 transformed values',
		)
		Assert.true(
			values.find((value) => value.health === 10) !== undefined,
			"Expected mapped values to include Alice's health",
		)
		Assert.true(
			values.find((value) => value.health === 20) !== undefined,
			"Expected mapped values to include Bob's health",
		)
	}

	@Test
	public bind_executesMatchedEntities() {
		const Health = component<number>('Health')
		entity('Alice').set(Health, 42)

		let called = false
		const system = query(Health).bind((_, health) => {
			called = true
			Assert.equal(
				health,
				42,
				'Expected the bound system to receive the correct component value',
			)
		})

		system()
		Assert.true(called, 'Expected the bound system callback to be executed')
	}

	@Test
	public pair_matchesAndReturnsPairValue() {
		const Owns = component<number>('Owns')
		const car = entity('Car')
		const alice = entity('Alice').set(pair(Owns, car), 2)

		const result = query(pair(Owns, car)).find((_e, amount) => amount === 2)

		Assert.equal(
			result?.[0],
			alice,
			'Expected Alice to be found matching the pair query',
		)
		Assert.equal(result?.[1], 2, 'Expected the pair value to be 2')
	}

	@Test
	public withAnyAndWithoutAny_workTogether() {
		const Health = component<number>('Health')
		const Stamina = component<number>('Stamina')
		const Poisoned = component('Poisoned')
		entity('Alice').set(Health, 5).set(Poisoned)
		const bob = entity('Bob').set(Health, 5).set(Stamina, 10)

		const results = query(Health)
			.withAny(Stamina, Poisoned)
			.withoutAny(Poisoned)
			.collect()

		Assert.equal(
			results.size(),
			1,
			'Expected exactly 1 entity to match the withAny and withoutAny query',
		)
		Assert.equal(results[0][0], bob, 'Expected Bob to match the complex query')
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

		Assert.equal(count, 2, 'Expected forEach to iterate exactly 2 times')
		Assert.equal(sum, 20, 'Expected the sum of iterated health values to be 20')
	}

	@Test
	public reduce_accumulatesValues() {
		const Score = component<number>('Score')
		entity('Player1').set(Score, 1)
		entity('Player2').set(Score, 2)
		entity('Player3').set(Score, 3)

		const total = query(Score).reduce((acc, _, score) => acc + score, 0)

		Assert.equal(
			total,
			6,
			'Expected reduce to accumulate the scores to a total of 6',
		)
	}
}

export = QueryTests
