import { Assert, BeforeEach, Test } from '@rbxts/lunit'
import { Builtin, component, entity, pair, query } from '@rbxts/toucan'
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

	@Test
	public queryHidden_doesNotShowUpInQuery() {
		const Marker = component('Marker')
		const Hidden = component('Hidden').set(Builtin.QueryHidden)
		const entt = entity().set(Marker).set(Hidden)

		const regular = query(Marker).collect()
		const allowed = query(Marker).show(Hidden).collect()

		Assert.equal(
			regular.size(),
			0,
			'Expected regular query to skip over entities with Hidden',
		)
		Assert.equal(
			allowed.size(),
			1,
			'Expected allowed query to contain a single entity',
		)
		Assert.true(
			allowed[0][0] === entt,
			"Expected allowed query's entity to be the spawned entity",
		)
	}

	@Test
	public queryHidden_onRemovedUnhidesComponent() {
		const Marker = component('Marker')
		const Hidden = component('Hidden').set(Builtin.QueryHidden)
		const entt = entity().set(Marker).set(Hidden)

		Assert.equal(
			query(Marker).collect().size(),
			0,
			'Expected the entity to be hidden while QueryHidden is set on its component',
		)

		Builtin.QueryHidden.remove(Builtin.Persistent)
		Hidden.remove(Builtin.QueryHidden)
		Builtin.QueryHidden.set(Builtin.Persistent)

		const results = query(Marker).collect()
		Assert.equal(
			results.size(),
			1,
			'Expected the entity to show up after QueryHidden is removed from its component',
		)
		Assert.equal(
			results[0][0],
			entt,
			'Expected the previously hidden entity to be the one that shows up',
		)
	}

	@Test
	public queryHidden_requiresShowingEveryHiddenComponent() {
		const Marker = component('Marker')
		const HiddenA = component('HiddenA').set(Builtin.QueryHidden)
		const HiddenB = component('HiddenB').set(Builtin.QueryHidden)
		const entt = entity().set(Marker).set(HiddenA).set(HiddenB)

		Assert.equal(
			query(Marker).collect().size(),
			0,
			'Expected an entity with two hidden components to be excluded by default',
		)
		Assert.equal(
			query(Marker).show(HiddenA).collect().size(),
			0,
			'Expected showing only one hidden component to still exclude the entity',
		)
		Assert.equal(
			query(Marker).show(HiddenB).collect().size(),
			0,
			'Expected showing only the other hidden component to still exclude the entity',
		)

		const results = query(Marker).show(HiddenA, HiddenB).collect()
		Assert.equal(
			results.size(),
			1,
			'Expected showing every hidden component to include the entity',
		)
		Assert.equal(
			results[0][0],
			entt,
			'Expected the included entity to be the one with both hidden components',
		)
	}

	@Test
	public queryHidden_showAllIncludesHiddenEntities() {
		const Marker = component('Marker')
		const HiddenA = component('HiddenA').set(Builtin.QueryHidden)
		const HiddenB = component('HiddenB').set(Builtin.QueryHidden)
		const entt = entity().set(Marker).set(HiddenA).set(HiddenB)

		const results = query(Marker).showAll().collect()
		Assert.equal(
			results.size(),
			1,
			'Expected showAll to include entities with hidden components',
		)
		Assert.equal(
			results[0][0],
			entt,
			'Expected showAll to include the entity with both hidden components',
		)
	}

	@Test
	public queryHidden_requiredComponentIsImplicitlyShown() {
		const Hidden = component('Hidden').set(Builtin.QueryHidden)
		const entt = entity().set(Hidden)

		const results = query(Hidden).collect()
		Assert.equal(
			results.size(),
			1,
			'Expected requiring a hidden component to implicitly show it',
		)
		Assert.equal(
			results[0][0],
			entt,
			'Expected the entity with the required hidden component to match',
		)
	}

	@Test
	public queryHidden_withAndWithAnyImplicitlyShowComponent() {
		const Marker = component('Marker')
		const Hidden = component('Hidden').set(Builtin.QueryHidden)
		const entt = entity().set(Marker).set(Hidden)

		const withResults = query(Marker).with(Hidden).collect()
		Assert.equal(
			withResults.size(),
			1,
			'Expected with to implicitly show the hidden component',
		)
		Assert.equal(
			withResults[0][0],
			entt,
			'Expected the entity with the with-hidden component to match',
		)

		const withAnyResults = query(Marker).withAny(Hidden).collect()
		Assert.equal(
			withAnyResults.size(),
			1,
			'Expected withAny to implicitly show the hidden component',
		)
		Assert.equal(
			withAnyResults[0][0],
			entt,
			'Expected the entity with the withAny-hidden component to match',
		)
	}

	@Test
	public queryHidden_markingComponentHidesExistingEntities() {
		const Marker = component('Marker')
		const Hidden = component('Hidden')
		const entt = entity().set(Marker).set(Hidden)

		const visible = query(Marker).collect()
		Assert.equal(
			visible.size(),
			1,
			'Expected the entity to be visible before its component is marked as hidden',
		)
		Assert.equal(
			visible[0][0],
			entt,
			'Expected the visible entity to be the one with the unmarked component',
		)

		Hidden.set(Builtin.QueryHidden)

		Assert.equal(
			query(Marker).collect().size(),
			0,
			'Expected the entity to be hidden after its component is marked as hidden',
		)
	}
}

export = QueryTests
