import { Assert, BeforeEach, Test } from '@rbxts/lunit'
import { Each } from '@rbxts/lunit/out/lib/decorator'
import {
	External,
	Internal,
	query,
	scheduler,
	systemSet,
	Wildcard,
} from '@rbxts/toucan'
import type { Schedules } from '../../../out/scheduler'

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
	run_startupSchedulesRunOnce() {
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
	run_updateSchedulesRunMultipleTimes() {
		const scheds: Schedules[] = [
			'first',
			'preUpdate',
			'update',
			'postUpdate',
			'last',
		]
		let counter = 0
		const sched = scheduler()
		scheds.forEach((s) => {
			sched.useSystem(s, () => counter++)
		})
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
		const sched = scheduler()
		sched.useSystemChain(
			'startup',
			...systemNames.map((name) => () => executionOrder.push(name)),
		)
		sched.run()

		Assert.equal(
			executionOrder.join(),
			systemNames.join(),
			'Expected systems to execute in the exact order they were registered\n' +
				`Expected: ${systemNames.join()}\n` +
				`Got: ${executionOrder.join()}`,
		)
	}

	@Test
	run_startupOrdering() {
		const order: string[] = []
		const sched = scheduler()
		sched.useSystem('preStartup', () => order.push('preStartup'))
		sched.useSystem('startup', () => order.push('startup'))
		sched.useSystem('postStartup', () => order.push('postStartup'))
		sched.run()
		Assert.equal(
			order.join(', '),
			'preStartup, startup, postStartup',
			'Schedule group ordering not respected',
		)
	}

	@Test
	run_updateOrdering() {
		const order: string[] = []
		const sched = scheduler()
		sched.useSystem('first', () => order.push('first'))
		sched.useSystem('preUpdate', () => order.push('preUpdate'))
		sched.useSystem('update', () => order.push('update'))
		sched.useSystem('postUpdate', () => order.push('postUpdate'))
		sched.useSystem('last', () => order.push('last'))
		sched.run()
		task.wait(SCHEDULE_SETTLE_DELAY)
		Assert.true(
			order.indexOf('first') < order.indexOf('preUpdate') &&
				order.indexOf('preUpdate') < order.indexOf('update') &&
				order.indexOf('update') < order.indexOf('postUpdate') &&
				order.indexOf('postUpdate') < order.indexOf('last'),
			'Heartbeat group ordering not respected',
		)
	}

	// ---
	// Ordering Constraints
	// ---

	@Test
	ordering_before_is_respected() {
		const order: string[] = []
		const A = () => order.push('A')
		const B = () => order.push('B')
		const sched = scheduler()
		sched.useSystem('startup', A, { before: B })
		sched.useSystem('startup', B)
		sched.run()
		Assert.true(
			order.indexOf('A') < order.indexOf('B'),
			'A should run before B',
		)
	}

	@Test
	ordering_after_is_respected() {
		const order: string[] = []
		const A = () => order.push('A')
		const B = () => order.push('B')
		const sched = scheduler()
		sched.useSystem('startup', A)
		sched.useSystem('startup', B, { after: A })
		sched.run()
		Assert.true(
			order.indexOf('A') < order.indexOf('B'),
			'A should run before B (after)',
		)
	}

	@Test
	ordering_transitive() {
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
	ordering_before_SystemSet_expands() {
		const order: string[] = []
		const SetA = systemSet('SetA')
		const sysA = () => order.push('A')
		const sysB = () => order.push('B')
		const sysC = () => order.push('C')
		const sched = scheduler()
		sched.configureSet('startup', SetA, {})
		sched.useSystem('startup', sysA, { before: SetA })
		sched.useSystem('startup', sysB, { inSet: SetA })
		sched.useSystem('startup', sysC, { inSet: SetA })
		sched.run()
		const idxA = order.indexOf('A')
		const idxB = order.indexOf('B')
		const idxC = order.indexOf('C')
		Assert.true(idxA < idxB && idxA < idxC, 'before(SystemSet) not respected')
	}

	@Test
	ordering_after_SystemSet_expands() {
		const order: string[] = []
		const SetA = systemSet('SetA')
		const sysA = () => order.push('A')
		const sysB = () => order.push('B')
		const sysC = () => order.push('C')
		const sched = scheduler()
		sched.configureSet('startup', SetA, {})
		sched.useSystem('startup', sysA, { after: SetA })
		sched.useSystem('startup', sysB, { inSet: SetA })
		sched.useSystem('startup', sysC, { inSet: SetA })
		sched.run()
		const idxA = order.indexOf('A')
		const idxB = order.indexOf('B')
		const idxC = order.indexOf('C')
		Assert.true(idxA > idxB && idxA > idxC, 'after(SystemSet) not respected')
	}

	// ---
	// System Sets
	// ---

	@Test
	systemSet_inherits_constraints() {
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
	runIf_falseSkipsSystem() {
		let ran = false
		const sched = scheduler()
		sched.useSystem('startup', () => (ran = true), { runIf: () => false })
		sched.run()
		Assert.false(ran, 'System should be skipped when runIf is false')
	}

	@Test
	@Each([
		[true, true, true],
		[true, false, false],
		[false, true, false],
		[false, false, false],
	])
	runIf_setAndSystemConditionsAreAnded(
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
	runIf_skipDoesNotAlterOrdering() {
		const order: string[] = []
		const A = () => order.push('A')
		const B = () => order.push('B')
		const C = () => order.push('C')

		const sched = scheduler()

		sched.useSystem('startup', A)
		sched.useSystem('startup', B, { after: A, runIf: () => false })
		sched.useSystem('startup', C, { after: B })

		sched.run()

		Assert.equal(
			order.join(', '),
			'A, C',
			'Expected A to run before C, properly bypassing skipped system B',
		)
	}

	@Test
	run_circularDependencyThrows() {
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

		const expected = ['startup', 'update', 'preRender']
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

		expected.forEach((str) =>
			Assert.true(result.has(str), `Expected result to contain ${str}`),
		)
	}

	@Test
	configureSet_isNotRequired() {
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
	configMerging_concatenatesArrayConstraints() {
		const order: string[] = []
		const sysA = () => order.push('A')
		const sysB = () => order.push('B')
		const sysC = () => order.push('C')
		const targetSys = () => order.push('Target')

		const sched = scheduler()

		sched.useSystem('startup', sysA)
		sched.useSystem('startup', sysB)
		sched.useSystem('startup', sysC)

		sched.useSystem('startup', targetSys, { after: sysA })
		sched.useSystem('startup', targetSys, { after: sysB })
		sched.useSystem('startup', targetSys, { before: sysC })

		sched.run()

		const targetIdx = order.indexOf('Target')
		Assert.true(
			targetIdx > order.indexOf('A') &&
				targetIdx > order.indexOf('B') &&
				targetIdx < order.indexOf('C'),
			'Expected re-scheduled system to merge its before/after dependencies',
		)
	}

	@Test
	run_danglingDependencyThrows() {
		const sched = scheduler()

		function someSystem() {}
		function danglingSystem() {} // Defined but never scheduled.

		// Should not throw at registration time.
		sched.useSystem('startup', someSystem, { before: danglingSystem })

		Assert.throws(
			() => sched.run(),
			undefined,
			'Expected a dangling dependency reference (unscheduled system) to throw on run()',
		)
	}

	// TODO! Plugins should be built before the scheduler is run.

	// TODO! useSystem/useSystemChain/configureSet's configs should work as intended.
}

export = SchedulerTests
