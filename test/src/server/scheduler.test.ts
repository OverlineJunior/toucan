import { Assert, BeforeEach, Test } from '@rbxts/lunit'
import { Each } from '@rbxts/lunit/out/lib/decorator'
import {
	query,
	Wildcard,
	Internal,
	External,
	ChildOf,
	Plugin,
	System,
	pair,
	scheduler,
	Scheduler,
	UPDATE,
	STARTUP,
	EntityHandle,
} from '@rbxts/toucan'

class SchedulerTests {
	@BeforeEach
	public reset() {
		query(Wildcard)
			.filter((e) => !e.has(Internal) && !e.has(External))
			.collect() // We collect due to iterator invalidation; see issue #2.
			.forEach(([e]) => e.despawn())
	}

	@Test
	public useSystem_spawnsSystemEntity() {
		function myTestSystem() {}

		scheduler().useSystem(myTestSystem, UPDATE)

		const results = query(System).collect()
		const systemData = results.find(([, sys]) => sys.callback === myTestSystem)?.[1]

		Assert.true(systemData !== undefined, 'Expected systemData to be defined')
		Assert.equal(systemData!.phase, UPDATE, 'Expected system phase to be UPDATE')
		Assert.equal(systemData!.scheduled, false, 'Expected system to not be scheduled yet')
	}

	@Test
	public useSystem_infersLabelFromNamedFunction() {
		function myTestSystem() {}

		scheduler().useSystem(myTestSystem, UPDATE)

		const result = query(System).find((e, sys) => sys.callback === myTestSystem)?.[0]

		Assert.true(result !== undefined, 'Expected to find the system entity')
		Assert.equal(tostring(result), 'myTestSystem', 'Expected system label to match the function name')
	}

	@Test
	public useSystem_assignsCustomLabel() {
		const unnamedSystemFn = () => {}
		const label = 'CustomLabel'

		scheduler().useSystem(unnamedSystemFn, UPDATE, [], label)

		const result = query(System).find((e, sys) => sys.callback === unnamedSystemFn)?.[0]

		Assert.true(result !== undefined, 'Expected to find the unnamed system entity')
		Assert.equal(tostring(result), label, 'Expected system label to match the custom label provided')
	}

	@Each([['Alpha', 'Beta', 'Gamma'], ['Zeta', 'Omega', 'Delta', 'Epsilon', 'Theta'], ['LonelySystem']])
	@Test
	public useSystem_implicitOrdering(...systemNames: string[]) {
		const executionOrder: string[] = []
		const sched = scheduler()

		systemNames.forEach((name) => {
			sched.useSystem(() => executionOrder.push(name), STARTUP)
		})

		sched.run()

		Assert.equal(
			executionOrder.join(','),
			systemNames.join(','),
			'Expected systems to execute in the exact order they were registered',
		)
	}

	@Test
	public usePlugin_spawnsPluginEntity() {
		function myTestPlugin() {}

		scheduler().usePlugin(myTestPlugin)

		const results = query(Plugin).collect()
		const pluginData = results.find(([, p]) => p.build === myTestPlugin)?.[1]

		Assert.true(pluginData !== undefined, 'Expected pluginData to be defined')
		Assert.equal(pluginData!.built, false, 'Expected plugin to not be built yet')
	}

	@Test
	public usePlugin_throwsOnAnonymousFunction() {
		Assert.throws(
			() => {
				scheduler().usePlugin(() => {})
			},
			undefined,
			'Expected usePlugin to throw an error when passed an anonymous function',
		)
	}

	@Test
	public usePlugin_ignoresDuplicateCallsWithSameArgs() {
		function duplicatePlugin(s: Scheduler, a: number) {}

		const sched = scheduler()
		sched.usePlugin(duplicatePlugin, 42)
		sched.usePlugin(duplicatePlugin, 42)

		const plugins = query(Plugin)
			.collect()
			.filter(([, p]) => p.build === duplicatePlugin)

		Assert.equal(plugins.size(), 1, 'Expected duplicate plugins with the same arguments to be ignored')
	}

	@Test
	public usePlugin_throwsOnDuplicateCallsWithDifferentArgs() {
		function conflictPlugin(s: Scheduler, a: number) {}

		const sched = scheduler()
		sched.usePlugin(conflictPlugin, 1)

		Assert.throws(
			() => {
				sched.usePlugin(conflictPlugin, 2)
			},
			undefined,
			'Expected usePlugin to throw an error when passed duplicate plugins with different arguments',
		)
	}

	@Test
	public run_buildsRegisteredPlugins() {
		let wasBuilt = false

		function executionTestPlugin() {
			wasBuilt = true
		}

		scheduler().usePlugin(executionTestPlugin).run()

		Assert.true(wasBuilt, 'Expected the plugin to be built upon running the scheduler')
	}

	@Test
	public run_marksSystemsAsScheduled() {
		function runTestSystem() {}

		scheduler().useSystem(runTestSystem, UPDATE).run()

		const systemData = query(System).find((_, s) => s.callback === runTestSystem)?.[1]

		Assert.true(systemData !== undefined, 'Expected to find the system data')
		Assert.true(systemData!.scheduled, 'Expected the system to be marked as scheduled after running')
	}

	@Test
	public run_setsChildOfRelationshipForNestedSpawns() {
		function myNestedSystem() {}

		function myParentPlugin(s: Scheduler) {
			s.useSystem(myNestedSystem, UPDATE)
		}

		scheduler().usePlugin(myParentPlugin).run()

		const parent = query(Plugin).find((_, p) => p.build === myParentPlugin)?.[0]
		const child = query(System).find((_, s) => s.callback === myNestedSystem)?.[0]

		Assert.true(parent !== undefined, 'Expected to find the parent plugin entity')
		Assert.true(child !== undefined, 'Expected to find the nested child system entity')
		Assert.true(
			child!.has(pair(ChildOf, parent! as EntityHandle)),
			'Expected child system to have a ChildOf relationship with the parent plugin',
		)
	}

	@Test
	public run_loadsStandardPlugins() {
		scheduler().run()

		const allPlugins = query(Plugin).collect()
		Assert.true(allPlugins.size() > 0, 'Expected standard plugins to be loaded and present')
	}
}

export = SchedulerTests
