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
	Persistent,
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
		Assert.true(e.exists(), 'Expected a new entity to exist')
	}

	@Test
	public entity_withLabel_setsToString() {
		const label = 'TestEntity'
		const e = entity(label)
		Assert.equal(
			e.toString(),
			label,
			'Expected entity label to match the provided string',
		)
		Assert.true(e.exists(), 'Expected labeled entity to exist')
	}

	@Test
	public despawn_removesEntity() {
		const e = entity()
		Assert.true(e.exists(), 'Expected entity to exist before despawn')
		e.despawn()
		Assert.false(e.exists(), 'Expected entity to no longer exist after despawn')
	}

	@Test
	public parent_returnsAssignedParent() {
		const parent = entity('Parent')
		const child = entity('Child').set(pair(ChildOf, parent))
		Assert.equal(
			child.parent(),
			parent,
			'Expected parent() to return the entity assigned via ChildOf',
		)
		Assert.equal(
			child.targetOf(ChildOf),
			parent,
			'Expected targetOf(ChildOf) to return the parent entity',
		)
	}

	@Test
	public children_returnsAssignedChildEntity() {
		const parent = entity('Parent')
		const child = entity('Child').set(pair(ChildOf, parent))

		const children = parent.children()
		Assert.equal(
			children.size(),
			1,
			'Expected parent to have exactly one child',
		)
		Assert.equal(
			children[0],
			child,
			'Expected the child entity to match the one assigned',
		)
	}

	@Test
	public relationships_includesAssignedChildOfPair() {
		const parent = entity('Parent')
		const child = entity('Child').set(pair(ChildOf, parent))

		const relationships = child.relationships()
		Assert.equal(
			relationships.size(),
			1,
			'Expected child to have exactly one relationship',
		)
		Assert.equal(
			relationships[0].relation,
			ChildOf,
			'Expected the relationship relation to be ChildOf',
		)
		Assert.equal(
			relationships[0].target,
			parent,
			'Expected the relationship target to be the parent entity',
		)
	}

	@Test
	public resolveId_returnsCorrectEntity() {
		const e = entity('Test')
		const resolved = resolveId(e.id)
		Assert.equal(
			resolved,
			e,
			'Expected resolveId to return the same entity instance',
		)
		Assert.true(resolved?.exists(), 'Expected the resolved entity to exist')
	}

	@Test
	public remove_deletesComponent() {
		const C = component()
		const e = entity().set(C)
		Assert.true(
			e.has(C),
			'Expected entity to have the component after setting it',
		)
		e.remove(C)
		Assert.false(
			e.has(C),
			'Expected entity to no longer have the component after removal',
		)
	}

	@Test
	public remove_throwsErrorWhenComponentIsPersistent() {
		const e = entity()
		Assert.true(
			e.has(Label),
			'Expected entity to have persistent Label component',
		)
		Assert.throws(
			() => e.remove(Label),
			undefined,
			'Expected remove(Label) to throw because it is persistent',
		)
	}

	@Test
	public clear_removesAllComponents() {
		const C1 = component()
		const C2 = component()
		const e = entity().set(C1).set(C2)
		Assert.true(
			e.has(C1, C2),
			'Expected entity to have both components before clearing',
		)
		e.clear()
		Assert.false(
			e.has(C1) || e.has(C2),
			'Expected all non-persistent components to be removed after clear',
		)
	}

	@Test
	public clear_doesNotRemovePersistentComponents() {
		const e = entity()
		Assert.true(
			e.has(Label),
			'Expected persistent Label component to be present',
		)
		e.clear()
		Assert.true(
			e.has(Label),
			'Expected persistent Label component to remain after clear',
		)
	}

	@Test
	public components_returnsOnlyAssignedComponents() {
		const e = entity()
		const comps = e.components()
		Assert.equal(
			comps.size(),
			1,
			'Expected entity to have exactly one component (Label)',
		)
		Assert.equal(
			comps[0],
			Label,
			'Expected the only component to be the Label component',
		)
	}

	@Test
	public component_createsSuccessfully() {
		const C = component('TestComponent')
		Assert.true(C.exists(), 'Expected the component entity to exist')
		Assert.equal(
			C.toString(),
			'TestComponent',
			'Expected component name to match',
		)
		Assert.true(
			C.has(Component),
			'Expected the entity to have the internal Component tag',
		)
	}

	@Test
	public get_returnsSetValueForComponent() {
		const Health = component<number>('Health')
		const e = entity().set(Health, 100)
		const value = e.get(Health)
		Assert.equal(value, 100, 'Expected get to return the value that was set')
	}

	@Test
	public set_updatesExistingComponentValue() {
		const Health = component<number>()
		const e = entity().set(Health, 100)
		e.set(Health, 50)
		Assert.equal(
			e.get(Health),
			50,
			'Expected the component value to be updated to the new value',
		)
	}

	@Test
	public get_returnsMultipleComponentValues() {
		const Health = component<number>()
		const Stamina = component<number>()
		const e = entity().set(Health, 100).set(Stamina, 50)
		const [h, s] = e.get(Health, Stamina)
		Assert.equal(h, 100, 'Expected the first returned value to match Health')
		Assert.equal(s, 50, 'Expected the second returned value to match Stamina')
	}

	@Test
	public get_returnsUndefinedForMissingComponents() {
		const Health = component<number>()
		const Stamina = component<number>()
		const e = entity().set(Health, 100)
		const [h, s] = e.get(Health, Stamina)
		Assert.equal(h, 100, 'Expected defined component value to be returned')
		Assert.equal(
			s,
			undefined,
			'Expected missing component value to be undefined',
		)
	}

	@Test
	public has_returnsTrueOnlyIfAllComponentsExist() {
		const C1 = component()
		const C2 = component()
		const C3 = component()
		const e = entity().set(C1).set(C2)
		Assert.true(
			e.has(C1, C2),
			'Expected has() to be true when all components are present',
		)
		Assert.false(
			e.has(C1, C3),
			'Expected has() to be false when at least one component is missing',
		)
	}

	@Test
	public get_returnsSetValueForPair() {
		const Owns = component<number>()
		const car = entity('Car')
		const alice = entity('Alice').set(pair(Owns, car), 5)
		Assert.true(
			alice.has(pair(Owns, car)),
			'Expected entity to have the relationship pair',
		)
		const value = alice.get(pair(Owns, car))
		Assert.equal(
			value,
			5,
			'Expected relationship value to match the value that was set',
		)
	}

	@Test
	public has_returnsTrueForMultiplePairsWithSameRelation() {
		const Likes = component()
		const bob = entity('Bob')
		const charlie = entity('Charlie')
		const alice = entity('Alice')
			.set(pair(Likes, bob))
			.set(pair(Likes, charlie))
		Assert.equal(
			alice.targetsOf(Likes).size(),
			2,
			'Expected entity to have two targets for the relation',
		)
		Assert.true(
			alice.has(pair(Likes, bob)),
			'Expected entity to have a relationship with Bob',
		)
		Assert.true(
			alice.has(pair(Likes, charlie)),
			'Expected entity to have a relationship with Charlie',
		)
	}

	@Test
	public targetOf_returnsCorrectTargetForIndex() {
		const Likes = component()
		const bob = entity('Bob')
		const charlie = entity('Charlie')
		const alice = entity('Alice')
			.set(pair(Likes, bob))
			.set(pair(Likes, charlie))

		const target1 = alice.targetOf(Likes, 0)
		const target2 = alice.targetOf(Likes, 1)

		Assert.true(target1 !== undefined, 'Expected first target to be defined')
		Assert.true(target2 !== undefined, 'Expected second target to be defined')

		const targets = [target1!, target2!]
		Assert.true(targets.includes(bob), 'Expected targets to include Bob')
		Assert.true(
			targets.includes(charlie),
			'Expected targets to include Charlie',
		)
	}

	@Test
	public targetOf_returnsUndefinedForOutOfBoundsIndex() {
		const Likes = component()
		const bob = entity('Bob')
		const alice = entity('Alice').set(pair(Likes, bob))
		const target = alice.targetOf(Likes, 5)
		Assert.equal(
			target,
			undefined,
			'Expected out of bounds target index to return undefined',
		)
	}

	@Test
	public parent_returnsUndefinedWhenNoParentAssigned() {
		const e = entity()
		const parent = e.parent()
		Assert.equal(
			parent,
			undefined,
			'Expected parent() to be undefined for an orphaned entity',
		)
	}

	@Test
	public resolveId_returnsUndefinedForInvalidId() {
		const resolved = resolveId(999999 as RawId)
		Assert.equal(
			resolved,
			undefined,
			'Expected resolveId to return undefined for a non-existent ID',
		)
	}

	@Test
	public children_returnsAllAssignedChildEntities() {
		const parent = entity('Parent')
		const child1 = entity('Child1').set(pair(ChildOf, parent))
		const child2 = entity('Child2').set(pair(ChildOf, parent))
		const children = parent.children()
		Assert.equal(
			children.size(),
			2,
			'Expected parent to have exactly two children',
		)
		Assert.true(
			children.find((c) => c === child1) !== undefined,
			'Expected Child1 to be in the children list',
		)
		Assert.true(
			children.find((c) => c === child2) !== undefined,
			'Expected Child2 to be in the children list',
		)
	}

	@Test
	public resource_createsSuccessfully() {
		const GameState = resource('lobby', 'GameState')
		Assert.true(GameState.exists(), 'Expected resource entity to exist')
		Assert.equal(
			GameState.toString(),
			'GameState',
			'Expected resource name to match the label provided',
		)
		Assert.true(
			GameState.has(Resource),
			'Expected the resource entity to have the Resource tag',
		)
	}

	@Test
	public read_returnsCurrentResourceValue() {
		const GameState = resource('lobby', 'GameState')
		const value = GameState.read()
		Assert.equal(
			value,
			'lobby',
			'Expected read() to return the current resource value',
		)
	}

	@Test
	public write_updatesResourceValue() {
		const GameState = resource('lobby', 'GameState')
		GameState.write('in-game')
		Assert.equal(
			GameState.read(),
			'in-game',
			'Expected read() to return the updated resource value',
		)
	}

	@Test
	public resource_generatesFallbackLabelWhenOmitted() {
		const GameState = resource('test')
		Assert.true(
			GameState.exists(),
			'Expected resource without explicit label to exist',
		)
		Assert.equal(
			GameState.toString(),
			`Resource #${GameState.id}`,
			'Expected fallback label to use the resource ID',
		)
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
		Assert.true(
			called,
			'Expected changed callback to be fired after writing to resource',
		)
		Assert.equal(
			newValue,
			'in-game',
			'Expected callback to receive the new resource value',
		)

		unsubscribe()
	}

	@Test
	public relationships_returnsAllAssignedPairs() {
		const Likes = component()
		const Hates = component()
		const bob = entity('Bob')
		const charlie = entity('Charlie')
		const alice = entity('Alice')
			.set(pair(Likes, bob))
			.set(pair(Likes, charlie))
			.set(pair(Hates, bob))

		const rels = alice.relationships()
		Assert.equal(rels.size(), 3, 'Expected total relationship count to be 3')

		const likes = rels.filter((r) => r.relation === Likes)
		const hates = rels.filter((r) => r.relation === Hates)
		Assert.equal(likes.size(), 2, 'Expected 2 Likes relationships')
		Assert.equal(hates.size(), 1, 'Expected 1 Hates relationship')
	}

	@Test
	public components_excludesRelationships() {
		const Likes = component()
		const bob = entity('Bob')
		const alice = entity('Alice').set(pair(Likes, bob))

		const comps = alice.components()
		Assert.equal(
			comps.size(),
			1,
			'Expected components() to exclude relationships',
		)
		Assert.equal(
			comps[0],
			Label,
			'Expected the only component returned to be Label',
		)
	}

	@Test
	public set_supportsMethodChaining() {
		const C1 = component()
		const C2 = component()
		const C3 = component()
		const e = entity().set(C1).set(C2).set(C3)
		Assert.true(
			e.has(C1, C2, C3),
			'Expected entity to have all components set via method chaining',
		)
	}

	@Test
	public set_allowsSettingTagComponentMultipleTimes() {
		const Active = component()
		const e = entity()
		e.set(Active)
		e.set(Active)
		Assert.true(
			e.has(Active),
			'Expected entity to still have the tag after multiple sets',
		)
	}

	@Test
	public clear_doesNothingWhenNoComponentsExist() {
		const e = entity()
		const before = e.components().size()
		e.clear()
		const after = e.components().size()
		Assert.equal(
			before,
			after,
			'Expected component count to remain unchanged for an empty entity',
		)
		Assert.true(e.has(Label), 'Expected Label to still be present')
	}

	@Test
	public get_returnsCorrectValuesForDifferentPairs() {
		const Owns = component<number>()
		const car = entity()
		const house = entity()
		const alice = entity().set(pair(Owns, car), 1).set(pair(Owns, house), 2)

		Assert.equal(
			alice.get(pair(Owns, car)),
			1,
			'Expected correct value for car pair',
		)
		Assert.equal(
			alice.get(pair(Owns, house)),
			2,
			'Expected correct value for house pair',
		)
	}

	@Test
	public internals_arePersistent() {
		query(Internal).forEach((e) => {
			Assert.true(
				e.has(Persistent),
				'Expected all internal entities to have the Persistent component',
			)
		})
	}
}

export = EntityTests
