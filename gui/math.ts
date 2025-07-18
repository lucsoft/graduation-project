import { JsonCalls } from "../json-calls-protocol/mod.ts";
import { ActionId, ActionTuple, CallStep, State } from "../json-calls-protocol/spec.ts";
import { choose, defaultOrTranslation } from "./i18n.ts";
import { TitleType } from "./types.ts";

export const percent = (ratio: number) => ratio * 100;

export function branches(jcall: JsonCalls, id: ActionId): Record<string, CallStep[]> | undefined {
    const defaulBranches = jcall.metaFromId(id)?.branch?.default;
    return defaulBranches ? Object.fromEntries(defaulBranches?.map(x => [ x, [] ]) ?? []) : undefined;
}

export function sortByRelevance(): ((a: ActionTuple, b: ActionTuple) => number) {
    return ({ id }) => {
        if (id.startsWith("user"))
            return -1;
        if (id.startsWith("buildIn"))
            return 0;
        return 1;
    };
}


export function ratioOffset(offset: number, lastElement: State, exec: State[]) {
    return percent(1 - (offset + lastElement._callsLeft) / (exec[ 0 ]._callsLeft + 1));
}

export function applyProgress(exec: State[] | undefined, div: HTMLDivElement) {
    if (exec && exec.length != 0) {
        const lastElement = exec.at(-1)!;
        const offset = lastElement._status !== undefined ? 1 - lastElement._status : 0;
        div.style.width = `${ratioOffset(offset, lastElement, exec)}%`;
    }
}

export function mapDataToRichTitle({ id: actionId, data: action }: ActionTuple, jcall: JsonCalls, step: CallStep) {
    const fallback = action.inlineText ? choose(action.inlineText)! : [ defaultOrTranslation(action.displayText) ];
    const data = fallback.map<TitleType>(value => {
        if (typeof value == "string")
            return { type: "text", value, step } as TitleType;
        if (value == -1)
            return { type: "condition", value: step.condition, step } as TitleType;
        if (step.parameter && step.parameter[ value ])
            return { type: "parameter", value: { ...step.parameter[ value ], hint: action.parameters?.[ value ].hint }, step } as TitleType;
        return { type: "unset-parameter", value: (jcall.metaFromId(actionId)?.parameters ?? [])[ value ], step } as TitleType;
    });
    return data;
}
