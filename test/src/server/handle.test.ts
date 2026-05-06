import { Assert, BeforeEach, Test } from '@rbxts/lunit'
import { entity, pair, ChildOf, resolveId, query, Wildcard, Internal, External, Label, component } from '@rbxts/toucan'

class EntityTests {
	@BeforeEach
	public reset() {
		query(Wildcard)
			.filter((e) => !e.has(Internal) && !e.has(External))
			.collect() // We collect due to iterator invalidation; see issue #2.
			.forEach(([e]) => e.despawn())
	}

	@Test
	public entityCreation() {
		const e = entity()
		Assert.true(e.exists())
	}

	@Test
	public entityWithLabel() {
		const label = 'TestEntity'
		const e = entity(label)
		Assert.equal(e.toString(), label)
		Assert.true(e.exists())
	}

	@Test
	public entityDespawn() {
		const e = entity()
		Assert.true(e.exists())
		e.despawn()
		Assert.false(e.exists())
	}

	@Test
	public entityParentChild() {
		const parent = entity('Parent')
		const child = entity('Child').set(pair(ChildOf, parent))
		Assert.equal(child.parent(), parent)
		Assert.equal(parent.children().size(), 1)
		Assert.equal(parent.children()[0], child)
		Assert.equal(child.targetOf(ChildOf), parent)
		Assert.equal(child.targetsOf(ChildOf).size(), 1)
		Assert.equal(child.targetsOf(ChildOf)[0], parent)
		Assert.equal(child.relationships().size(), 1)
		Assert.equal(child.relationships()[0].relation, ChildOf)
		Assert.equal(child.relationships()[0].target, parent)
	}

	@Test
	public entityResolveId() {
		const e = entity('Test')
		const resolved = resolveId(e.id)
		Assert.equal(resolved, e)
		Assert.true(resolved?.exists())
	}

	@Test
	public entityRemove() {
		const C = component()
		const e = entity().set(C)
		Assert.true(e.has(C))
		e.remove(C)
		Assert.false(e.has(C))
	}

	@Test
	public entityRemoveErrorsWithPersistent() {
		const e = entity()
		Assert.true(e.has(Label))
		Assert.throws(() => e.remove(Label))
	}

	@Test
	public entityClear() {
		const C1 = component()
		const C2 = component()
		const e = entity().set(C1).set(C2)
		Assert.true(e.has(C1) && e.has(C2))
		e.clear()
		Assert.false(e.has(C1) || e.has(C2))
	}

	@Test
	public entityClearIgnoresPersistent() {
		const e = entity()
		Assert.true(e.has(Label))
		e.clear()
		Assert.true(e.has(Label))
	}

	@Test
	public entityComponents() {
		const e = entity()
		const comps = e.components()
		Assert.equal(comps.size(), 1)
		Assert.equal(comps[0], Label)
	}
}

export = EntityTests
