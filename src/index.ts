import {
	AddedByPlugin,
	ChildOf,
	Component,
	Internal,
	Label,
	Persistent,
	Resource,
	ThirdParty,
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
}
/** @internal */
export { _simulateThirdParty } from './handle'
