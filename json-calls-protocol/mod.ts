// deno-lint-ignore-file no-explicit-any
import { registerMetaCategory, registerMetaData } from "./registersMeta.ts";
import { ParameterWithData, ProviderType } from "./types.ts";
import { CallParameters, CallStep, ActionId, Source, Action, State, Trace, Language } from "./spec.ts";
import { registerProvider } from "./registersProvider.ts";
import { assert, unimplemented } from "https://deno.land/std@0.130.0/testing/asserts.ts";
import { delay } from "https://deno.land/std@0.130.0/async/mod.ts";
import { streamToArray } from "../helper.ts";

type StepTree = CallStep[];

export class JsonCalls {
    actions = new Map<ActionId, Action>();
    provider = new Map<ActionId, ProviderType>();
    category = new Map<string, Record<Language, string>>();

    constructor() {
        registerMetaCategory(this.category);
        registerMetaData(this.actions);
        registerProvider(this);
    }

    /**
     * Recursively goes over buildIn and native Actions
     * To Reduce complexity UserActions gets run as an StreamRun
     */
    async run(controller: ReadableStreamController<State> | undefined, step: CallStep, state: State): Promise<void> {
        if (controller) {
            state._trace = step.trace!;
            state._callsLeft--;
            controller?.enqueue(JSON.parse(JSON.stringify(state)));
        }
        await delay(30) // Ignore this! We only do it for demo purposes
        assert(step.id.includes("."))
        const [ type ] = step.id.split(".");
        if (type != "user") {
            const data = this.getParameters(step.parameter, state);
            assert(this.#isAllParamterSet(step, data), `Wrong parameter(s) was set for Action ${step.id}.`)
            const privoder = this.provider.get(step.id);
            assert(privoder != undefined, `Can't find step '${step.id}'`)
            const action = privoder(data, { state, controller, step });
            assert(action !== null && state._trace);
            state._responses.set(state._trace, await action);
            return;
        }
        await streamToArray(this.runAsStream(step.id))
    }

    /**
     * Returns a Steam (simple: Async adding Elements to an "Array")
     * with State changes that happend when single stepping all steps recursively
     *
     * This method only supports user
     */
    runAsStream(id: ActionId) {
        assert(id.startsWith("user."), "Not starting with user.")
        const step = this.actions.get(id);
        assert(step?.steps !== undefined && step?.steps !== "native")
        const state = {
            ...step.variables ?? {},
            _callsLeft: this.getSizeInAction(id),
            _responses: new Map<Trace, any>(),
        } as State;
        return new ReadableStream<State>({
            start: async (controller) => {
                for (const iterator of this.traceform(step).steps) {
                    assert(typeof iterator != "string")
                    await this.run(controller, iterator, state);
                }
                controller.close()
            }
        }, { highWaterMark: 0 }) // Mark Buffer to always emit
    }

    /**
     * Point to a pretraced CallStep Array (StepTree) with a Tracer
     */
    traceFind(data: StepTree, trace: Trace): StepTree {
        const traceIntArray = trace.split('.').map(x => parseInt(x));
        let current: StepTree | CallStep = data;
        for (let index = 0; index < traceIntArray.length - 1; index++) {
            current = current[ traceIntArray[ index ] ];
            current = current.branch![ Object.keys(current.branch!)[ traceIntArray[ ++index ] - 1 ] ];
        }
        return current;
    }

    traceEditSingle(data: StepTree, trace: Trace, paramter: CallParameters) {
        const old = this.traceFind(data, trace)[ parseInt(trace.split('.').at(-1)!) ].parameter ?? [];
        this.traceEdit(data, trace, (old)
            .map(x => x.name == paramter.name && x.type == paramter.type ? paramter : x))
    }

    traceEdit(data: StepTree, trace: Trace, parameter: CallParameters[]) {
        this.traceFind(data, trace)[ parseInt(trace.split('.').at(-1)!) ].parameter = parameter;
        dispatchEvent(new Event("actions-update"));
    }
    /**
     * Adds Traces to an Action to allow for simpler finding nodes in the tree
     * and describing which are active
     * ```
     * [ 0   1   2   ] Root
     *           .
     *     [ 0   1   2 ] First Branch of Root Node 2 (0 is the condition trace)
     *           .
     *     [ 0   1 ] => 2.1.1 Second Node of First Branch
     * ```
     */
    traceform(data: Action) {
        assert(typeof data.steps != "string")
        const recusion = (layer: string, steps: StepTree, offset = 0) => {
            for (let index = 0; index < steps.length; index++) {
                const element = steps[ index ];
                if (typeof element == "string") continue;
                element.trace = layer + (index + offset).toString();
                const branches = Object.values(element.branch ?? {});
                recusion(`${element.trace}.`, [ element.condition! ].filter(x => x))
                for (let innerIndex = 0; innerIndex < branches.length; innerIndex++) {
                    const innerElement = branches[ innerIndex ];
                    recusion(`${element.trace}.${innerIndex + 1}.`, innerElement, offset);
                }
            }
        }
        recusion("", data.steps);
        return data;
    }

    isNative(data: "native" | StepTree): data is "native" {
        return typeof data === "string";
    }

    deleteStep(id: ActionId, step: CallStep) {
        const action = this.actions.get(id);
        if (!action?.steps) return;
        if (this.isNative(action.steps)) return;
        const from = step.trace?.split('.').at(-1)!;
        this.traceFind(action.steps, step.trace!).splice(parseInt(from), 1)
        this.traceform(action);
        dispatchEvent(new Event("actions-update"));
    }
    addFirstStep(id: ActionId, step: CallStep, deleteOld: boolean): void {
        const newVariable = this.actions.get(id);
        if (!newVariable?.steps) return;
        if (this.isNative(newVariable.steps)) return;

        newVariable.steps = [ step, ...newVariable.steps as unknown as StepTree ];
        if (deleteOld) this.deleteStep(id, step);
        dispatchEvent(new Event("actions-update"));
    }
    addFirstBranchStep(id: ActionId, step: CallStep, from: Trace, branch: string, deleteOld: boolean): void {
        const action = this.actions.get(id);
        if (!action?.steps) return;
        if (this.isNative(action.steps)) return;

        this.traceFind(action.steps, from).find(x => x.trace == from)?.branch![ branch ]!
            .unshift(step);

        if (deleteOld) this.deleteStep(id, step);
        dispatchEvent(new Event("actions-update"));
    }
    addStepAfter(id: ActionId, step: CallStep, from: Trace, deleteOld: boolean): void {
        const action = this.actions.get(id);
        if (!action?.steps) return;
        if (this.isNative(action.steps)) return;

        this.traceFind(action.steps, from)
            .splice(parseInt(from.split('.').at(-1)!) + 1, 0, step);

        if (deleteOld) this.deleteStep(id, step);
        dispatchEvent(new Event("actions-update"));
    }

    getParameters(data: CallParameters[] | undefined, state: State): ParameterWithData {
        return data ? Object.fromEntries(data.map(({ name, type, value, hint }) => [ name, { type, value: this.getDataFromSource(value, state), hint } ])) : {};
    }
    find(data: "native" | StepTree | undefined, trace: Trace): undefined | CallStep {
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
                    assert(Object.hasOwn(state, data.id))
                    return state[ data.id ];
                case "parameter":
                    return unimplemented();
                case "response": {
                    assert(state._responses.has(data.id))
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

    #isAllParamterSet(step: CallStep, data: ParameterWithData) {
        return this.metaFromId(step.id)?.parameters?.length ?? 0 === Object.keys(data).length;
    }
}