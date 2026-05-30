import type { RunCondition } from './types'

export interface SetConfig {
	before?: SystemSet | SystemSet[]
	after?: SystemSet | SystemSet[]
	runIf?: RunCondition | RunCondition[]
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
