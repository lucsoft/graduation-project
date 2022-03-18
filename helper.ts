import { CallStep } from "./json-calls-protocol/spec.ts";

export const toFirstUpperCase = (e: string) => e.split('').map((e, i) => i == 0 ? e.toUpperCase() : e).join('');
export function limit(counter: number): (value: unknown, index: number, array: unknown[]) => unknown {
    return (_, i) => i < counter;
}

// deno-lint-ignore no-explicit-any
export function isCallStep(data: any): data is CallStep {
    return Object.hasOwn(data, "id");
}