// import { TestRunner } from '@rbxts/lunit'
// import { ServerScriptService } from '@rbxts/services'
//
// new TestRunner([ServerScriptService.server], '.+%.test$').run()

import { component, message, query, scheduler } from '@rbxts/toucan'

const Fired = component('Fired')

function systemA() {
	query()
		.on(Fired)
		.forEach(() => {
			print('SystemA')
		})
}

let n = 0
function systemB() {
	if (n === 50) {
		message().set(Fired).emit()
	}

	n += 1
}

function systemC() {
	query()
		.on(Fired)
		.forEach((a, b) => {
			print('SystemC')
		})
}

scheduler().useSystemChain('update', [systemA, systemB, systemC]).run()
