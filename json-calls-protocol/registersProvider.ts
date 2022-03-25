// deno-lint-ignore-file no-explicit-any
import { assert, unreachable } from "https://deno.land/std@0.130.0/testing/asserts.ts";
import { JsonCalls } from "./mod.ts";
import { State } from "./spec.ts";

export function registerProvider(jcall: JsonCalls) {
    jcall.provider.set("buildIn.sleep", async ({ amount }) => {
        assert(typeof amount.value == "number")
        await new Promise<void>(done => setTimeout(() => done(), (amount.value as number) * 1000))
        return undefined;
    })
    jcall.provider.set("buildIn.variable", ({ source, target }, { state }) => {
        assert(source && target);
        assert(typeof target.value == "string")
        state[ target.value ] = source.value as any;
        return state[ target.value ] as any;
    })
    jcall.provider.set("buildIn.multiVariables", ({ store }, { state }) => {
        assert(store.type == "key-value")
        for (const [ id, data ] of store.value) {
            assert(!id.startsWith("_"));
            state[ id ] = data as any;
        }
        return undefined;
    })
    jcall.provider.set("buildIn.truthy", ({ value }) => {
        return !!value.value;
    })
    jcall.provider.set("buildIn.falsy", ({ value }) => {
        return !value.value;
    })
    jcall.provider.set("buildIn.try", async ({ tries }, { controller, step, state }) => {
        assert(typeof tries.value == "number")
        for (let index = tries.value; index != 0;) {
            for (const element of step.branch!.try) {
                controller?.enqueue({
                    ...state,
                    _masterTrace: state._trace,
                    _trace: element.trace ?? state._trace,
                    _status: (tries.value - index) / tries.value
                } as State);
                try {
                    await jcall.run(undefined, element, state);
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
        unreachable();
    })
    jcall.provider.set("buildIn.repeat", async ({ count }, { controller, step: { branch, trace }, state }) => {
        assert(typeof count.value == "number")
        let counter = 0;
        const clonedState = {
            _callsLeft: state._callsLeft + 1,
            _responses: state._responses,
            _trace: trace ?? "0",
            _masterTrace: trace ?? "0",
            _status: 0.0001
        } as State;
        controller?.enqueue(clonedState);
        for (let index = 0; index < count.value; index++) {
            const newVariable = Object.values(branch!.repeating);
            for (let innerIndex = 0; innerIndex < newVariable.length; innerIndex++) {
                const element = newVariable[ innerIndex ];
                const clonedState = {
                    _callsLeft: state._callsLeft + 1,
                    _responses: state._responses,
                    _trace: element.trace ?? "0",
                    _masterTrace: trace ?? "0",
                    _status: counter / (count.value * newVariable.length)
                } as State;
                counter++;
                controller?.enqueue(clonedState);
                await jcall.run(undefined, element, clonedState);
            }
        }
        return undefined;
    })
    jcall.provider.set("buildIn.if", async (_, { controller, state, step: { parameter, condition, branch } }) => {
        assert(branch && condition);
        await jcall.run(controller, { ...condition, parameter }, state);
        const getter = state._responses.get(condition.trace ?? unreachable());
        assert(getter !== undefined);
        state._callsLeft -= (!getter ? branch.true : branch.false).map(x => jcall.getSizeInStep(x)).reduce((partialSum, a) => partialSum + a.length, 0);
        for (const iterator of getter ? branch.true : branch.false) {
            await jcall.run(controller, iterator, state)
        }
        return undefined;
    })
}