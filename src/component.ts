import { Entity, component as jecsComponent, Tag } from '@rbxts/jecs'

export function component<Value = undefined>(): Value extends undefined ? Tag : Entity<Value> {
	return jecsComponent() as Value extends undefined ? Tag : Entity<Value>
}
