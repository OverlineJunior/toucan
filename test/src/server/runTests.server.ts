import { TestRunner } from '@rbxts/lunit'
import { ServerScriptService } from '@rbxts/services'

new TestRunner([ServerScriptService.server], '.+%.test$').run()
