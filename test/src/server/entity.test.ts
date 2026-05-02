import { Assert, BeforeEach, Test } from '@rbxts/lunit'
import { entity, pair, ChildOf, resolveId, query, Wildcard, Internal, External, Label } from '@rbxts/toucan'

// TODO! Newly added tests have not been reviewed yet. Make sure to check them out and ensure they are correct.
class EntityTests {
	@BeforeEach
	public reset() {
		query(Wildcard)
			.filter((e) => !e.has(Internal) && !e.has(External))
			.forEach((e) => e.despawn())
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
		// TODO! Toucan should support getting the relation and target of relationship pairs.
		// Assert.equal(child.relationships()[0].relation, ChildOf)
		// Assert.equal(child.relationships()[0].target, parent)
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
		const e = entity()
		Assert.true(e.has(Label))
		e.remove(Label)
		// TODO! `handle.remove()` should error when trying to remove internal components like `Label`.
		// ! Consider adding another standard component called `Persistent` that could be given to every internal component.
		Assert.false(e.has(Label))
	}

	@Test
	public entityClear() {
		const e = entity()
		Assert.true(e.has(Label))
		e.clear()
		// TODO! `handle.clear()` should skip removal of internal components like `Label`.
		// ! See the `entityRemove()` test for more details.
		Assert.false(e.has(Label))
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
