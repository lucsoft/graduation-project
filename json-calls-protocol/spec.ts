// deno-lint-ignore-file no-explicit-any
export type Source = { type: "variable", id: string } | { type: "response", id: number } | { type: "paramter", id: string };
export type Variable = Record<string, string | boolean | number>;
export type ColorType = "red" | "red-orange" | "orange" | "yellow" | "green" | "green-blue" | "blue" | "blue-violet" | "violet" | "violet-pink" | "pink" | "gray" | "steel" | "brown"
export type State = Record<string, string | boolean | number | Map<number, any>> & { _callsLeft: number, _counter: number, _responses: Map<number, any> };
export type ActionId = `${"user" | "native" | "buildIn"}.${string}`;
export type CallHints = "count" | "secounds" | "power" | "lock" | "value";
export type CallParameters =
    | { name: string; type: "number"; value?: number | Source; hint?: CallHints }
    | { name: string; type: "boolean"; value?: boolean | Source; hint?: CallHints }
    | { name: string; type: "string"; value?: string | Source; hint?: CallHints };

export type CallStep = {
    id: ActionId,
    paramter?: CallParameters[],
    condition?: CallStep,
    branch?: Record<string, CallStep[]>
};
export type Language = "de" | "en";

export type Step = {
    displayText?: string,
    category: string | undefined,
    inlineText?: Record<Language, (number | string)[]>,
    icon: string,
    color: ColorType,
    variables?: Variable,
    parameters?: CallParameters[],
    actions: CallStep[] | 'native'
};
export type JsonCallsProtocol = {
    type: "json-calls",
    version: 0,
    categoryMapping: Record<string, Record<Language, string>>,
    steps: Record<ActionId, Step>
}
