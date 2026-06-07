import { component, type EntityHandle, Internal, Persistent } from '../handle'
import { normalizeToArray } from '../util'
import type { Schedules } from './scheduler'

/**
 * A function that represents a system.
 *
 * @group Types
 */
export type SystemFn<Args extends unknown[] = unknown[]> = (
	...args: Args
) => void

export type RunCondition = () => boolean

/**
 * Configuration options for a system registered with {@link Scheduler.useSystem}.
 *
 * @group Types
 */
export interface SystemConfig {
	/** A human-readable label for this system. */
	label?: string
	/**
	 * Runs this system before the given target(s).
	 * When a `SystemSet` is given, this system runs before every system in that set.
	 */
	before?: SystemFn | SystemSet | (SystemFn | SystemSet)[]
	/** Symmetric to `before`. */
	after?: SystemFn | SystemSet | (SystemFn | SystemSet)[]
	/** Assigns this system to one or more sets, inheriting their ordering and run conditions. */
	inSet?: SystemSet | SystemSet[]
	/** One or more conditions, where all must return `true` for the system to run. */
	runIf?: RunCondition | RunCondition[]
}

export interface NormalizedSystemConfig {
	label?: string
	before: (SystemSet | SystemFn)[]
	after: (SystemSet | SystemFn)[]
	inSets: SystemSet[]
	runIfs: RunCondition[]
}

/**
 * Configuration options for a system set registered with {@link Scheduler.configureSet}.
 *
 * @group Types
 */
export interface SetConfig {
	/**
	 * Runs every system in this set before the given target(s).
	 * When a `SystemSet` is given, expands to all systems in that set.
	 */
	before?: SystemFn | SystemSet | (SystemFn | SystemSet)[]
	/** Symmetric to `before`. */
	after?: SystemFn | SystemSet | (SystemFn | SystemSet)[]
	/**
	 * One or more conditions inherited by every system in the set,
	 * where all must return `true` for the systems to run.
	 */
	runIf?: RunCondition | RunCondition[]
}

export interface NormalizedSetConfig {
	before: (SystemFn | SystemSet)[]
	after: (SystemFn | SystemSet)[]
	runIf: RunCondition[]
}

/**
 * Built-in component used to distinguish entities that represent systems.
 *
 * @group Built-ins
 */
export const System = component<{
	fn: SystemFn
	schedule: Schedules
	before: (SystemFn | SystemSet)[]
	after: (SystemFn | SystemSet)[]
	runIfs: RunCondition[]
	// System sets are ephemeral information for the scheduler - they all get reduced into systems at runtime.
	/** @internal */
	_inSets: SystemSet[]
}>('System')
	.set(Internal)
	.set(Persistent)

export function inferSystemName(system: SystemFn, e?: EntityHandle): string {
	const defaultLabel = e === undefined ? `System ${system}` : `System #${e.id}`
	return debug.info(system, 'n')[0] || defaultLabel
}

export function normalizeSystemConfig(
	config?: SystemConfig,
): NormalizedSystemConfig {
    return {
        label: config?.label,
		before: normalizeToArray(config?.before),
		after: normalizeToArray(config?.after),
		runIfs: normalizeToArray(config?.runIf),
		inSets: normalizeToArray(config?.inSet),
	}
}

/**
 * A type for system sets created with {@link systemSet}.
 *
 * @group Types
 */
export class SystemSet {
	/** @internal */
	readonly __type = 'SystemSet' as const
	constructor(public readonly name: string) {}
}

/**
 * Creates a system set — a named group that systems can belong to.
 *
 * System sets let you apply shared ordering constraints and run conditions
 * to multiple systems at once, rather than configuring each system individually.
 *
 * @remarks
 * A system set is just a label. Configuration (ordering, run conditions) is applied
 * separately per schedule via {@link Scheduler.configureSet}.
 *
 * @example
 * ```ts
 * const physics = systemSet('physics')
 * const rendering = systemSet('rendering')
 *
 * scheduler()
 *     .configureSet('update', rendering, { after: physics })
 *     .useSystem('update', applyForces, { inSet: physics })
 *     .useSystem('update', resolveCollisions, { inSet: physics })
 *     .useSystem('update', drawWorld, { inSet: rendering })
 *     .run()
 * ```
 *
 * @group Core
 */
export function systemSet(name: string): SystemSet {
	return new SystemSet(name)
}

export function isSystemSet(v: unknown): v is SystemSet {
	return typeIs(v, 'table') && (v as SystemSet).__type === 'SystemSet'
}

export function normalizeSetConfig(config?: SetConfig): NormalizedSetConfig {
	return {
		before: normalizeToArray(config?.before),
		after: normalizeToArray(config?.after),
		runIf: normalizeToArray(config?.runIf),
	}
}
