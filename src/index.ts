import {
	AddedByPlugin,
	ChildOf,
	Component,
	External,
	Internal,
	Label,
	Persistent,
	Resource,
	Wildcard,
} from './handle'
import { Plugin, ScheduleComponent as Schedule, System } from './scheduler'

export {
	type ComponentHandle,
	component,
	type EntityHandle,
	entity,
	type Handle,
	type InferValue,
	type InferValues,
	type RawId,
	type ResourceHandle,
	resolveId,
	resource,
} from './handle'
export { type Pair, pair } from './pair'
export { type Query, query } from './query'
export {
	type PluginFn,
	type Scheduler,
	type Schedules,
	type SetConfig,
	type SystemConfig,
	type SystemFn,
	type SystemSet,
	scheduler,
	systemSet,
} from './scheduler'
export const Builtin = {
	ChildOf,
	Component,
	External,
	Internal,
	Label,
	Persistent,
	Resource,
	Wildcard,
	AddedByPlugin,
	Plugin,
	System,
	Schedule,
}
/** @internal */
export { _simulateExternal } from './handle'
