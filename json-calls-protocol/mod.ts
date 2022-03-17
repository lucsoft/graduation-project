// deno-lint-ignore-file no-explicit-any
import { registerMetaCategory, registerMetaData } from "./registers.ts";
import { JResponse, ParamterWithData } from "./types.ts";
import { CallParameters, CallStep, ActionId, Source, Action, State, Trace } from "./spec.ts";
export class JsonCalls {
    nativeActions = new Map<string, Action>();
    buildInActions = new Map<string, Action>();
    userActions = new Map<string, Action>();

    methodProvider = new Map<string, ((parameters: ParamterWithData) => JResponse | Promise<JResponse>)>();
    category = new Map<string, { de: string, en: string }>();
    language: "de" | "en" = "de";

    constructor() {
        registerMetaCategory(this.category);
        registerMetaData(this.buildInActions);
    }

    async singleRun(controller: ReadableStreamController<State>, { id, paramter, branch, condition, trace }: CallStep, state: State): Promise<void> {
        state._trace = trace!;
        state._callsLeft--;
        controller.enqueue({ ...state });
        await new Promise(done => setTimeout(done, 80)) // For Demo purpose
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
            state._responses.set(state._trace, await action);
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
                    state._responses.set(state._trace, list.map((x) => state[ x!.name ] = x!.value as unknown as string)[ 0 ]);
                    return;
                }
                case "truthy": {
                    const rsp = this.getParamters(paramter, state).value.value;
                    state._responses.set(state._trace, !!rsp);
                    return;
                }
                case "falsy": {
                    const rsp = this.getParamters(paramter, state).value.value;
                    state._responses.set(state._trace, !rsp);
                    return;
                } case "if": {
                    if (branch === undefined || condition === undefined) throw new Error();
                    await this.singleRun(controller, { ...condition, paramter: paramter }, state);
                    const getter = state._responses.get(state._trace);
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
    find(data: "native" | CallStep[] | undefined, trace: Trace): undefined | CallStep {
        if (typeof data === "string") return undefined;
        if (!data) return undefined;
        return data.find(x => x.trace === trace) ?? undefined;
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
        if (step?.steps == "native") return 1;
        return step?.steps.map(x => this.getSizeInCall(x)).flat().length ?? -1;
    }
    streamRun(id: ActionId) {
        if (!id.startsWith("user.")) throw new Error("Not starting with user.");
        const [ _, stepId ] = id.split(".");
        const step = this.userActions.get(stepId);
        if (step === undefined || step.steps === undefined || step.steps === "native") throw new Error(stepId + "invalid data")
        const state = {
            ...step.variables ?? {},
            _trace: "",
            _callsLeft: this.getSize(id),
            _responses: new Map<Trace, any>(),
        } as State;
        return new ReadableStream<State>({
            start: async (controller) => {
                for (const iterator of this.traceform(step).steps) {
                    if (typeof iterator === "string") return controller.error("Failed");
                    await this.singleRun(controller, iterator, state);
                }
                controller.close()
            }
        }, { highWaterMark: 0 })
    }

    traceform(data: Action) {
        if (typeof data.steps == "string") throw new Error("Cannot tracefrom a native Action");
        const recusion = (layer: string, steps: CallStep[], offset = 0) => {
            for (let index = 0; index < steps.length; index++) {
                const element = steps[ index ];
                if (typeof element == "string") continue;
                element.trace = layer + (index + offset).toString();
                recusion(element.trace + ".", [ element.condition! ].filter(x => x))
                if (element.branch) {
                    const branches = Object.values(element.branch);
                    for (let innerIndex = 0; innerIndex < branches.length; innerIndex++) {
                        const innerElement = branches[ innerIndex ];
                        recusion(element.trace + "." + (element.condition ? innerIndex + 1 : innerIndex) + ".", innerElement, innerIndex + 1);
                    }
                }
            }
        }
        recusion("", data.steps);
        return data;
    }

    meta(step?: CallStep): Action | undefined {
        return step ? this.metaFromId(step.id) : undefined;
    }
    metaFromId(id: ActionId) {
        return this.#getStepMapFromType(id)?.get(id.split('.')[ 1 ])
    }
    getStepFromIndex(index: number): Action | null {
        return Array.from(this.userActions.values())[ index ];
    }
    getStepIdFromIndex(index: number): ActionId | null {
        const step = Array.from(this.userActions.keys())[ index ];
        return step ? `user.${step}` : null;
    }

    // Private Methods

    #getStepMapFromType(type: string) {
        switch (type.split('.')[ 0 ]) {
            case "buildIn":
                return this.buildInActions;
            case "native":
                return this.nativeActions;
            case "user":
                return this.userActions;
        }
    }
}