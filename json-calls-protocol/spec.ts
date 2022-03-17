// deno-lint-ignore-file no-explicit-any
export type Source = { type: "variable", id: string } | { type: "response", id: number } | { type: "paramter", id: string };
export type Variable = Record<string, string | boolean | number>;
export type ColorType = "red" | "red-orange" | "orange" | "yellow" | "green" | "green-blue" | "blue" | "blue-violet" | "violet" | "violet-pink" | "pink" | "gray" | "steel" | "brown"

export type CallStepId = `${"step" | "native" | "buildIn"}.${string}`;
export type CallHints = "count" | "secounds" | "power" | "lock" | "value";
export type CallParameters =
    | { name: string; type: "number"; value?: number | Source; hint?: CallHints }
    | { name: string; type: "boolean"; value?: boolean | Source; hint?: CallHints }
    | { name: string; type: "string"; value?: string | Source; hint?: CallHints };

export type CallStep = {
    id: CallStepId,
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
    catchFailedResponses?: { [ index in number ]: { [ errortype in any ]: CallStep[] } },
    actions: CallStep[] | 'native'
};
export type JsonCallsProtocol = {
    type: "json-calls",
    version: 0,
    categoryMapping: Record<string, Record<Language, string>>,
    steps: Record<CallStepId, Step>
}
