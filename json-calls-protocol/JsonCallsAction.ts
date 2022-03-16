export type CallParametersScoped<Type> =
    (Type extends "number" ? { name: string; type: "number"; value?: number; } : unknown) &
    (Type extends "boolean" ? { name: string; type: "boolean"; value?: boolean; } : unknown) &
    (Type extends "string" ? { name: string; type: "string"; value?: string; } : unknown);
// deno-lint-ignore no-explicit-any
export type StateType = Record<string, string | boolean | number | Map<number, any>> & { _counter: number, _responses: Map<number, any> };
