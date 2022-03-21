// deno-lint-ignore-file no-explicit-any
import { registerMetaCategory, registerMetaData } from "./registersMeta.ts";
import { ParameterWithData, ProviderType } from "./types.ts";
import { CallParameters, CallStep, ActionId, Source, Action, State, Trace, Language } from "./spec.ts";
import { registerProvider } from "./registersProvider.ts";
import { streamAsyncIterable } from "./polyfill.ts";
export class JsonCalls {
    actions = new Map<ActionId, Action>();
    provider = new Map<ActionId, ProviderType>();
    category = new Map<string, Record<Language, string>>();

    constructor() {
        registerMetaCategory(this.category);
        registerMetaData(this.actions);
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
            const data = this.getparameters(step.parameter, state);
            const allparameterSet = this.metaFromId(step.id)?.parameters?.length ?? 0 === Object.keys(data).length;
            if (!allparameterSet) throw new Error(`Wrong parameter(s) was set for Action ${step.id}.`);
            const privoder = this.provider.get(step.id);
            if (privoder == undefined) throw new Error(`Can't find step '${step.id}'`);
            const action = privoder(data, { state, controller, step });
            if (action === null) throw new Error(`${step.id} failed with null!`);
            state._responses.set(state._trace, await action);
            return;
        }
        for await (const _ of streamAsyncIterable(this.streamRun(step.id))) { /** */ }
    }

    streamRun(id: ActionId) {
        if (!id.startsWith("user.")) throw new Error("Not starting with user.");
        const step = this.actions.get(id);
        if (step === undefined || step.steps === undefined || step.steps === "native") throw new Error(`Can't StreamRun ${id}`)
        const state = {
            ...step.variables ?? {},
            _trace: "",
            _callsLeft: this.getSizeInAction(id),
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
    traceFind(data: CallStep[], trace: Trace): CallStep[] {
        const index = trace.split('.').map(x => parseInt(x));
        let layer = 0;
        let lastLayer: CallStep[] | CallStep = data;
        // TODO: MAKE IT DRY
        if (index.length == 1) return lastLayer;
        lastLayer = lastLayer[ index[ layer++ ] ];
        lastLayer = lastLayer.branch![ Object.keys(lastLayer.branch!)[ index[ layer++ ] - 1 ] ];
        layer++;
        if (index.length == 3) return lastLayer;
        lastLayer = lastLayer[ index[ layer++ ] ];
        lastLayer = lastLayer.branch![ Object.keys(lastLayer.branch!)[ index[ layer++ ] - 1 ] ];
        layer++;
        if (index.length == 5) return lastLayer;
        lastLayer = lastLayer[ index[ layer++ ] ];
        lastLayer = lastLayer.branch![ Object.keys(lastLayer.branch!)[ index[ layer++ ] - 1 ] ];
        layer++;
        if (index.length == 7) return lastLayer;
        throw new Error("not implemented")
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
    isNative(data: "native" | CallStep[]): data is "native" {
        if (typeof data === "string") return true;
        return false;
    }
    addFirstStep(_actionId: ActionId, step: CallStep): void {
        const newVariable = this.actions.get(_actionId);
        if (!newVariable?.steps) return;
        if (this.isNative(newVariable.steps)) return;
        newVariable.steps = [ step, ...newVariable.steps as unknown as CallStep[] ];
        this.traceform(newVariable);
        dispatchEvent(new Event("actions-update"));
    }
    addFirstBranchStep(_actionId: ActionId, step: CallStep, from: Trace, branch: string): void {
        const newVariable = this.actions.get(_actionId);
        if (!newVariable?.steps) return;
        if (this.isNative(newVariable.steps)) return;

        this.traceFind(newVariable.steps, from).find(x => x.trace == from)?.branch![ branch ]!
            .unshift(step);

        this.traceform(newVariable);
        dispatchEvent(new Event("actions-update"));

    }
    addStepAfter(_actionId: ActionId, step: CallStep, _id: Trace): void {
        const newVariable = this.actions.get(_actionId);
        if (!newVariable?.steps) return;
        if (this.isNative(newVariable.steps)) return;

        this.traceFind(newVariable.steps, _id)
            .splice(parseInt(_id.split('.').at(-1)!) + (_id.includes('.') ? 0 : 1), 0, step);

        this.traceform(newVariable);
        dispatchEvent(new Event("actions-update"));
    }

    getparameters(data: CallParameters[] | undefined, state: State): ParameterWithData {
        return data ? Object.fromEntries(data.map(({ name, type, value, hint }) => [ name, { type, value: this.getDataFromSource(value, state), hint } ])) : {};
    }
    find(data: "native" | CallStep[] | undefined, trace: Trace): undefined | CallStep {
        if (typeof data === "string") return undefined;
        if (!data) return undefined;
        return data.find(x => x.trace === trace) ?? undefined;
    }

    meta(step?: CallStep): Action | undefined {
        return step ? this.metaFromId(step.id) : undefined;
    }

    metaFromId(id: ActionId) {
        const data = this.actions.get(id);
        if (data) return data.steps == "native" ? data : this.traceform(data);
        return undefined;
    }

    getDataFromSource(data: string | number | boolean | unknown[] | Source | undefined, state: State) {
        if (!Array.isArray(data) && typeof data === "object")
            switch (data.type) {
                case "variable":
                    if (!Object.hasOwn(state, data.id)) throw new Error();
                    return state[ data.id ];
                case "parameter":
                    throw new Error("not implemented")
                case "response": {
                    if (!state._responses.has(data.id)) throw new Error();
                    return state._responses.get(data.id);
                }
            }
        else
            return data;
    }
    getSizeInStep(id: CallStep): unknown[] {
        const list: unknown[] = [ 1 ];
        if (id.condition) list.push(...this.getSizeInStep(id.condition));
        if (id.branch && id.id !== "buildIn.repeat")
            list.push(...Object.values(id.branch).map(x => x.map(x => this.getSizeInStep(x).flat())).flat());
        return list.filter(x => x);
    }
    getSizeInAction(id: ActionId): number {
        const step = this.actions.get(id);
        if (step?.steps == "native") return 1;
        return step?.steps.map(x => this.getSizeInStep(x)).flat().length ?? -1;
    }
}