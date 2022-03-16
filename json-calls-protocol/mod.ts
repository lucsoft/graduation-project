// deno-lint-ignore-file no-explicit-any
import { JsonCallsAction, CallParametersScoped, StateType } from "./JsonCallsAction.ts";
import { buildInIds, CallParameters, CallStep, CallStepId, Step } from "./spec.ts";

export class JsonCalls {
    native = new Map<string, () => JsonCallsAction>();
    steps = new Map<string, Step>();

    async singleRun({ id, paramter, branch, condition }: CallStep, state: StateType): Promise<void> {
        state._counter++;
        console.log(`%cRun@JsonCalls: ${id} \t${Deno.inspect(state)} ${Deno.inspect(paramter)}`, "color: gray");
        if (!id.includes(".")) throw new Error();
        const [ type, stepID ] = id.split(".");
        if (type == "native") {
            const func = this.paramter(paramter!, state);
            if (func == undefined) throw new Error();
            const action = this.native.get(stepID)?.()[ func.name ];
            if (action == null) throw new Error();
            if (typeof action != "function") {
                state._responses.set(state._counter, action);
                return;
            }
            return await action();
        }
        if (type == "buildIn") {
            if (paramter === undefined) throw new Error();
            switch (stepID as buildInIds) {
                case "sleep":
                    await new Promise<void>(done => setTimeout(() => done(), this.paramter(paramter, state, "number", "amount")?.value))
                    return;
                case "variable": {
                    const list = paramter.map(x => this.paramter(paramter, state, x.type, x.name)) as (CallParameters | undefined | null)[]
                    if (list.includes(undefined) || list.includes(null)) throw new Error();
                    state._responses.set(state._counter, list.map((x) => state[ x!.name ] = x!.value as unknown as string)[ 0 ]);
                    return;
                }
                case "truthy": {
                    const rsp = this.paramter(paramter, state, "boolean", "value")?.value;
                    state._responses.set(state._counter, !!rsp);
                    return;
                }
                case "falsy": {
                    const rsp = this.paramter(paramter, state, "boolean", "value")?.value;
                    state._responses.set(state._counter, !rsp);
                    return;
                } case "if": {
                    if (branch === undefined || condition === undefined) throw new Error();
                    await this.singleRun({ ...condition, paramter: paramter }, state);
                    const getter = state._responses.get(state._counter);
                    if (getter == null) throw new Error();
                    for (const iterator of getter ? branch.true : branch.false) {
                        await this.singleRun(iterator, state)
                    }
                    return;
                }
                default:
                    throw new Error();
            }
        }
        throw new Error();
    }
    paramter<Type extends "number" | "boolean" | "string" | "function">(data: CallParameters[], state: StateType, type?: Type, name?: string): (Type extends undefined ? CallParameters : CallParametersScoped<Type>) | undefined {
        const rsp = data.find(x => (name === undefined ? true : x.name == name) && type === undefined ? true : x.type == type) as CallParameters;
        if (rsp == null) throw new Error("Failed to find target");
        if (typeof rsp.value == "object") {
            switch (rsp.value.type) {
                case "variable":
                    if (!Object.hasOwn(state, rsp.value.id)) throw new Error();
                    return { ...rsp, value: state[ rsp.value.id ] } as any;
                case "paramter":
                    throw new Error("not implemented")
                case "response": {
                    if (!state._responses.has(rsp.value.id)) throw new Error();
                    return { ...rsp, value: state._responses.get(rsp.value.id) } as any;
                }
            }
        }
        return { ...rsp } as any;
    }
    streamRun(id: CallStepId) {
        console.log(`%cStreamRun@JsonCalls: ${id}`, "color: gray");
        if (!id.startsWith("step.")) throw new Error("Not starting with step.");
        const [ _, stepId ] = id.split(".");
        const step = this.steps.get(stepId);
        if (step === undefined || step.actions === undefined || step.actions === "native") throw new Error("invalid data")
        const state = {
            ...step.variables ?? {},
            _counter: 0,
            _responses: new Map<number, any>(),
        }
        return new ReadableStream<StateType>({
            start: async (controller) => {
                for (const iterator of step.actions) {
                    if (typeof iterator === "string") return controller.error("Failed");
                    await this.singleRun(iterator, state);
                    controller.enqueue({ ...state });
                }
                controller.close()
            }
        })
    }
    getStepFromIndex(index: number) {
        return Array.from(this.steps.values())[ index ];
    }
}