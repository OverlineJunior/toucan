import { Assert, BeforeEach, Test } from '@rbxts/lunit'
import {
	entity,
	pair,
	ChildOf,
	resolveId,
	query,
	Wildcard,
	Internal,
	External,
	Label,
	component,
	resource,
	Component,
	Resource,
	RawId,
} from '@rbxts/toucan'

class EntityTests {
	@BeforeEach
	public reset() {
		query(Wildcard)
			.filter((e) => !e.has(Internal) && !e.has(External))
			.collect() // We collect due to iterator invalidation; see issue #2.
			.forEach(([e]) => e.despawn())
	}

	@Test
	public entity_createsSuccessfully() {
		const e = entity()
		Assert.true(e.exists())
	}

	@Test
	public entity_withLabel_setsToString() {
		const label = 'TestEntity'
		const e = entity(label)
		Assert.equal(e.toString(), label)
		Assert.true(e.exists())
	}

	@Test
	public despawn_removesEntity() {
		const e = entity()
		Assert.true(e.exists())
		e.despawn()
		Assert.false(e.exists())
	}

	@Test
	public parent_returnsAssignedParent() {
		const parent = entity('Parent')
		const child = entity('Child').set(pair(ChildOf, parent))
		Assert.equal(child.parent(), parent)
		Assert.equal(child.targetOf(ChildOf), parent)
	}

	@Test
	public children_returnsAssignedChildEntity() {
		const parent = entity('Parent')
		const child = entity('Child').set(pair(ChildOf, parent))

		const children = parent.children()
		Assert.equal(children.size(), 1)
		Assert.equal(children[0], child)
	}

	@Test
	public relationships_includesAssignedChildOfPair() {
		const parent = entity('Parent')
		const child = entity('Child').set(pair(ChildOf, parent))

		const relationships = child.relationships()
		Assert.equal(relationships.size(), 1)
		Assert.equal(relationships[0].relation, ChildOf)
		Assert.equal(relationships[0].target, parent)
	}

	@Test
	public resolveId_returnsCorrectEntity() {
		const e = entity('Test')
		const resolved = resolveId(e.id)
		Assert.equal(resolved, e)
		Assert.true(resolved?.exists())
	}

	@Test
	public remove_deletesComponent() {
		const C = component()
		const e = entity().set(C)
		Assert.true(e.has(C))
		e.remove(C)
		Assert.false(e.has(C))
	}

	@Test
	public remove_throwsErrorWhenComponentIsPersistent() {
		const e = entity()
		Assert.true(e.has(Label))
		Assert.throws(() => e.remove(Label))
	}

	@Test
	public clear_removesAllComponents() {
		const C1 = component()
		const C2 = component()
		const e = entity().set(C1).set(C2)
		Assert.true(e.has(C1) && e.has(C2))
		e.clear()
		Assert.false(e.has(C1) || e.has(C2))
	}

	@Test
	public clear_doesNotRemovePersistentComponents() {
		const e = entity()
		Assert.true(e.has(Label))
		e.clear()
		Assert.true(e.has(Label))
	}

	@Test
	public components_returnsOnlyAssignedComponents() {
		const e = entity()
		const comps = e.components()
		Assert.equal(comps.size(), 1)
		Assert.equal(comps[0], Label)
	}

	@Test
	public component_createsSuccessfully() {
		const C = component('TestComponent')
		Assert.true(C.exists())
		Assert.equal(C.toString(), 'TestComponent')
		Assert.true(C.has(Component))
	}

	@Test
	public get_returnsSetValueForComponent() {
		const Health = component<number>('Health')
		const e = entity().set(Health, 100)
		const value = e.get(Health)
		Assert.equal(value, 100)
	}

	@Test
	public set_updatesExistingComponentValue() {
		const Health = component<number>()
		const e = entity().set(Health, 100)
		e.set(Health, 50)
		Assert.equal(e.get(Health), 50)
	}

	@Test
	public get_returnsMultipleComponentValues() {
		const Health = component<number>()
		const Stamina = component<number>()
		const e = entity().set(Health, 100).set(Stamina, 50)
		const [h, s] = e.get(Health, Stamina)
		Assert.equal(h, 100)
		Assert.equal(s, 50)
	}

	@Test
	public get_returnsUndefinedForMissingComponents() {
		const Health = component<number>()
		const Stamina = component<number>()
		const e = entity().set(Health, 100)
		const [h, s] = e.get(Health, Stamina)
		Assert.equal(h, 100)
		Assert.equal(s, undefined)
	}

	@Test
	public has_returnsTrueOnlyIfAllComponentsExist() {
		const C1 = component()
		const C2 = component()
		const C3 = component()
		const e = entity().set(C1).set(C2)
		Assert.true(e.has(C1, C2))
		Assert.false(e.has(C1, C3))
	}

	@Test
	public get_returnsSetValueForPair() {
		const Owns = component<number>()
		const car = entity('Car')
		const alice = entity('Alice').set(pair(Owns, car), 5)
		Assert.true(alice.has(pair(Owns, car)))
		const value = alice.get(pair(Owns, car))
		Assert.equal(value, 5)
	}

	@Test
	public has_returnsTrueForMultiplePairsWithSameRelation() {
		const Likes = component()
		const bob = entity('Bob')
		const charlie = entity('Charlie')
		const alice = entity('Alice').set(pair(Likes, bob)).set(pair(Likes, charlie))
		Assert.equal(alice.targetsOf(Likes).size(), 2)
		Assert.true(alice.has(pair(Likes, bob)))
		Assert.true(alice.has(pair(Likes, charlie)))
	}

	@Test
	public targetOf_returnsCorrectTargetForIndex() {
		const Likes = component()
		const bob = entity('Bob')
		const charlie = entity('Charlie')
		const alice = entity('Alice').set(pair(Likes, bob)).set(pair(Likes, charlie))

		const target1 = alice.targetOf(Likes, 0)
		const target2 = alice.targetOf(Likes, 1)

		Assert.true(target1 !== undefined)
		Assert.true(target2 !== undefined)

		const targets = [target1!, target2!]
		Assert.true(targets.includes(bob))
		Assert.true(targets.includes(charlie))
	}

	@Test
	public targetOf_returnsUndefinedForOutOfBoundsIndex() {
		const Likes = component()
		const bob = entity('Bob')
		const alice = entity('Alice').set(pair(Likes, bob))
		const target = alice.targetOf(Likes, 5)
		Assert.equal(target, undefined)
	}

	@Test
	public parent_returnsUndefinedWhenNoParentAssigned() {
		const e = entity()
		const parent = e.parent()
		Assert.equal(parent, undefined)
	}

	@Test
	public resolveId_returnsUndefinedForInvalidId() {
		const resolved = resolveId(999999 as RawId)
		Assert.equal(resolved, undefined)
	}

	@Test
	public children_returnsAllAssignedChildEntities() {
		const parent = entity('Parent')
		const child1 = entity('Child1').set(pair(ChildOf, parent))
		const child2 = entity('Child2').set(pair(ChildOf, parent))
		const children = parent.children()
		Assert.equal(children.size(), 2)
		Assert.true(children.find((c) => c === child1) !== undefined)
		Assert.true(children.find((c) => c === child2) !== undefined)
	}

	@Test
	public resource_createsSuccessfully() {
		const GameState = resource('lobby', 'GameState')
		Assert.true(GameState.exists())
		Assert.equal(GameState.toString(), 'GameState')
		Assert.true(GameState.has(Resource))
	}

	@Test
	public read_returnsCurrentResourceValue() {
		const GameState = resource('lobby', 'GameState')
		const value = GameState.read()
		Assert.equal(value, 'lobby')
	}

	@Test
	public write_updatesResourceValue() {
		const GameState = resource('lobby', 'GameState')
		GameState.write('in-game')
		Assert.equal(GameState.read(), 'in-game')
	}

	@Test
	public resource_generatesFallbackLabelWhenOmitted() {
		const GameState = resource('test')
		Assert.true(GameState.exists())
		Assert.equal(GameState.toString(), `Resource #${GameState.id}`)
	}

	@Test
	public changed_firesCallbackWhenResourceIsWritten() {
		const GameState = resource('lobby', 'GameState')
		let called = false
		let newValue: string | undefined

		const unsubscribe = GameState.changed((v) => {
			called = true
			newValue = v
		})

		GameState.write('in-game')
		Assert.true(called)
		Assert.equal(newValue, 'in-game')

		unsubscribe()
	}

	@Test
	public relationships_returnsAllAssignedPairs() {
		const Likes = component()
		const Hates = component()
		const bob = entity('Bob')
		const charlie = entity('Charlie')
		const alice = entity('Alice').set(pair(Likes, bob)).set(pair(Likes, charlie)).set(pair(Hates, bob))

		const rels = alice.relationships()
		Assert.equal(rels.size(), 3)

		const likes = rels.filter((r) => r.relation === Likes)
		const hates = rels.filter((r) => r.relation === Hates)
		Assert.equal(likes.size(), 2)
		Assert.equal(hates.size(), 1)
	}

	@Test
	public components_excludesRelationships() {
		const Likes = component()
		const bob = entity('Bob')
		const alice = entity('Alice').set(pair(Likes, bob))

		const comps = alice.components()
		Assert.equal(comps.size(), 1)
		Assert.equal(comps[0], Label)
	}

	@Test
	public set_supportsMethodChaining() {
		const C1 = component()
		const C2 = component()
		const C3 = component()
		const e = entity().set(C1).set(C2).set(C3)
		Assert.true(e.has(C1, C2, C3))
	}

	@Test
	public set_allowsSettingTagComponentMultipleTimes() {
		const Active = component()
		const e = entity()
		e.set(Active)
		e.set(Active)
		Assert.true(e.has(Active))
	}

	@Test
	public clear_doesNothingWhenNoComponentsExist() {
		const e = entity()
		const before = e.components().size()
		e.clear()
		const after = e.components().size()
		Assert.equal(before, after)
		Assert.true(e.has(Label))
	}

	@Test
	public get_returnsCorrectValuesForDifferentPairs() {
		const Owns = component<number>()
		const car = entity()
		const house = entity()
		const alice = entity().set(pair(Owns, car), 1).set(pair(Owns, house), 2)

		Assert.equal(alice.get(pair(Owns, car)), 1)
		Assert.equal(alice.get(pair(Owns, house)), 2)
	}
}

export = EntityTests
