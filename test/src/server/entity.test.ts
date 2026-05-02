import { Assert, Test } from '@rbxts/lunit'
import { entity, pair, ChildOf, resolveId } from '@rbxts/toucan'

class EntityTests {
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
	}

	@Test
	public entityResolveId() {
		const e = entity('Test')
		const resolved = resolveId(e.id)
		Assert.equal(resolved, e)
		Assert.true(resolved?.exists())
	}
}

export = EntityTests
