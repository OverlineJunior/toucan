import {
	AddedByPlugin,
	ChildOf,
	Component,
	Entity,
	Internal,
	Label,
	MessageSequence,
	Persistent,
	Resource,
	ThirdParty,
	Wildcard,
} from './handle/builtins'
import { Plugin, ScheduleComponent as Schedule, System } from './scheduler'

export {
	type ComponentHandle,
	component,
	type EntityHandle,
	entity,
	Handle,
	type InferValue,
	type InferValues,
	type ResourceHandle,
	resolveId,
	resource,
} from './handle'
export { type Pair, pair } from './handle/pair'
export { __simulateThirdParty } from './handle/thirdParty'
export type { RawId } from './id'
export { message } from './message'
export { type Query, query } from './query'
export {
	__despawnScheduler,
	type PluginFn,
	type RunServiceSchedules,
	type Scheduler,
	type Schedules,
	type SetConfig,
	type StartupSchedules,
	type SystemConfig,
	type SystemFn,
	type SystemSet,
	scheduler,
	systemSet,
	type UpdateSchedules,
} from './scheduler'

/**
 * A collection of built-in {@link Handle}s.
 */
export const Builtin = {
	ChildOf,
	Component,
	ThirdParty,
	Internal,
	Label,
	Persistent,
	Resource,
	Wildcard,
	AddedByPlugin,
	Plugin,
	System,
	Schedule,
	MessageSequence,
	Entity,
}
