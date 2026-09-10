// This file exists to separate built-in component definitions from `index.ts`
// while avoiding circular dependencies between `builtins.ts` and `index.ts`.
// 
// This file must not import values from index.ts as to avoid circular dependencies;
// types are okay.
// Good: builtins.ts -> index.ts -> builtinRegistry.ts
// Bad: builtins.ts -> index.ts -> builtinRegistry.ts -> index.ts
// 
// Other files can safely import directly from `builtins.ts`, skipping this registry.

import type { ComponentHandle } from '.'
import type {
	BuiltinComponentHandleMap,
	BuiltinComponentLabels,
} from './builtins'

const registry = new Map<BuiltinComponentLabels, ComponentHandle>()

/**
 * Registers a built-in component so `index.ts` can safely access it with `getBuiltin`.
 *
 * ⚠️ **After all built-in components have been registered, you must call `bootstrapBuiltins`.**
 */
export function registerBuiltin<L extends BuiltinComponentLabels>(
	label: L,
	component: BuiltinComponentHandleMap[L],
): BuiltinComponentHandleMap[L] {
	if (registry.has(label)) {
		error(`Built-in component '${label}' is already registered`)
	}

	registry.set(label, component)
	return component
}

/**
 * Returns the built-in component with the given label without having to
 * import it directly, avoiding a circular dependency.
 */
export function getBuiltin<L extends BuiltinComponentLabels>(
	label: L,
): BuiltinComponentHandleMap[L] {
	if (!registry.has(label)) {
		error(
			`Built-in component '${label}' is not registered. This should not happen`,
		)
	}

	return registry.get(label) as BuiltinComponentHandleMap[L]
}

/**
 * Calls `bootstrapper` for each registered built-in, giving its component and label.
 * The callback should be responsible for adding metadata to the built-ins, such as `Label`.
 *
 * ⚠️ **Must be called after all built-in components have been registered.**
 */
export function bootstrapBuiltins(
	bootstrapper: (
		component: ComponentHandle,
		label: BuiltinComponentLabels,
	) => void,
): void {
	for (const [label, component] of pairs(registry)) {
		bootstrapper(component, label)
	}
}
