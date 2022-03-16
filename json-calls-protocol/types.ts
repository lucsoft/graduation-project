// deno-lint-ignore no-explicit-any
export type StateType = Record<string, string | boolean | number | Map<number, any>> & { _counter: number, _responses: Map<number, any> };

export type ParamterWithData = Record<string, (
    | { type: "number", value: number }
    | { type: "boolean", value: boolean }
    | { type: "string", value: string }
)>;

export type JResponse = number | boolean | string | null | undefined;