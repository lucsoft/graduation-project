// deno-lint-ignore-file no-explicit-any
export type Source = { type: "variable", id: string } | { type: "response", id: Trace } | { type: "paramter", id: string };
export type Variable = Record<string, string | boolean | number>;
export type ColorType = "red" | "red-orange" | "orange" | "yellow" | "green" | "green-blue" | "blue" | "blue-violet" | "violet" | "violet-pink" | "pink" | "gray" | "steel" | "brown"
export type Trace = string;
export type State = Record<string, string | boolean | number | Map<number, any>> & { _callsLeft: number, _trace: Trace, _responses: Map<Trace, any> };
export type ActionId = `${"user" | "native" | "buildIn"}.${string}`;
export type CallHints = "count" | "secounds" | "power" | "lock" | "value";
export type CallParameters =
    | { name: string; type: "number"; value?: number | Source; hint?: CallHints }
    | { name: string; type: "boolean"; value?: boolean | Source; hint?: CallHints }
    | { name: string; type: "string"; value?: string | Source; hint?: CallHints };

export type CallStep = {
    id: ActionId,
    trace?: string,
    paramter?: CallParameters[],
    condition?: CallStep,
    branch?: Record<string, CallStep[]>
};
export type Language = "de" | "en";

export type Action = {
    displayText?: string | Record<Language, string>,
    category: string | undefined,
    inlineText?: Record<Language, (number | string)[]>,
    icon: string,
    color: ColorType,
    variables?: Variable,
    parameters?: CallParameters[],
    steps: CallStep[] | 'native'
};
export type JsonCallsProtocol = {
    type: "json-calls",
    version: 0,
    categoryMapping: Record<string, Record<Language, string>>,
    actions: Record<ActionId, Action>
}
