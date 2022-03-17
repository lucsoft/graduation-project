// deno-lint-ignore-file no-explicit-any
import { registerMetaCategory, registerMetaData } from "./registers.ts";
import { JResponse, ParamterWithData } from "./types.ts";
import { CallParameters, CallStep, ActionId, Source, Step, State } from "./spec.ts";
export class JsonCalls {
    nativeActions = new Map<string, Step>();
    buildInActions = new Map<string, Step>();
    userActions = new Map<string, Step>();

    methodProvider = new Map<string, ((parameters: ParamterWithData) => JResponse | Promise<JResponse>)>();
    category = new Map<string, { de: string, en: string }>();
    language: "de" | "en" = "de";

    constructor() {
        registerMetaCategory(this.category);
        registerMetaData(this.buildInActions);
    }

    async singleRun(controller: ReadableStreamController<State>, { id, paramter, branch, condition }: CallStep, state: State): Promise<void> {
        state._counter++;
        state._callsLeft--;
        controller.enqueue({ ...state });
        if (!id.includes(".")) throw new Error();
        const [ type, stepID ] = id.split(".");
        if (type == "native") {
            const data = this.getParamters(paramter, state);
            const allParamterSet = this.nativeActions.get(stepID)?.parameters?.length ?? 0 === Object.keys(data).length;
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
                case "sleep": {
                    const param = this.getParamters(paramter, state).amount.value;
                    if (typeof param != "number") throw new Error("failed");
                    await new Promise<void>(done => setTimeout(() => done(), param * 1000))
                    return;
                }
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
                    await this.singleRun(controller, { ...condition, paramter: paramter }, state);
                    const getter = state._responses.get(state._counter);
                    if (getter == null) throw new Error();
                    state._callsLeft -= (!getter ? branch.true : branch.false).map(x => this.getSizeInCall(x)).reduce((partialSum, a) => partialSum + a.length, 0);
                    for (const iterator of getter ? branch.true : branch.false) {
                        await this.singleRun(controller, iterator, state)
                    }
                    return;
                }
                default:
                    throw new Error();
            }
        }
        throw new Error();
    }

    getParamters(data: CallParameters[] | undefined, state: State): ParamterWithData {
        return data ? Object.fromEntries(data.map(({ name, type, value, hint }) => [ name, { type, value: this.getDataFromSource(value, state), hint } ])) : {};
    }

    getDataFromSource(data: string | number | boolean | Source | undefined, state: State) {
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
    getSizeInCall(id: CallStep): unknown[] {
        const list: unknown[] = [ 1 ];
        if (id.condition) list.push(...this.getSizeInCall(id.condition));
        if (id.branch) list.push(...Object.values(id.branch).map(x => x.map(x => this.getSizeInCall(x).flat())).flat());
        return list.filter(x => x);
    }
    getSize(id: ActionId): number {
        const [ _, stepId ] = id.split(".");
        const step = this.userActions.get(stepId);
        if (step?.actions == "native") return 1;
        return step?.actions.map(x => this.getSizeInCall(x)).flat().length ?? -1;
    }
    streamRun(id: ActionId) {
        if (!id.startsWith("user.")) throw new Error("Not starting with user.");
        const [ _, stepId ] = id.split(".");
        const step = this.userActions.get(stepId);
        if (step === undefined || step.actions === undefined || step.actions === "native") throw new Error("invalid data")
        const state = {
            ...step.variables ?? {},
            _counter: -1,
            _callsLeft: this.getSize(id),
            _responses: new Map<number, any>(),
        }
        return new ReadableStream<State>({
            start: async (controller) => {
                for (const iterator of step.actions) {
                    if (typeof iterator === "string") return controller.error("Failed");
                    await this.singleRun(controller, iterator, state);
                }
                controller.close()
            }
        }, { highWaterMark: 0 })
    }
    getMetaDataFromId(id: string) {
        return this.getStepMapFromType(id)?.get(id.split('.')[ 1 ])
    }
    getStepMapFromType(type: string) {
        switch (type.split('.')[ 0 ]) {
            case "buildIn":
                return this.buildInActions;
            case "native":
                return this.nativeActions;
            case "user":
                return this.userActions;
        }
    }
    getStepFromIndex(index: number): Step | null {
        return Array.from(this.userActions.values())[ index ];
    }
    getStepIdFromIndex(index: number): string | null {
        return Array.from(this.userActions.keys())[ index ];
    }
}