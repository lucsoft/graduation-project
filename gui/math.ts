import { JsonCalls } from "../json-calls-protocol/mod.ts";
import { ActionId, ActionTuple, CallStep, State } from "../json-calls-protocol/spec.ts";

export const percent = (ratio: number) => ratio * 100;

export function branches(jcall: JsonCalls, id: ActionId): Record<string, CallStep[]> | undefined {
    const defaulBranches = jcall.metaFromId(id)?.branch?.default;
    return defaulBranches ? Object.fromEntries(defaulBranches?.map(x => [ x, [] ]) ?? []) : undefined;
}

export function sortByRelevance(): ((a: ActionTuple, b: ActionTuple) => number) {
    return ([ x ]) => {
        if (x.startsWith("user"))
            return -1;
        if (x.startsWith("buildIn"))
            return 0;
        return 1;
    };
}


export function ratioOffset(offset: number, lastElement: State, exec: State[]) {
    return percent(1 - (1 - offset + lastElement._callsLeft) / exec[ 0 ]._callsLeft);
}

export function applyProgress(exec: State[] | undefined, div: HTMLDivElement) {
    if (exec && exec.length != 0) {
        const lastElement = exec.at(-1)!;
        const offset = lastElement._status !== undefined ? lastElement._status : 0;
        div.style.width = `${ratioOffset(offset, lastElement, exec)}%`;
    }
}
