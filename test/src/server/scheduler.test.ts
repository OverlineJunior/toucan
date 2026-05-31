import { Assert, BeforeEach, Test } from '@rbxts/lunit'
import { Each } from '@rbxts/lunit/out/lib/decorator'
import {
	External,
	Internal,
	query,
	type Schedules,
	scheduler,
	systemSet,
	Wildcard,
} from '@rbxts/toucan'

// This is enough time for all of the RunService schedules to run at least once.
const SCHEDULE_SETTLE_DELAY = 0.5

class SchedulerTests {
	@BeforeEach
	reset() {
		query(Wildcard)
			.filter((e) => !e.has(Internal) && !e.has(External))
			.collect() // We collect due to iterator invalidation; see issue #2.
			.forEach(([e]) => e.despawn())
	}

	@Test
	useSystem_startupSchedule_runsOnce() {
		const scheds: Schedules[] = ['preStartup', 'startup', 'postStartup']
		let counter = 0
		const sched = scheduler()
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
		const scheds: Schedules[] = [
			'first',
			'preUpdate',
			'update',
			'postUpdate',
			'last',
		]
		let counter = 0

		const sched = scheduler()
		scheds.forEach((s) => sched.useSystem(s, () => counter++))
		sched.run()

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
				const sched = scheduler()
				sched.run()
				sched.useSystem('update', () => {})
			},
			undefined,
			'Expected useSystem to throw after run',
		)
	}

	@Test
	useSystemChain_throwsAfterRun() {
		Assert.throws(
			() => {
				const sched = scheduler()
				sched.run()
				sched.useSystemChain('update', () => {})
			},
			undefined,
			'Expected useSystemChain to throw after run',
		)
	}

	@Test
	configureSet_throwsAfterRun() {
		Assert.throws(
			() => {
				const sched = scheduler()
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
		const executionOrder: string[] = []

		scheduler()
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

		scheduler()
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

		scheduler()
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

		scheduler()
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

		scheduler()
			.useSystem('startup', A)
			.useSystem('startup', B, { after: A })
			.run()

		Assert.true(order.indexOf('A') < order.indexOf('B'), 'B should run after A')
	}

	@Test
	useSystem_orderingIsTransitive() {
		const order: string[] = []
		const A = () => order.push('A')
		const B = () => order.push('B')
		const C = () => order.push('C')
		const sched = scheduler()
		sched.useSystem('startup', A, { before: B })
		sched.useSystem('startup', B, { before: C })
		sched.useSystem('startup', C)
		sched.run()
		Assert.true(
			order.indexOf('A') < order.indexOf('B') &&
				order.indexOf('B') < order.indexOf('C') &&
				order.indexOf('A') < order.indexOf('C'),
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

		scheduler()
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

		scheduler()
			.useSystemChain('startup', a, [b, { runIf: () => false }], c)
			.run()

		Assert.true(
			order.indexOf('a') < order.indexOf('c'),
			"Expected 'b' to be skipped while implicit ordering still places 'a' before 'c'",
		)
	}

	@Test
	useSystem_inSet_inheritsConstraints() {
		const order: string[] = []
		const SetA = systemSet('SetA')
		const SetB = systemSet('SetB')
		const sysA = () => order.push('A')
		const sysB = () => order.push('B')
		const sched = scheduler()
		sched.configureSet('startup', SetA, { before: SetB })
		sched.configureSet('startup', SetB, {})
		sched.useSystem('startup', sysA, { inSet: SetA })
		sched.useSystem('startup', sysB, { inSet: SetB })
		sched.run()
		Assert.true(
			order.indexOf('A') < order.indexOf('B'),
			'Set ordering not inherited',
		)
	}

	@Test
	useSystem_inSet_inheritsSystemSetConfig() {
		const sched = scheduler()

		const NetworkSet = systemSet('NetworkSet')
		const InputSet = systemSet('InputSet')
		const CombatSet = systemSet('CombatSet')
		const AudioSet = systemSet('AudioSet')
		sched.configureSet('startup', NetworkSet, { before: InputSet })
		sched.configureSet('startup', InputSet, {})
		sched.configureSet('startup', CombatSet, { before: AudioSet })
		sched.configureSet('startup', AudioSet, {})

		const executionOrder: string[] = []
		const fetchNetworkState = () => executionOrder.push('fetchNetworkState')
		const handlePlayerAttack = () => executionOrder.push('handlePlayerAttack')
		const playCombatSounds = () => executionOrder.push('playCombatSounds')

		sched.useSystem('startup', playCombatSounds, { inSet: [AudioSet] })
		sched.useSystem('startup', handlePlayerAttack, {
			inSet: [InputSet, CombatSet],
		})
		sched.useSystem('startup', fetchNetworkState, { inSet: [NetworkSet] })

		sched.run()

		Assert.equal(
			executionOrder.join(', '),
			'fetchNetworkState, handlePlayerAttack, playCombatSounds',
			'System in multiple sets should inherit ordering from all its sets',
		)
	}

	@Test
	useSystem_runIf_falseSkipsSystem() {
		let ran = false

		scheduler()
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
		const sched = scheduler()
		const CondSet = systemSet('CondSet')
		let ran = false

		sched.configureSet('startup', CondSet, { runIf: () => setCond })
		sched.useSystem('startup', () => (ran = true), {
			inSet: CondSet,
			runIf: () => sysCond,
		})

		sched.run()

		Assert.equal(
			ran,
			shouldRun,
			`Expected run state to be ${shouldRun} when set condition is ${setCond} and system condition is ${sysCond}`,
		)
	}

	@Test
	useSystem_runIf_skipDoesNotAlterOrdering() {
		const order: string[] = []
		const A = () => order.push('A')
		const B = () => order.push('B')
		const C = () => order.push('C')

		const sched = scheduler()

		sched.useSystem('startup', A)
		sched.useSystem('startup', B, { after: A, runIf: () => false })
		sched.useSystem('startup', C, { after: B })

		sched.run()

		Assert.true(
			order.indexOf('A') < order.indexOf('C'),
			'Expected A to run before C, properly bypassing skipped system B',
		)
	}

	@Test
	useSystem_circularDependencyThrowsOnRun() {
		const sched = scheduler()
		const A = () => {}
		const B = () => {}

		// Should not throw at registration time.
		sched.useSystem('startup', A, { before: B })
		sched.useSystem('startup', B, { before: A })

		Assert.throws(
			() => sched.run(),
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

		scheduler()
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

		scheduler()
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

	// TODO! I changed my mind about this: we should only allow this internally,
	// and throw if it's attempted by the user.
	@Test
	useSystem_config_multipleCallsMergeConfig() {
		const order: string[] = []
		const sysA = () => order.push('A')
		const sysB = () => order.push('B')
		const sysC = () => order.push('C')
		const targetSys = () => order.push('Target')

		scheduler()
			.useSystem('startup', sysA)
			.useSystem('startup', sysB)
			.useSystem('startup', sysC)
			.useSystem('startup', targetSys, { after: sysA })
			.useSystem('startup', targetSys, { after: sysB })
			.useSystem('startup', targetSys, { before: sysC })
			.run()

		const targetIdx = order.indexOf('Target')
		Assert.true(
			targetIdx > order.indexOf('A') &&
				targetIdx > order.indexOf('B') &&
				targetIdx < order.indexOf('C'),
			'Expected re-scheduled system to merge its before/after dependencies',
		)
	}

	@Test
	useSystem_before_danglingDependencyThrowsOnRun() {
		function someSystem() {}
		function danglingSystem() {} // Defined but never scheduled.

		const sched = scheduler()
			// Should not throw at registration time.
			.useSystem('startup', someSystem, { before: danglingSystem })

		Assert.throws(
			() => sched.run(),
			undefined,
			"Expected a dangling dependency reference in 'before' to throw on run()",
		)
	}

	@Test
	useSystem_after_danglingDependencyThrowsOnRun() {
		function someSystem() {}
		function danglingSystem() {} // Defined but never scheduled.

		const sched = scheduler()
			// Should not throw at registration time.
			.useSystem('startup', someSystem, { after: danglingSystem })

		Assert.throws(
			() => sched.run(),
			undefined,
			"Expected a dangling dependency reference in 'after' to throw on run()",
		)
	}

	@Test
	useSystem_circularDependencyWithSetThrowsOnRun() {
		const SetS = systemSet('SetS')

		const A = () => {}
		const B = () => {}

		const sched = scheduler()
			.useSystem('startup', A, { before: SetS })
			.useSystem('startup', B, { inSet: SetS, before: A })

		Assert.throws(
			() => sched.run(),
			undefined,
			'Expected cross-level circular dependency (System -> Set -> member System -> System) to throw on run()',
		)
	}

	// TODO! Plugins should be built before the scheduler is run.

	// TODO! Systems and plugins added by plugins should be given `pair(ChildOf, parentPlugin)`.

	// TODO! Every system should have `pair(InSchedule, scheduleEntity)`.

	// TODO! Calling `scheduler()` more than once should throw an error.
}

export = SchedulerTests
