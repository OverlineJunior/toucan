import { TestRunner } from '@rbxts/lunit'
import { ServerScriptService } from '@rbxts/services'

new TestRunner([ServerScriptService.server], '.+%.test$').run()

// import { Builtin, query } from '@rbxts/toucan'
//
// query(Builtin.Persistent)
// 	.show(Builtin.Internal, Builtin.Component)
// 	.forEach((e) => print(e))
//
// query(Builtin.Component)
// 	.show(Builtin.Internal)
// 	.forEach((e) => warn(e))
