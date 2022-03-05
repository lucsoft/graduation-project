export type JsonCallsAction = Record<string, (() => void | Promise<void>) | number | boolean | string>;
export type CallParametersScoped<Type> = (Type extends "number" ? { name: string; type: "number"; value?: number; } : unknown) &
    (Type extends "boolean" ? { name: string; type: "boolean"; value?: boolean; } : unknown) &
    (Type extends "string" ? { name: string; type: "string"; value?: string; } : unknown) &
    (Type extends "function" ? { name: string; type: "function"; value?: undefined; } : unknown);
// deno-lint-ignore no-explicit-any
export type StateType = Record<string, string | boolean | number | Map<number, any>> & { _counter: number, _responses: Map<number, any> };
