// deno-lint-ignore-file no-explicit-any
import { registerMetaCategory, registerMetaData } from "./registersMeta.ts";
import { ParamterWithData, ProviderType } from "./types.ts";
import { CallParameters, CallStep, ActionId, Source, Action, State, Trace, Language } from "./spec.ts";
import { registerProvider } from "./registersProvider.ts";
import { streamAsyncIterable } from "./polyfill.ts";


export class JsonCalls {
    nativeActions = new Map<string, Action>();
    buildInActions = new Map<string, Action>();
    userActions = new Map<string, Action>();

    provider = new Map<ActionId, ProviderType>();
    category = new Map<string, Record<Language, string>>();

    constructor() {
        registerMetaCategory(this.category);
        registerMetaData(this.buildInActions);
        registerProvider(this);
    }

    async singleRun(controller: ReadableStreamController<State> | undefined, step: CallStep, state: State): Promise<void> {
        if (controller) {
            state._trace = step.trace!;
            state._callsLeft--;
            controller?.enqueue({ ...state });
        }
        await new Promise(done => setTimeout(done, 30)) // For Demo purpose
        if (!step.id.includes(".")) throw new Error();
        const [ type ] = step.id.split(".");
        if (type != "user") {
            const data = this.getParamters(step.paramter, state);
            const allParamterSet = this.metaFromId(step.id)?.parameters?.length ?? 0 === Object.keys(data).length;
            if (!allParamterSet) throw new Error(`Wrong Paramter(s) was set for Action ${step.id}.`);
            const privoder = this.provider.get(step.id);
            if (privoder == undefined) throw new Error(`Can't find step '${step.id}'`);
            const action = privoder(data, { state, controller, step });
            if (action === null) throw new Error(`${step.id} failed with null!`);
            state._responses.set(state._trace, await action);
            return;
        }
        for await (const _ of streamAsyncIterable(this.streamRun(step.id))) { /** */ }
    }

    getParamters(data: CallParameters[] | undefined, state: State): ParamterWithData {
        return data ? Object.fromEntries(data.map(({ name, type, value, hint }) => [ name, { type, value: this.getDataFromSource(value, state), hint } ])) : {};
    }
    find(data: "native" | CallStep[] | undefined, trace: Trace): undefined | CallStep {
        if (typeof data === "string") return undefined;
        if (!data) return undefined;
        return data.find(x => x.trace === trace) ?? undefined;
    }
    getDataFromSource(data: string | number | boolean | unknown[] | Source | undefined, state: State) {
        if (!Array.isArray(data) && typeof data === "object")
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
        // const repeat = 1;
        // const repeat = id.id == "buildIn.repeat" ? id.paramter?.[ 0 ].value as number : 1;
        // for (let index = 0; index < repeat; index++) {
        if (id.id !== "buildIn.repeat")
            if (id.branch) list.push(...Object.values(id.branch).map(x => x.map(x => this.getSizeInCall(x).flat())).flat());
        // }
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
                recusion(`${element.trace}.`, [ element.condition! ].filter(x => x))
                if (element.branch) {
                    const branches = Object.values(element.branch);
                    for (let innerIndex = 0; innerIndex < branches.length; innerIndex++) {
                        const innerElement = branches[ innerIndex ];
                        recusion(`${element.trace}.${element.condition ? innerIndex + 1 : innerIndex}.`, innerElement, innerIndex + 1);
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
    getUserActionIndex(index: number): [ ActionId, Action ] | null {
        return Array.from(this.userActions.entries()).map(([ id, action ]) => [ `user.${id}`, action ] as [ ActionId, Action ])[ index ];
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