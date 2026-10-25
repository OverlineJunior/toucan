import { Builtin as BuiltinComponents } from './entities/builtins'
import { Plugin, ScheduleComponent as Schedule, System } from './scheduler'

export {
	type Component,
	component,
	type Entity,
	EntityLike,
	entity,
	type InferValue,
	type InferValues,
	type Resource,
	resolveId,
	resource,
} from './entities'
export { type Pair, pair } from './entities/pair'
export { __simulateThirdParty } from './entities/thirdParty'
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
 * A collection of built-in {@link EntityLike}s.
 */
export const Builtin = {
	...BuiltinComponents,
	Plugin,
	System,
	Schedule,
}
