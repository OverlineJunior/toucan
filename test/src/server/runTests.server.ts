// import { TestRunner } from '@rbxts/lunit'
// import { ServerScriptService } from '@rbxts/services'
//
// new TestRunner([ServerScriptService.server], '.+%.test$').run()

import { component, entity, query } from '@rbxts/toucan'

const Foo = component('Foo')
const Bar = component('Bar')
const Baz = component('Baz')

entity().set(Foo).set(Bar).set(Baz)

query(Foo).withoutAll(Bar, Baz).forEach(() => print('Match!'))
