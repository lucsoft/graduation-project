// deno-lint-ignore-file no-explicit-any
import { registerMetaCategory, registerMetaData } from "./registers.ts";
import { JResponse, ParamterWithData, StateType } from "./types.ts";
import { CallParameters, CallStep, CallStepId, Source, Step } from "./spec.ts";

export class JsonCalls {
    methodProvider = new Map<string, ((parameters: ParamterWithData) => JResponse | Promise<JResponse>)>();
    native = new Map<string, Step>();
    buildIn = new Map<string, Step>();
    steps = new Map<string, Step>();
    category = new Map<string, { de: string, en: string }>();
    language: "de" | "en" = "de";

    constructor() {
        registerMetaCategory(this.category);
        registerMetaData(this.buildIn);
    }

    async singleRun({ id, paramter, branch, condition }: CallStep, state: StateType): Promise<void> {
        state._counter++;
        console.log(`%cRun@JsonCalls: ${id} \t${Deno.inspect(state)} ${Deno.inspect(paramter)}`, "color: gray");
        if (!id.includes(".")) throw new Error();
        const [ type, stepID ] = id.split(".");
        if (type == "native") {
            const data = this.getParamters(paramter, state);
            const allParamterSet = this.native.get(stepID)?.parameters?.length ?? 0 === Object.keys(data).length;
            if (!allParamterSet) throw new Error(`Wrong Paramter(s) was set for Action ${stepID}.`);
            const privoder = this.methodProvider.get(stepID);
            if (privoder == undefined) throw new Error(`Can't find step '${stepID}'`);
            const action = privoder(data);
            if (action === null) throw new Error(`${stepID} failed with null!`);
            state._responses.set(state._counter, await action);
            return;
        }
        if (type == "buildIn") {
            if (paramter === undefined) throw new Error();
            // TODO: Move this methodProvider
            switch (stepID) {
                case "sleep":
                    await new Promise<void>(done => setTimeout(() => done(), this.getParamters(paramter, state).amount.value as number))
                    return;
                case "variable": {
                    const paras = this.getParamters(paramter, state);
                    const list = paramter.map(x => paras[ x.name ]) as (CallParameters | undefined | null)[]
                    if (list.includes(undefined) || list.includes(null)) throw new Error();
                    state._responses.set(state._counter, list.map((x) => state[ x!.name ] = x!.value as unknown as string)[ 0 ]);
                    return;
                }
                case "truthy": {
                    const rsp = this.getParamters(paramter, state).value.value;
                    state._responses.set(state._counter, !!rsp);
                    return;
                }
                case "falsy": {
                    const rsp = this.getParamters(paramter, state).value.value;
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

    getParamters(data: CallParameters[] | undefined, state: StateType): ParamterWithData {
        return data ? Object.fromEntries(data.map(({ name, type, value, hint }) => [ name, { type, value: this.getDataFromSource(value, state), hint } ])) : {};
    }

    getDataFromSource(data: string | number | boolean | Source | undefined, state: StateType) {
        if (typeof data === "object")
            switch (data.type) {
                case "variable":
                    if (!Object.hasOwn(state, data.id)) throw new Error();
                    return state[ data.id ];
                case "paramter":
                    throw new Error("not implemented")
                case "response": {
                    if (!state._responses.has(data.id)) throw new Error();
                    return state._responses.get(data.id);
                }
            }
        else
            return data;
    }

    streamRun(id: CallStepId) {
        console.log(`%cStreamRun@JsonCalls: ${id}`, "color: gray");
        if (!id.startsWith("step.")) throw new Error("Not starting with step.");
        const [ _, stepId ] = id.split(".");
        const step = this.steps.get(stepId);
        if (step === undefined || step.actions === undefined || step.actions === "native") throw new Error("invalid data")
        const state = {
            ...step.variables ?? {},
            _counter: -1,
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
    getMetaDataFromId(id: string) {
        return this.getStepMapFromType(id)?.get(id.split('.')[ 1 ])
    }
    getStepMapFromType(type: string) {
        switch (type.split('.')[ 0 ]) {
            case "buildIn":
                return this.buildIn;
            case "native":
                return this.native;
            case "step":
                return this.steps;
        }
    }
    getStepFromIndex(index: number): Step | null {
        return Array.from(this.steps.values())[ index ];
    }
}