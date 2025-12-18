import { Id, RawId, VALUE_SYMBOL } from '.'
import { world } from '../world'

export class Resource<Value extends NonNullable<unknown>> extends Id {
	declare [VALUE_SYMBOL]: Value

	read(): Value {
		return world.get(this.id, this.id) as Value
	}

	write(value: Value): this {
		world.set(this.id, this.id, value)
		return this
	}

	changed(listener: (newValue: Value) => void): () => void {
		return world.changed(this.id, (_a, _b, v) => {
			listener(v as Value)
		})
	}
}

export function resource<Value extends NonNullable<unknown>>(value: Value): Resource<Value> {
	const id = world.component<Value>()
	world.set(id, id, value)

	return new Resource<Value>(id)
}
