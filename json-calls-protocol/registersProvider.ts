import { JsonCalls } from "./mod.ts";
import { CallParameters } from "./spec.ts";

export function registerProvider(jcall: JsonCalls) {
    jcall.provider.set("buildIn.sleep", async ({ amount }) => {
        if (typeof amount.value != "number") throw new Error("failed");
        await new Promise<void>(done => setTimeout(() => done(), (amount.value as number) * 1000))
        return undefined;
    })
    jcall.provider.set("buildIn.variable", (paras, { state, step: { paramter } }) => {
        const list = paramter?.map(x => paras[ x.name ]) as (CallParameters | undefined | null)[]
        if (list.includes(undefined) || list.includes(null)) throw new Error();
        return list.map((x) => state[ x!.name ] = x!.value as unknown as string)[ 0 ];
    })
    jcall.provider.set("buildIn.truthy", ({ value }) => {
        return !!value.value;
    })
    jcall.provider.set("buildIn.falsy", ({ value }) => {
        return !value.value;
    })
    jcall.provider.set("buildIn.if", async (_, { controller, state, step: { paramter, condition, branch } }) => {
        if (branch === undefined || condition === undefined) throw new Error();
        await jcall.singleRun(controller, { ...condition, paramter: paramter }, state);
        const getter = state._responses.get(state._trace);
        if (getter == null) throw new Error();
        state._callsLeft -= (!getter ? branch.true : branch.false).map(x => jcall.getSizeInCall(x)).reduce((partialSum, a) => partialSum + a.length, 0);
        for (const iterator of getter ? branch.true : branch.false) {
            await jcall.singleRun(controller, iterator, state)
        }
        return undefined;
    })
}