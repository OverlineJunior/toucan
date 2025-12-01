import { App } from './app'

export interface Plugin {
	build(app: App): void
}
