import { Assert, BeforeEach, Test } from '@rbxts/lunit'
import { Each } from '@rbxts/lunit/out/lib/decorator'
import * as Toucan from '@rbxts/toucan'
import {
	Builtin,
	type EntityHandle,
	entity,
	scheduler as newScheduler,
	pair,
	query,
	type Scheduler,
	type Schedules,
	systemSet,
} from '@rbxts/toucan'

// This is enough time for all of the RunService schedules to run at least once.
const SCHEDULE_SETTLE_DELAY = 0.5

const _simulateExternal = (
	Toucan as unknown as { _simulateExternal: (callback: () => void) => void }
)._simulateExternal

let scheduler = newScheduler()

class SchedulerTests {
	@BeforeEach
	reset() {
		query(Builtin.Wildcard)
			.filter((e) => !e.has(Builtin.Internal) && !e.has(Builtin.Persistent))
			.collect() // We collect due to iterator invalidation; see issue #2.
			.forEach(([e]) => e.despawn())

		;(scheduler as unknown as { _despawn(): void })._despawn()
		scheduler = newScheduler()
	}

	@Test
	useSystem_startupSchedule_runsOnce() {
		const scheds: Schedules[] = ['preStartup', 'startup', 'postStartup']

		let counter = 0
		scheds.forEach((s) => {
			scheduler.useSystem(s, () => counter++)
		})

		scheduler.run()

		Assert.equal(
			counter,
			scheds.size(),
			'Expected startup schedules to run once',
		)
	}

	@Test
	useSystem_updateSchedule_runsMultipleTimes() {
		const scheds: Schedules[] = [
			'first',
			'preUpdate',
			'update',
			'postUpdate',
			'last',
		]

		let counter = 0
		scheds.forEach((s) => scheduler.useSystem(s, () => counter++))

		scheduler.run()

		task.wait(SCHEDULE_SETTLE_DELAY)

		Assert.greaterThan(
			counter,
			scheds.size(),
			`Expected update schedules to run multiple times`,
		)
	}

	@Test
	useSystem_throwsAfterRun() {
		Assert.throws(
			() => {
				scheduler.run()
				scheduler.useSystem('update', () => {})
			},
			undefined,
			'Expected useSystem to throw after run',
		)
	}

	@Test
	useSystemChain_throwsAfterRun() {
		Assert.throws(
			() => {
				scheduler.run()
				scheduler.useSystemChain('update', () => {})
			},
			undefined,
			'Expected useSystemChain to throw after run',
		)
	}

	@Test
	configureSet_throwsAfterRun() {
		Assert.throws(
			() => {
				scheduler.run()
				scheduler.configureSet('update', systemSet('foo'), {})
			},
			undefined,
			'Expected configureSet to throw after run',
		)
	}

	@Test
	@Each([
		['Alpha', 'Beta', 'Gamma'],
		['Zeta', 'Omega', 'Delta', 'Epsilon', 'Theta'],
		['LonelySystem'],
	])
	useSystemChain_ordersImplicitly(...systemNames: string[]) {
		const executionOrder: string[] = []

		scheduler
			.useSystemChain(
				'startup',
				...systemNames.map((name) => () => executionOrder.push(name)),
			)
			.run()

		Assert.equal(
			executionOrder.join(),
			systemNames.join(),
			'Expected systems to execute in the exact order they were registered\n' +
				`Expected: ${systemNames.join()}\n` +
				`Got: ${executionOrder.join()}`,
		)
	}

	@Test
	useSystem_startupSchedule_runsInOrder() {
		const order: string[] = []

		scheduler
			.useSystem('preStartup', () => order.push('preStartup'))
			.useSystem('startup', () => order.push('startup'))
			.useSystem('postStartup', () => order.push('postStartup'))
			.run()

		Assert.equal(
			order.join(', '),
			'preStartup, startup, postStartup',
			'Schedule group ordering not respected',
		)
	}

	@Test
	useSystem_updateSchedule_runsInOrder() {
		const order: string[] = []

		scheduler
			.useSystem('first', () => order.push('first'))
			.useSystem('preUpdate', () => order.push('preUpdate'))
			.useSystem('update', () => order.push('update'))
			.useSystem('postUpdate', () => order.push('postUpdate'))
			.useSystem('last', () => order.push('last'))
			.run()

		task.wait(SCHEDULE_SETTLE_DELAY)

		Assert.true(
			order.indexOf('first') < order.indexOf('preUpdate') &&
				order.indexOf('preUpdate') < order.indexOf('update') &&
				order.indexOf('update') < order.indexOf('postUpdate') &&
				order.indexOf('postUpdate') < order.indexOf('last'),
			'Heartbeat group ordering not respected',
		)
	}

	@Test
	useSystem_before_isRespected() {
		const order: string[] = []
		const A = () => order.push('A')
		const B = () => order.push('B')

		scheduler
			.useSystem('startup', A, { before: B })
			.useSystem('startup', B)
			.run()

		Assert.true(
			order.indexOf('A') < order.indexOf('B'),
			'A should run before B',
		)
	}

	@Test
	useSystem_after_isRespected() {
		const order: string[] = []
		const A = () => order.push('A')
		const B = () => order.push('B')

		scheduler
			.useSystem('startup', A)
			.useSystem('startup', B, { after: A })
			.run()

		Assert.true(order.indexOf('A') < order.indexOf('B'), 'B should run after A')
	}

	@Test
	useSystem_orderingIsTransitive() {
		const order: string[] = []

		const a = () => order.push('a')
		const b = () => order.push('b')
		const c = () => order.push('c')

		scheduler
			.useSystem('startup', a, { before: b })
			.useSystem('startup', b, { before: c })
			.useSystem('startup', c)
			.run()

		Assert.true(
			order.indexOf('a') < order.indexOf('b') &&
				order.indexOf('b') < order.indexOf('c') &&
				order.indexOf('a') < order.indexOf('c'),
			'Transitive ordering failed',
		)
	}

	@Test
	useSystemChain_before_respectsImplicidWithExplicitOrdering() {
		const order: string[] = []

		const external = () => order.push('external')
		const a = () => order.push('a')
		const b = () => order.push('b')
		const c = () => order.push('c')

		scheduler
			.useSystem('startup', external)
			.useSystemChain('startup', [a, { before: external }], b, c)
			.run()

		const [extIdx, aIdx, bIdx, cIdx] = [
			order.indexOf('external'),
			order.indexOf('a'),
			order.indexOf('b'),
			order.indexOf('c'),
		]

		Assert.true(
			aIdx < extIdx && aIdx < bIdx && bIdx < cIdx,
			`Expected 'a' to come before 'b' and 'external',  got: '${order.join(' -> ')}'`,
		)
	}

	@Test
	useSystemChain_runIf_skipDoesNotAlterImplicitOrdering() {
		const order: string[] = []

		const a = () => order.push('a')
		const b = () => order.push('b')
		const c = () => order.push('c')

		scheduler.useSystemChain('startup', a, [b, { runIf: () => false }], c).run()

		Assert.true(
			order.indexOf('a') < order.indexOf('c'),
			"Expected 'b' to be skipped while implicit ordering still places 'a' before 'c'",
		)
	}

	@Test
	useSystem_inSet_inheritsConstraints() {
		const order: string[] = []

		const setA = systemSet('setA')
		const setB = systemSet('setB')

		const sysA = () => order.push('a')
		const sysB = () => order.push('b')

		scheduler
			.configureSet('startup', setA, { before: setB })
			.configureSet('startup', setB, {})
			.useSystem('startup', sysA, { inSet: setA })
			.useSystem('startup', sysB, { inSet: setB })
			.run()

		Assert.true(
			order.indexOf('a') < order.indexOf('b'),
			'Set ordering not inherited',
		)
	}

	@Test
	useSystem_inSet_inheritsSystemSetConfig() {
		const order: string[] = []

		const network = systemSet('network')
		const input = systemSet('input')
		const combat = systemSet('combat')
		const audio = systemSet('audio')

		const fetchNetworkState = () => order.push('fetchNetworkState')
		const handlePlayerAttack = () => order.push('handlePlayerAttack')
		const playCombatSounds = () => order.push('playCombatSounds')

		scheduler
			.configureSet('startup', network, { before: input })
			.configureSet('startup', input, {})
			.configureSet('startup', combat, { before: audio })
			.configureSet('startup', audio, {})
			.useSystem('startup', playCombatSounds, { inSet: [audio] })
			.useSystem('startup', handlePlayerAttack, {
				inSet: [input, combat],
			})
			.useSystem('startup', fetchNetworkState, { inSet: [network] })
			.run()

		Assert.equal(
			order.join(', '),
			'fetchNetworkState, handlePlayerAttack, playCombatSounds',
			'System in multiple sets should inherit ordering from all its sets',
		)
	}

	@Test
	useSystem_runIf_falseSkipsSystem() {
		let ran = false

		scheduler
			.useSystem('startup', () => (ran = true), { runIf: () => false })
			.run()

		Assert.false(ran, 'System should be skipped when runIf is false')
	}

	@Test
	@Each([
		[true, true, true],
		[true, false, false],
		[false, true, false],
		[false, false, false],
	])
	useSystem_runIf_setAndSystemConditionsAreAnded(
		setCond: boolean,
		sysCond: boolean,
		shouldRun: boolean,
	) {
		let ran = false

		const condSet = systemSet('condSet')

		scheduler
			.configureSet('startup', condSet, { runIf: () => setCond })
			.useSystem('startup', () => (ran = true), {
				inSet: condSet,
				runIf: () => sysCond,
			})
			.run()

		Assert.equal(
			ran,
			shouldRun,
			`Expected run state to be ${shouldRun} when set condition is ${setCond} and system condition is ${sysCond}`,
		)
	}

	@Test
	useSystem_runIf_skipDoesNotAlterOrdering() {
		const order: string[] = []
		const a = () => order.push('a')
		const b = () => order.push('b')
		const c = () => order.push('c')

		scheduler
			.useSystem('startup', a)
			.useSystem('startup', b, { after: a, runIf: () => false })
			.useSystem('startup', c, { after: b })
			.run()

		Assert.true(
			order.indexOf('a') < order.indexOf('c'),
			"Expected 'a' to run before 'c', properly bypassing skipped system 'b'",
		)
	}

	@Test
	useSystem_circularDependencyThrowsOnRun() {
		const a = () => {}
		const b = () => {}

		// Should not throw at registration time.
		scheduler
			.useSystem('startup', a, { before: b })
			.useSystem('startup', b, { before: a })

		Assert.throws(
			() => scheduler.run(),
			undefined,
			'Expected circular dependency to throw when run() is called',
		)
	}

	@Test
	configureSet_configuresPerSchedule() {
		const sharedSet = systemSet('sharedSet')

		const result = new Set<string>()
		const preStartupSystem = () => result.add('preStartup')
		const startupSystem = () => result.add('startup')
		const preUpdateSystem = () => result.add('preUpdate')
		const updateSystem = () => result.add('update')
		const preSimulationSystem = () => result.add('preSimulation')
		const preRenderSystem = () => result.add('preRender')

		scheduler
			.configureSet('preStartup', sharedSet, { runIf: () => false })
			.configureSet('preUpdate', sharedSet, { runIf: () => false })
			.configureSet('preSimulation', sharedSet, { runIf: () => false })
			.useSystem('preStartup', preStartupSystem, { inSet: sharedSet })
			.useSystem('startup', startupSystem, { inSet: sharedSet })
			.useSystem('preUpdate', preUpdateSystem, { inSet: sharedSet })
			.useSystem('update', updateSystem, { inSet: sharedSet })
			.useSystem('preSimulation', preSimulationSystem, { inSet: sharedSet })
			.useSystem('preRender', preRenderSystem, { inSet: sharedSet })
			.run()

		task.wait(SCHEDULE_SETTLE_DELAY)

		const expectedIncluded = ['startup', 'update', 'preRender']
		expectedIncluded.forEach((str) =>
			Assert.true(result.has(str), `Expected result to contain ${str}`),
		)

		const expectedExcluded = ['preStartup', 'preUpdate', 'preSimulation']
		expectedExcluded.forEach((str) =>
			Assert.false(result.has(str), `Expected result to not contain ${str}`),
		)
	}

	@Test
	useSystem_config_respectsSystemSetConstraints() {
		const someSet = systemSet('someSet')

		const result: string[] = []
		const beforeSystem = () => result.push('before')
		const inSetSystem1 = () => result.push('inSet1')
		const inSetSystem2 = () => result.push('inSet2')
		const afterSystem = () => result.push('after')

		scheduler
			.useSystem('startup', beforeSystem, { before: someSet })
			.useSystem('startup', inSetSystem1, { inSet: someSet })
			.useSystem('startup', inSetSystem2, { inSet: someSet })
			.useSystem('startup', afterSystem, { after: someSet })
			.run()

		Assert.true(
			result.indexOf('before') < result.indexOf('inSet1') &&
				result.indexOf('before') < result.indexOf('inSet2') &&
				result.indexOf('after') > result.indexOf('inSet1') &&
				result.indexOf('after') > result.indexOf('inSet2'),
			`Expected 'before' to be before 'inSet1' and 'inSet2', and 'after' to be after both, but got ${result}`,
		)
	}

	@Test
	useSystem_duplicateThrows() {
		function someSystem() {}

		scheduler.useSystem('startup', someSystem)

		Assert.throws(
			() => scheduler.useSystem('startup', someSystem),
			undefined,
			'Expected duplicate system registration to throw',
		)
	}

	@Test
	configureSet_duplicateThrows() {
		const someSet = systemSet('someSet')

		scheduler.configureSet('startup', someSet, { before: [] })

		Assert.throws(
			() => scheduler.configureSet('startup', someSet, { before: [] }),
			undefined,
			'Expected duplicate set configuration to throw',
		)

		Assert.doesNotThrow(
			() => scheduler.configureSet('postStartup', someSet, { before: [] }),
			'Expected duplicate set configuration on different schedules to not throw',
		)
	}

	@Test
	useSystem_before_danglingDependencyThrowsOnRun() {
		function someSystem() {}
		function danglingSystem() {} // Defined but never scheduled.

		// Should not throw at registration time.
		scheduler.useSystem('startup', someSystem, { before: danglingSystem })

		Assert.throws(
			() => scheduler.run(),
			undefined,
			"Expected a dangling dependency reference in 'before' to throw on run()",
		)
	}

	@Test
	useSystem_after_danglingDependencyThrowsOnRun() {
		function someSystem() {}
		function danglingSystem() {} // Defined but never scheduled.

		// Should not throw at registration time.
		scheduler.useSystem('startup', someSystem, { after: danglingSystem })

		Assert.throws(
			() => scheduler.run(),
			undefined,
			"Expected a dangling dependency reference in 'after' to throw on run()",
		)
	}

	@Test
	useSystem_circularDependencyWithSetThrowsOnRun() {
		const setS = systemSet('setS')

		const a = () => {}
		const b = () => {}

		scheduler
			.useSystem('startup', a, { before: setS })
			.useSystem('startup', b, { inSet: setS, before: a })

		Assert.throws(
			() => scheduler.run(),
			undefined,
			'Expected cross-level circular dependency (system -> set -> member system -> system) to throw on run()',
		)
	}

	@Test
	scheduler_instantiatingTwiceThrows() {
		Assert.throws(
			() => newScheduler(),
			undefined,
			'Expected instantiating the scheduler twice to throw an error',
		)
	}

	@Test
	run_callingTwiceThrows() {
		Assert.throws(
			() => {
				scheduler.run()
				scheduler.run()
			},
			undefined,
			'Expected calling run() twice to throw an error',
		)
	}

	@Test
	useSystem_spawnsSystemEntity() {
		const systemFn = () => {}

		scheduler.useSystem('startup', systemFn)

		Assert.true(
			query(Builtin.System).find((_e, sys) => sys.fn === systemFn) !==
				undefined,
			'Expected useSystem to spawn a system entity',
		)
	}

	@Test
	useSystem_entityLabelIsInferred() {
		function weirdlyNamedSystem() {}

		scheduler.useSystem('startup', weirdlyNamedSystem)

		Assert.true(
			query(Builtin.System).find(
				(e) => tostring(e) === 'weirdlyNamedSystem',
			) !== undefined,
			'Expected useSystem to infer the entity label from the function name',
		)
	}

	@Test
	scheduler_spawnsScheduleEntities() {
		const querySchedules = (kind: Schedules) =>
			query(Builtin.Schedule)
				.filter((_e, sch) => sch.kind === kind)
				.map((_e, s) => s)

		const scheduleMap = new Map([
			['preStartup', querySchedules('preStartup')],
			['startup', querySchedules('startup')],
			['postStartup', querySchedules('postStartup')],
			['first', querySchedules('first')],
			['preUpdate', querySchedules('preUpdate')],
			['update', querySchedules('update')],
			['postUpdate', querySchedules('postUpdate')],
			['last', querySchedules('last')],
			['preRender', querySchedules('preRender')],
			['preAnimation', querySchedules('preAnimation')],
			['preSimulation', querySchedules('preSimulation')],
			['postSimulation', querySchedules('postSimulation')],
		])

		scheduleMap.forEach((scheds, kind) => {
			Assert.false(
				scheds.isEmpty(),
				`Expected an schedule entity to be spawned for '${kind}'`,
			)
			Assert.equal(
				scheds.size(),
				1,
				`Expected exactly one schedule entity to be spawned for '${kind}'`,
			)
		})
	}

	@Test
	useSystem_spawnsEntityInSpecifiedSchedule() {
		const systemFn = () => {}

		scheduler.useSystem('startup', systemFn)

		const [systemEntity] = query(Builtin.System).find(
			(_e, sys) => sys.fn === systemFn,
		)!
		const [startupEntity] = query(Builtin.Schedule).find(
			(_e, sch) => sch.kind === 'startup',
		)!

		Assert.true(
			systemEntity.has(pair(Builtin.ChildOf, startupEntity as EntityHandle)),
			'Expected system entity to be a child of the startup schedule',
		)
	}

	@Test
	run_buildsPluginsBeforeSchedulingSystems() {
		const order: string[] = []

		function somePlugin(scheduler: Scheduler) {
			order.push('plugin')
			scheduler.useSystem('preStartup', () => order.push('pluginSystem'))
		}

		scheduler
			.useSystem('preStartup', () => order.push('system'))
			// We use plugin after system to make sure call order doesn't matter.
			.usePlugin(somePlugin)
			.run()

		Assert.true(
			order[0] === 'plugin' &&
				order.includes('pluginSystem') &&
				order.includes('system'),
			'Expected plugin to be built before scheduling systems',
		)
	}

	@Test
	usePlugin_fowardsArguments() {
		const someObject = { foo: 'bar' }
		const expectedArgs: unknown[] = ['arg1', undefined, 2, someObject]
		const actualArgs: unknown[] = []

		function somePlugin(_s: Scheduler, ...args: unknown[]) {
			actualArgs[0] = args[0]
			actualArgs[1] = args[1]
			actualArgs[2] = args[2]
			actualArgs[3] = args[3]
		}

		scheduler.usePlugin(somePlugin, 'arg1', undefined, 2, someObject).run()

		Assert.true(
			actualArgs.size() === expectedArgs.size() &&
				(actualArgs as defined[]).every((arg, i) => arg === expectedArgs[i]),
			`Expected plugin to forward ${expectedArgs[0]}, ${expectedArgs[1]}, ${expectedArgs[2]}, ${expectedArgs[3]}` +
				`, got ${actualArgs[0]}, ${actualArgs[1]}, ${actualArgs[2]}, ${actualArgs[3]}`,
		)
	}

	@Test
	usePlugin_nestedPluginsCorrectlyScheduleSystems() {
		const order: string[] = []

		function childPlugin(scheduler: Scheduler) {
			scheduler.useSystem('postStartup', () => order.push('child'))
		}

		function parentPlugin(scheduler: Scheduler) {
			scheduler
				.usePlugin(childPlugin)
				.useSystem('startup', () => order.push('parent'))
		}

		scheduler.usePlugin(parentPlugin).run()

		Assert.true(
			order[0] === 'parent' && order[1] === 'child',
			'Expected parent and child plugins to both schedule systems in the correct order',
		)
	}

	@Test
	usePlugin_userOverwritingUserPluginThrows() {
		function somePlugin(_s: Scheduler) {}

		Assert.throws(
			() => scheduler.usePlugin(somePlugin).usePlugin(somePlugin).run(),
			undefined,
			'Expected usePlugin to throw when a user tries to overwrite the same user plugin',
		)
	}

	@Test
	usePlugin_externalOverwritingExternalPluginWithSameArgsDoesNotThrow() {
		function somePlugin(_s: Scheduler, _n: number) {}

		Assert.doesNotThrow(() =>
			_simulateExternal(() =>
				scheduler.usePlugin(somePlugin, 1).usePlugin(somePlugin, 1).run(),
			),
		)
	}

	@Test
	usePlugin_externalOverwritingExternalPluginWithDifferentArgsThrows() {
		function somePlugin(_s: Scheduler, _n: number) {}

		Assert.throws(
			() =>
				_simulateExternal(() =>
					scheduler.usePlugin(somePlugin, 1).usePlugin(somePlugin, 2).run(),
				),
			undefined,
			'Expected usePlugin to throw when an external tries to overwrite the same external plugin with different arguments',
		)
	}

	@Test
	entity_addedByPluginHasRelationship() {
		function someSystem() {}

		function childPlugin(s: Scheduler) {
			s.useSystem('startup', someSystem)
		}

		function parentPlugin(s: Scheduler) {
			entity('addedByPlugin')
			s.usePlugin(childPlugin)
		}

		scheduler.usePlugin(parentPlugin).run()

		const spawnedEntity = query(Builtin.Wildcard)
			.filter((e) => tostring(e) === 'addedByPlugin')
			.collect()[0][0]

		const [systemEntity] = query(Builtin.System).find(
			(_, sys) => sys.fn === someSystem,
		)!

		const [childPluginEntity] = query(Builtin.Plugin).find(
			(_, p) => p.fn === childPlugin,
		)!

		const [parentPluginEntity] = query(Builtin.Plugin).find(
			(_, p) => p.fn === parentPlugin,
		)!

		Assert.true(
			spawnedEntity.has(
				pair(Builtin.AddedByPlugin, parentPluginEntity as EntityHandle),
			),
			"Expected spawned entity to have a 'pair(AddedByPlugin, parentPluginEntity)' relationship",
		)

		Assert.true(
			childPluginEntity.has(
				pair(Builtin.AddedByPlugin, parentPluginEntity as EntityHandle),
			),
			"Expected child plugin entity to have a 'pair(AddedByPlugin, parentPluginEntity)' relationship",
		)

		Assert.true(
			systemEntity.has(
				pair(Builtin.AddedByPlugin, childPluginEntity as EntityHandle),
			),
			"Expected system entity to have a 'pair(AddedByPlugin, childPluginEntity)' relationship",
		)

		Assert.false(
			parentPluginEntity.has(pair(Builtin.AddedByPlugin, Builtin.Wildcard)),
			"Expected parent plugin entity to not have a 'pair(AddedByPlugin, Wildcard)' relationship",
		)
	}

	@Test
	configureSet_beforeAndAfter_systemFn_isRespected() {
		const order: string[] = []
		const someSet = systemSet('someSet')

		const before = () => order.push('before')
		const inSet = () => order.push('inSet')
		const after = () => order.push('after')

		scheduler
			.configureSet('startup', someSet, { after: before, before: after })
			.useSystem('startup', before)
			.useSystem('startup', inSet, { inSet: someSet })
			.useSystem('startup', after)
			.run()

		Assert.true(
			order.indexOf('before') < order.indexOf('inSet') &&
				order.indexOf('inSet') < order.indexOf('after'),
			"Expected set to respect 'after' and 'before' SystemFn constraints",
		)
	}

	@Test
	configureSet_before_systemFn_appliesToAllSetMembers() {
		const order: string[] = []
		const someSet = systemSet('someSet')

		const inSet1 = () => order.push('inSet1')
		const inSet2 = () => order.push('inSet2')
		const afterSystem = () => order.push('after')

		scheduler
			.configureSet('startup', someSet, { before: afterSystem })
			.useSystem('startup', inSet1, { inSet: someSet })
			.useSystem('startup', inSet2, { inSet: someSet })
			.useSystem('startup', afterSystem)
			.run()

		Assert.true(
			order.indexOf('inSet1') < order.indexOf('after') &&
				order.indexOf('inSet2') < order.indexOf('after'),
			"Expected every set member to run before the standalone system specified in 'before'",
		)
	}

	@Test
	configureSet_before_mixedSystemFnAndSetTargets_isRespected() {
		const order: string[] = []
		const setA = systemSet('setA')
		const setB = systemSet('setB')

		const inSetA = () => order.push('inSetA')
		const inSetB = () => order.push('inSetB')
		const standalone = () => order.push('standalone')

		scheduler
			.configureSet('startup', setA, { before: [setB, standalone] })
			.useSystem('startup', inSetA, { inSet: setA })
			.useSystem('startup', inSetB, { inSet: setB })
			.useSystem('startup', standalone)
			.run()

		Assert.true(
			order.indexOf('inSetA') < order.indexOf('inSetB') &&
				order.indexOf('inSetA') < order.indexOf('standalone'),
			"Expected set members to run before both a SystemSet and a standalone SystemFn specified in 'before'",
		)
	}

	@Test
	configureSet_before_danglingSystemFnThrowsOnRun() {
		const someSet = systemSet('someSet')
		function unscheduledSystem() {}

		scheduler
			.configureSet('startup', someSet, { before: unscheduledSystem })
			.useSystem('startup', () => {}, { inSet: someSet })

		Assert.throws(
			() => scheduler.run(),
			undefined,
			"Expected a dangling SystemFn reference in a set's 'before' to throw on run()",
		)
	}

	@Test
	configureSet_circularDependencyWithSystemFnThrowsOnRun() {
		const someSet = systemSet('someSet')

		const a = () => {}
		const b = () => {}

		scheduler
			.useSystem('startup', a, { before: someSet })
			.useSystem('startup', b, { inSet: someSet })
			.configureSet('startup', someSet, { before: a })

		Assert.throws(
			() => scheduler.run(),
			undefined,
			'Expected a circular dependency between a set and a standalone system to throw on run()',
		)
	}
}

export = SchedulerTests
