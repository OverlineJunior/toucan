import { Assert, BeforeEach, Test } from '@rbxts/lunit'
import { Each } from '@rbxts/lunit/out/lib/decorator'
import * as Toucan from '@rbxts/toucan'
import {
	Builtin,
	type EntityHandle,
	entity,
	pair,
	query,
	type Scheduler,
	type Schedules,
	scheduler,
	systemSet,
} from '@rbxts/toucan'
import { clearWorld } from './helpers'

class SchedulerTests {
	@BeforeEach
	reset() {
		clearWorld()
	}

	@Test
	useSystem_startupSchedule_runsOnce() {
		const sched = scheduler()
		const scheds: Schedules[] = ['preStartup', 'startup', 'postStartup']

		let counter = 0
		scheds.forEach((s) => {
			sched.useSystem(s, () => counter++)
		})

		sched.run()

		Assert.equal(
			counter,
			scheds.size(),
			'Expected startup schedules to run once',
		)
	}

	@Test
	useSystem_updateSchedule_runsMultipleTimes() {
		const sched = scheduler()
		const scheds: Schedules[] = [
			'first',
			'preUpdate',
			'update',
			'postUpdate',
			'last',
		]

		let counter = 0
		scheds.forEach((s) => sched.useSystem(s, () => counter++))

		sched.__tick()

		Assert.equal(
			counter,
			scheds.size(),
			'Expected update schedules to run once per tick',
		)

		sched.__tick()

		Assert.equal(
			counter,
			scheds.size() * 2,
			'Expected update schedules to run again on the next tick',
		)
	}

	@Test
	useSystem_throwsAfterRun() {
		const sched = scheduler()

		Assert.throws(
			() => {
				sched.run()
				sched.useSystem('update', () => {})
			},
			undefined,
			'Expected useSystem to throw after run',
		)
	}

	@Test
	useSystemChain_throwsAfterRun() {
		const sched = scheduler()

		Assert.throws(
			() => {
				sched.run()
				sched.useSystemChain('update', [() => {}])
			},
			undefined,
			'Expected useSystemChain to throw after run',
		)
	}

	@Test
	configureSet_throwsAfterRun() {
		const sched = scheduler()

		Assert.throws(
			() => {
				sched.run()
				sched.configureSet('update', systemSet('foo'), {})
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
		const sched = scheduler()
		const executionOrder: string[] = []

		sched
			.useSystemChain(
				'startup',
				systemNames.map((name) => () => executionOrder.push(name)),
			)
			.__runSchedule('startup')

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
		const sched = scheduler()
		const order: string[] = []

		sched
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
		const sched = scheduler()
		const order: string[] = []

		sched
			.useSystem('first', () => order.push('first'))
			.useSystem('preUpdate', () => order.push('preUpdate'))
			.useSystem('update', () => order.push('update'))
			.useSystem('postUpdate', () => order.push('postUpdate'))
			.useSystem('last', () => order.push('last'))
			.__tick()

		Assert.equal(
			order.join(', '),
			'first, preUpdate, update, postUpdate, last',
			'Heartbeat group ordering not respected',
		)
	}

	@Test
	useSystem_before_isRespected() {
		const sched = scheduler()
		const order: string[] = []
		const A = () => order.push('A')
		const B = () => order.push('B')

		sched
			.useSystem('startup', A, { before: B })
			.useSystem('startup', B)
			.__runSchedule('startup')

		Assert.true(
			order.indexOf('A') < order.indexOf('B'),
			'A should run before B',
		)
	}

	@Test
	useSystem_after_isRespected() {
		const sched = scheduler()
		const order: string[] = []
		const A = () => order.push('A')
		const B = () => order.push('B')

		sched
			.useSystem('startup', A)
			.useSystem('startup', B, { after: A })
			.__runSchedule('startup')

		Assert.true(order.indexOf('A') < order.indexOf('B'), 'B should run after A')
	}

	@Test
	useSystem_orderingIsTransitive() {
		const sched = scheduler()
		const order: string[] = []

		const a = () => order.push('a')
		const b = () => order.push('b')
		const c = () => order.push('c')

		sched
			.useSystem('startup', a, { before: b })
			.useSystem('startup', b, { before: c })
			.useSystem('startup', c)
			.__runSchedule('startup')

		Assert.true(
			order.indexOf('a') < order.indexOf('b') &&
				order.indexOf('b') < order.indexOf('c') &&
				order.indexOf('a') < order.indexOf('c'),
			'Transitive ordering failed',
		)
	}

	@Test
	useSystemChain_before_respectsImplicidWithExplicitOrdering() {
		const sched = scheduler()
		const order: string[] = []

		const thirdParty = () => order.push('third-party')
		const a = () => order.push('a')
		const b = () => order.push('b')
		const c = () => order.push('c')

		sched
			.useSystem('startup', thirdParty)
			.useSystemChain('startup', [[a, { before: thirdParty }], b, c])
			.__runSchedule('startup')

		const [extIdx, aIdx, bIdx, cIdx] = [
			order.indexOf('third-party'),
			order.indexOf('a'),
			order.indexOf('b'),
			order.indexOf('c'),
		]

		Assert.true(
			aIdx < extIdx && aIdx < bIdx && bIdx < cIdx,
			`Expected 'a' to come before 'b' and 'third-party',  got: '${order.join(' -> ')}'`,
		)
	}

	@Test
	useSystemChain_runIf_skipDoesNotAlterImplicitOrdering() {
		const sched = scheduler()
		const order: string[] = []

		const a = () => order.push('a')
		const b = () => order.push('b')
		const c = () => order.push('c')

		sched
			.useSystemChain('startup', [a, [b, { runIf: () => false }], c])
			.__runSchedule('startup')

		Assert.true(
			order.indexOf('a') < order.indexOf('c'),
			"Expected 'b' to be skipped while implicit ordering still places 'a' before 'c'",
		)
	}

	@Test
	useSystem_inSet_inheritsConstraints() {
		const sched = scheduler()
		const order: string[] = []

		const setA = systemSet('setA')
		const setB = systemSet('setB')

		const sysA = () => order.push('a')
		const sysB = () => order.push('b')

		sched
			.configureSet('startup', setA, { before: setB })
			.configureSet('startup', setB, {})
			.useSystem('startup', sysA, { inSet: setA })
			.useSystem('startup', sysB, { inSet: setB })
			.__runSchedule('startup')

		Assert.true(
			order.indexOf('a') < order.indexOf('b'),
			'Set ordering not inherited',
		)
	}

	@Test
	useSystem_inSet_inheritsSystemSetConfig() {
		const sched = scheduler()
		const order: string[] = []

		const network = systemSet('network')
		const input = systemSet('input')
		const combat = systemSet('combat')
		const audio = systemSet('audio')

		const fetchNetworkState = () => order.push('fetchNetworkState')
		const handlePlayerAttack = () => order.push('handlePlayerAttack')
		const playCombatSounds = () => order.push('playCombatSounds')

		sched
			.configureSet('startup', network, { before: input })
			.configureSet('startup', input, {})
			.configureSet('startup', combat, { before: audio })
			.configureSet('startup', audio, {})
			.useSystem('startup', playCombatSounds, { inSet: [audio] })
			.useSystem('startup', handlePlayerAttack, {
				inSet: [input, combat],
			})
			.useSystem('startup', fetchNetworkState, { inSet: [network] })
			.__runSchedule('startup')

		Assert.equal(
			order.join(', '),
			'fetchNetworkState, handlePlayerAttack, playCombatSounds',
			'System in multiple sets should inherit ordering from all its sets',
		)
	}

	@Test
	useSystem_runIf_falseSkipsSystem() {
		const sched = scheduler()
		let ran = false

		sched
			.useSystem('startup', () => (ran = true), { runIf: () => false })
			.__runSchedule('startup')

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
		const sched = scheduler()
		let ran = false

		const condSet = systemSet('condSet')

		sched
			.configureSet('startup', condSet, { runIf: () => setCond })
			.useSystem('startup', () => (ran = true), {
				inSet: condSet,
				runIf: () => sysCond,
			})
			.__runSchedule('startup')

		Assert.equal(
			ran,
			shouldRun,
			`Expected run state to be ${shouldRun} when set condition is ${setCond} and system condition is ${sysCond}`,
		)
	}

	@Test
	useSystem_runIf_skipDoesNotAlterOrdering() {
		const sched = scheduler()
		const order: string[] = []
		const a = () => order.push('a')
		const b = () => order.push('b')
		const c = () => order.push('c')

		sched
			.useSystem('startup', a)
			.useSystem('startup', b, { after: a, runIf: () => false })
			.useSystem('startup', c, { after: b })
			.__runSchedule('startup')

		Assert.true(
			order.indexOf('a') < order.indexOf('c'),
			"Expected 'a' to run before 'c', properly bypassing skipped system 'b'",
		)
	}

	@Test
	useSystem_circularDependencyThrowsOnRun() {
		const sched = scheduler()
		const a = () => {}
		const b = () => {}

		// Should not throw at registration time.
		sched
			.useSystem('startup', a, { before: b })
			.useSystem('startup', b, { before: a })

		Assert.throws(
			() => sched.run(),
			undefined,
			'Expected circular dependency to throw when run() is called',
		)
	}

	@Test
	configureSet_configuresPerSchedule() {
		const sched = scheduler()
		const sharedSet = systemSet('sharedSet')

		const result = new Set<string>()
		const preStartupSystem = () => result.add('preStartup')
		const startupSystem = () => result.add('startup')
		const preUpdateSystem = () => result.add('preUpdate')
		const updateSystem = () => result.add('update')
		const preSimulationSystem = () => result.add('preSimulation')
		const postSimulationSystem = () => result.add('postSimulation')

		sched
			.configureSet('preStartup', sharedSet, { runIf: () => false })
			.configureSet('preUpdate', sharedSet, { runIf: () => false })
			.configureSet('preSimulation', sharedSet, { runIf: () => false })
			.useSystem('preStartup', preStartupSystem, { inSet: sharedSet })
			.useSystem('startup', startupSystem, { inSet: sharedSet })
			.useSystem('preUpdate', preUpdateSystem, { inSet: sharedSet })
			.useSystem('update', updateSystem, { inSet: sharedSet })
			.useSystem('preSimulation', preSimulationSystem, { inSet: sharedSet })
			.useSystem('postSimulation', postSimulationSystem, { inSet: sharedSet })

		sched.__runSchedule('preStartup')
		sched.__runSchedule('startup')
		sched.__runSchedule('preUpdate')
		sched.__runSchedule('update')
		sched.__runSchedule('preSimulation')
		sched.__runSchedule('postSimulation')

		const expectedIncluded = ['startup', 'update', 'postSimulation']
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
		const sched = scheduler()
		const someSet = systemSet('someSet')

		const result: string[] = []
		const beforeSystem = () => result.push('before')
		const inSetSystem1 = () => result.push('inSet1')
		const inSetSystem2 = () => result.push('inSet2')
		const afterSystem = () => result.push('after')

		sched
			.useSystem('startup', beforeSystem, { before: someSet })
			.useSystem('startup', inSetSystem1, { inSet: someSet })
			.useSystem('startup', inSetSystem2, { inSet: someSet })
			.useSystem('startup', afterSystem, { after: someSet })
			.__runSchedule('startup')

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
		const sched = scheduler()
		function someSystem() {}

		sched.useSystem('startup', someSystem)

		Assert.throws(
			() => sched.useSystem('startup', someSystem),
			undefined,
			'Expected duplicate system registration to throw',
		)
	}

	@Test
	configureSet_duplicateThrows() {
		const sched = scheduler()
		const someSet = systemSet('someSet')

		sched.configureSet('startup', someSet, { before: [] })

		Assert.throws(
			() => sched.configureSet('startup', someSet, { before: [] }),
			undefined,
			'Expected duplicate set configuration to throw',
		)

		Assert.doesNotThrow(
			() => sched.configureSet('postStartup', someSet, { before: [] }),
			'Expected duplicate set configuration on different schedules to not throw',
		)
	}

	@Test
	useSystem_before_danglingDependencyThrowsOnRun() {
		const sched = scheduler()
		function someSystem() {}
		function danglingSystem() {} // Defined but never scheduled.

		// Should not throw at registration time.
		sched.useSystem('startup', someSystem, { before: danglingSystem })

		Assert.throws(
			() => sched.run(),
			undefined,
			"Expected a dangling dependency reference in 'before' to throw on run()",
		)
	}

	@Test
	useSystem_after_danglingDependencyThrowsOnRun() {
		const sched = scheduler()
		function someSystem() {}
		function danglingSystem() {} // Defined but never scheduled.

		// Should not throw at registration time.
		sched.useSystem('startup', someSystem, { after: danglingSystem })

		Assert.throws(
			() => sched.run(),
			undefined,
			"Expected a dangling dependency reference in 'after' to throw on run()",
		)
	}

	@Test
	useSystem_circularDependencyWithSetThrowsOnRun() {
		const sched = scheduler()
		const setS = systemSet('setS')

		const a = () => {}
		const b = () => {}

		sched
			.useSystem('startup', a, { before: setS })
			.useSystem('startup', b, { inSet: setS, before: a })

		Assert.throws(
			() => sched.run(),
			undefined,
			'Expected cross-level circular dependency (system -> set -> member system -> system) to throw on run()',
		)
	}

	@Test
	scheduler_instantiatingTwiceThrows() {
		scheduler()

		Assert.throws(
			() => scheduler(),
			undefined,
			'Expected instantiating the scheduler twice to throw an error',
		)
	}

	@Test
	run_callingTwiceThrows() {
		const sched = scheduler()

		Assert.throws(
			() => {
				sched.run()
				sched.run()
			},
			undefined,
			'Expected calling run() twice to throw an error',
		)
	}

	@Test
	useSystem_spawnsSystemEntity() {
		const sched = scheduler()
		const systemFn = () => {}

		sched.useSystem('startup', systemFn)

		Assert.true(
			query(Builtin.System).find((_e, sys) => sys.fn === systemFn) !==
				undefined,
			'Expected useSystem to spawn a system entity',
		)
	}

	@Test
	useSystem_entityLabelIsInferred() {
		const sched = scheduler()
		function weirdlyNamedSystem() {}

		sched.useSystem('startup', weirdlyNamedSystem)

		Assert.true(
			query(Builtin.System).find(
				(e) => tostring(e) === 'weirdlyNamedSystem',
			) !== undefined,
			'Expected useSystem to infer the entity label from the function name',
		)
	}

	@Test
	scheduler_spawnsScheduleEntities() {
		scheduler()

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
		const sched = scheduler()
		const systemFn = () => {}

		sched.useSystem('startup', systemFn)

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
		const sched = scheduler()
		const order: string[] = []

		function somePlugin(scheduler: Scheduler) {
			order.push('plugin')
			scheduler.useSystem('preStartup', () => order.push('pluginSystem'))
		}

		sched
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
		const sched = scheduler()
		const someObject = { foo: 'bar' }
		const expectedArgs: unknown[] = ['arg1', undefined, 2, someObject]
		const actualArgs: unknown[] = []

		function somePlugin(_s: Scheduler, ...args: unknown[]) {
			actualArgs[0] = args[0]
			actualArgs[1] = args[1]
			actualArgs[2] = args[2]
			actualArgs[3] = args[3]
		}

		sched.usePlugin(somePlugin, 'arg1', undefined, 2, someObject).run()

		Assert.true(
			actualArgs.size() === expectedArgs.size() &&
				(actualArgs as defined[]).every((arg, i) => arg === expectedArgs[i]),
			`Expected plugin to forward ${expectedArgs[0]}, ${expectedArgs[1]}, ${expectedArgs[2]}, ${expectedArgs[3]}` +
				`, got ${actualArgs[0]}, ${actualArgs[1]}, ${actualArgs[2]}, ${actualArgs[3]}`,
		)
	}

	@Test
	usePlugin_nestedPluginsCorrectlyScheduleSystems() {
		const sched = scheduler()
		const order: string[] = []

		function childPlugin(scheduler: Scheduler) {
			scheduler.useSystem('postStartup', () => order.push('child'))
		}

		function parentPlugin(scheduler: Scheduler) {
			scheduler
				.usePlugin(childPlugin)
				.useSystem('startup', () => order.push('parent'))
		}

		sched.usePlugin(parentPlugin).run()

		Assert.true(
			order[0] === 'parent' && order[1] === 'child',
			'Expected parent and child plugins to both schedule systems in the correct order',
		)
	}

	@Test
	usePlugin_userOverwritingUserPluginThrows() {
		const sched = scheduler()
		function somePlugin(_s: Scheduler) {}

		Assert.throws(
			() => sched.usePlugin(somePlugin).usePlugin(somePlugin).run(),
			undefined,
			'Expected usePlugin to throw when a user tries to overwrite the same user plugin',
		)
	}

	@Test
	usePlugin_thirdPartyOverwritingThirdPartyPluginWithSameArgsDoesNotThrow() {
		const sched = scheduler()
		function somePlugin(_s: Scheduler, _n: number) {}

		Assert.doesNotThrow(() =>
			Toucan.__simulateThirdParty(() =>
				sched.usePlugin(somePlugin, 1).usePlugin(somePlugin, 1).run(),
			),
		)
	}

	@Test
	usePlugin_thirdPartyOverwritingThirdPartyPluginWithDifferentArgsThrows() {
		const sched = scheduler()
		function somePlugin(_s: Scheduler, _n: number) {}

		Assert.throws(
			() =>
				Toucan.__simulateThirdParty(() =>
					sched.usePlugin(somePlugin, 1).usePlugin(somePlugin, 2).run(),
				),
			undefined,
			'Expected usePlugin to throw when a third-party tries to overwrite the same third-party plugin with different arguments',
		)
	}

	@Test
	entity_addedByPluginHasRelationship() {
		const sched = scheduler()
		function someSystem() {}

		function childPlugin(s: Scheduler) {
			s.useSystem('startup', someSystem)
		}

		function parentPlugin(s: Scheduler) {
			entity('addedByPlugin')
			s.usePlugin(childPlugin)
		}

		sched.usePlugin(parentPlugin).run()

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
		const sched = scheduler()
		const order: string[] = []
		const someSet = systemSet('someSet')

		const before = () => order.push('before')
		const inSet = () => order.push('inSet')
		const after = () => order.push('after')

		sched
			.configureSet('startup', someSet, { after: before, before: after })
			.useSystem('startup', before)
			.useSystem('startup', inSet, { inSet: someSet })
			.useSystem('startup', after)
			.__runSchedule('startup')

		Assert.true(
			order.indexOf('before') < order.indexOf('inSet') &&
				order.indexOf('inSet') < order.indexOf('after'),
			"Expected set to respect 'after' and 'before' SystemFn constraints",
		)
	}

	@Test
	configureSet_before_systemFn_appliesToAllSetMembers() {
		const sched = scheduler()
		const order: string[] = []
		const someSet = systemSet('someSet')

		const inSet1 = () => order.push('inSet1')
		const inSet2 = () => order.push('inSet2')
		const afterSystem = () => order.push('after')

		sched
			.configureSet('startup', someSet, { before: afterSystem })
			.useSystem('startup', inSet1, { inSet: someSet })
			.useSystem('startup', inSet2, { inSet: someSet })
			.useSystem('startup', afterSystem)
			.__runSchedule('startup')

		Assert.true(
			order.indexOf('inSet1') < order.indexOf('after') &&
				order.indexOf('inSet2') < order.indexOf('after'),
			"Expected every set member to run before the standalone system specified in 'before'",
		)
	}

	@Test
	configureSet_before_mixedSystemFnAndSetTargets_isRespected() {
		const sched = scheduler()
		const order: string[] = []
		const setA = systemSet('setA')
		const setB = systemSet('setB')

		const inSetA = () => order.push('inSetA')
		const inSetB = () => order.push('inSetB')
		const standalone = () => order.push('standalone')

		sched
			.configureSet('startup', setA, { before: [setB, standalone] })
			.useSystem('startup', inSetA, { inSet: setA })
			.useSystem('startup', inSetB, { inSet: setB })
			.useSystem('startup', standalone)
			.__runSchedule('startup')

		Assert.true(
			order.indexOf('inSetA') < order.indexOf('inSetB') &&
				order.indexOf('inSetA') < order.indexOf('standalone'),
			"Expected set members to run before both a SystemSet and a standalone SystemFn specified in 'before'",
		)
	}

	@Test
	configureSet_before_danglingSystemFnThrowsOnRun() {
		const sched = scheduler()
		const someSet = systemSet('someSet')
		function unscheduledSystem() {}

		sched
			.configureSet('startup', someSet, { before: unscheduledSystem })
			.useSystem('startup', () => {}, { inSet: someSet })

		Assert.throws(
			() => sched.run(),
			undefined,
			"Expected a dangling SystemFn reference in a set's 'before' to throw on run()",
		)
	}

	@Test
	configureSet_circularDependencyWithSystemFnThrowsOnRun() {
		const sched = scheduler()
		const someSet = systemSet('someSet')

		const a = () => {}
		const b = () => {}

		sched
			.useSystem('startup', a, { before: someSet })
			.useSystem('startup', b, { inSet: someSet })
			.configureSet('startup', someSet, { before: a })

		Assert.throws(
			() => sched.run(),
			undefined,
			'Expected a circular dependency between a set and a standalone system to throw on run()',
		)
	}

	@Test
	useSystem_label_addsLabelToSystemEntity() {
		const sched = scheduler()
		const label = 'verySpecificSystemLabel'
		const systemFn = () => {}

		sched.useSystem('startup', systemFn, { label })

		const systemData = query(Builtin.System).find(
			(e) => e.toString() === label,
		)?.[1]

		Assert.true(
			systemData !== undefined,
			`Expected a system entity with label '${label}' to be created`,
		)

		Assert.equal(
			systemData!.fn,
			systemFn,
			`Expected system entity with label '${label}' to have function '${systemFn}'`,
		)
	}

	@Test
	useSystem_args_areForwardedToSystemFn() {
		const sched = scheduler()
		const received: unknown[] = []

		sched
			.useSystem(
				'startup',
				(...args: unknown[]) => {
					received[0] = args[0]
					received[1] = args[1]
					received[2] = args[2]
				},
				{ args: ['hello', undefined, 42] },
			)
			.__runSchedule('startup')

		Assert.equal(received[0], 'hello', 'Expected first arg to be "hello"')
		Assert.equal(received[1], undefined, 'Expected second arg to be undefined')
		Assert.equal(received[2], 42, 'Expected third arg to be 42')
		Assert.equal(received.size(), 3, 'Expected exactly 3 args')
	}

	@Test
	useSystem_args_defaultToEmptyWhenOmitted() {
		const sched = scheduler()
		let argCount = -1

		sched
			.useSystem('startup', (...args: unknown[]) => {
				argCount = args.size()
			})
			.__runSchedule('startup')

		Assert.equal(
			argCount,
			0,
			'Expected system to receive no args when none are configured',
		)
	}

	@Test
	useSystem_args_objectReferenceIsPreserved() {
		const sched = scheduler()
		const shared = { count: 0 }

		sched
			.useSystem(
				'startup',
				(obj: typeof shared) => {
					obj.count = 99
				},
				{ args: [shared] },
			)
			.__runSchedule('startup')

		Assert.equal(
			shared.count,
			99,
			'Expected mutation through arg to affect the original object (same reference)',
		)
	}
}

export = SchedulerTests
