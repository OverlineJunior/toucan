import PlanckJabby from "@rbxts/planck-jabby"
import { Scheduler } from "../../scheduler"
import { Plugin } from "@rbxts/planck"



export function jabbyPlugin(scheduler: Scheduler) {
    scheduler.planckScheduler.addPlugin(new PlanckJabby() as Plugin<unknown[]>)
}