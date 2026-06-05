/** @internal */
// biome-ignore assist/source/organizeImports: keep separate for @internal annotation
export { _simulateExternal } from './handle'
export {
	ChildOf,
	Component,
	type ComponentHandle,
	component,
	type EntityHandle,
	External,
	entity,
	type Handle,
	Internal,
	Label,
	Persistent,
	type RawId,
	Resource,
	type ResourceHandle,
	resolveId,
	resource,
	Wildcard,
} from './handle'
export { type Pair, pair } from './pair'
export { type Query, query } from './query'
export {
	InSchedule,
	Plugin,
	ScheduleComponent as Schedule,
	type Scheduler,
	type Schedules,
	System,
	type SystemSet,
	scheduler,
	systemSet,
} from './scheduler'
