import { Entity as RawEntity } from '@rbxts/jecs'
import { world } from './world'
import { Component, InferComponents, RejectTag } from './component'

export type FlattenTuple<T extends unknown[]> = T extends [infer U] ? U : LuaTuple<T>

export type Nullable<T extends unknown[]> = { [K in keyof T]: T[K] | undefined }

export type UpToFour<T> = [T] | [T, T] | [T, T, T] | [T, T, T, T]

export type GetComponents<Cs extends Component<unknown>[]> = {
	[K in keyof Cs]: RejectTag<
		Cs[K],
		"❌ 'entity.get()' cannot be used with tag components. Use 'entity.has()' instead."
	>
}

export type GetResultComponents<Cs extends Component<unknown>[]> = FlattenTuple<Nullable<InferComponents<Cs>>>

export class Entity {
	constructor(protected readonly id: RawEntity) {}

	set(tagComponent: Component<undefined>): this
	set<V>(component: Component<V>, value: V): this
	set(component: Entity, value?: unknown) {
		world.set(this.id, component.id, value)
		return this
	}

	get<Cs extends UpToFour<Component<unknown>>>(...components: GetComponents<Cs>): GetResultComponents<Cs> {
		return world.get(this.id, ...(components.map((c) => c.id) as UpToFour<RawEntity>)) as GetResultComponents<Cs>
	}

	has(component: Component<unknown>): boolean {
		return world.has(this.id, component.id)
	}

	remove(component: Component<unknown>): this {
		world.remove(this.id, component.id)
		return this
	}

	clear(): this {
		world.clear(this.id)
		return this
	}

	parent(): Entity | undefined {
		const parentId = world.parent(this.id)
		return parentId ? new Entity(parentId) : undefined
	}

	// TODO! Consider performance implications.
	children(): Entity[] {
		const childIds = []
		for (const id of world.children(this.id)) {
			childIds.push(new Entity(id))
		}
		return childIds
	}

	exists(): boolean {
		return world.contains(this.id)
	}

	despawn(): void {
		world.delete(this.id)
	}
}

export function entity(): Entity {
	return new Entity(world.entity())
}
