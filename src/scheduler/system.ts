import { component, Internal, Persistent } from '../handle'
import { normalizeToArray } from '../util'
import type { Schedules } from './scheduler'

export type SystemFn<Args extends unknown[] = unknown[]> = (
	...args: Args
) => void

export type RunCondition = () => boolean

export interface SystemConfig {
	before?: SystemFn | SystemSet | (SystemFn | SystemSet)[]
	after?: SystemFn | SystemSet | (SystemFn | SystemSet)[]
	inSet?: SystemSet | SystemSet[]
	runIf?: RunCondition | RunCondition[]
}

export interface NormalizedSystemConfig {
	before: (SystemSet | SystemFn)[]
	after: (SystemSet | SystemFn)[]
	inSets: SystemSet[]
	runIfs: RunCondition[]
}

export interface SetConfig {
	before?: SystemSet | SystemSet[]
	after?: SystemSet | SystemSet[]
	runIf?: RunCondition | RunCondition[]
}

export interface NormalizedSetConfig {
	before: SystemSet[]
	after: SystemSet[]
	runIf: RunCondition[]
}

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

export function getSystemName(system: SystemFn): string {
	return debug.info(system, 'n')[0] || 'Unlabelled System'
}

export function normalizeSystemConfig(
	config?: SystemConfig,
): NormalizedSystemConfig {
	return {
		before: normalizeToArray(config?.before),
		after: normalizeToArray(config?.after),
		runIfs: normalizeToArray(config?.runIf),
		inSets: normalizeToArray(config?.inSet),
	}
}

export class SystemSet {
	readonly __type = 'SystemSet' as const
	constructor(public readonly name: string) {}
}

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
