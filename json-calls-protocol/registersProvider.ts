import { JsonCalls } from "./mod.ts";
import { CallParameters, State } from "./spec.ts";

export function registerProvider(jcall: JsonCalls) {
    jcall.provider.set("buildIn.sleep", async ({ amount }) => {
        if (typeof amount.value != "number") throw new Error("failed");
        await new Promise<void>(done => setTimeout(() => done(), (amount.value as number) * 1000))
        return undefined;
    })
    jcall.provider.set("buildIn.variable", (paras, { state, step: { parameter } }) => {
        const list = parameter?.map(x => paras[ x.name ]) as (CallParameters | undefined | null)[]
        if (list.includes(undefined) || list.includes(null)) throw new Error();
        return list.map((x) => state[ x!.name ] = x!.value as unknown as string)[ 0 ];
    })
    jcall.provider.set("buildIn.truthy", ({ value }) => {
        return !!value.value;
    })
    jcall.provider.set("buildIn.falsy", ({ value }) => {
        return !value.value;
    })
    jcall.provider.set("buildIn.try", async ({ tries }, { controller, step, state }) => {
        if (typeof tries.value != "number") throw new Error();
        for (let index = tries.value; index != 0;) {
            for (const element of step.branch!.try) {
                controller?.enqueue({
                    ...state,
                    _masterTrace: state._trace,
                    _trace: element.trace ?? state._trace,
                    _status: (tries.value - index) / tries.value
                } as State);
                try {
                    await jcall.singleRun(undefined, element, state);
                    return undefined;
                } catch (_) {
                    index--;
                }
            }
        }
        controller?.enqueue({
            ...state,
            _trace: state._trace
        } as State);
        throw new Error("failed");
    })
    jcall.provider.set("buildIn.repeat", async ({ count }, { controller, step: { branch, trace }, state }) => {
        if (typeof count.value != "number") throw new Error();
        let counter = 0;
        for (let index = 0; index < count.value; index++) {
            const newVariable = Object.values(branch!.repeating);
            for (let innerIndex = 0; innerIndex < newVariable.length; innerIndex++) {
                const element = newVariable[ innerIndex ];
                const clonedState = {
                    _callsLeft: state._callsLeft,
                    _responses: state._responses,
                    _trace: element.trace ?? "0",
                    _masterTrace: trace ?? "0",
                    _status: counter / (count.value * newVariable.length)
                } as State;
                counter++;
                controller?.enqueue(clonedState);
                await jcall.singleRun(undefined, element, clonedState);
            }
        }
        return undefined;
    })
    jcall.provider.set("buildIn.if", async (_, { controller, state, step: { parameter, condition, branch } }) => {
        if (branch === undefined || condition === undefined) throw new Error();
        await jcall.singleRun(controller, { ...condition, parameter }, state);
        const getter = state._responses.get(state._trace);
        if (getter == null) throw new Error();
        state._callsLeft -= (!getter ? branch.true : branch.false).map(x => jcall.getSizeInCall(x)).reduce((partialSum, a) => partialSum + a.length, 0);
        for (const iterator of getter ? branch.true : branch.false) {
            await jcall.singleRun(controller, iterator, state)
        }
        return undefined;
    })
}