// deno-lint-ignore-file no-explicit-any
export type Source = { type: "variable", id: string } | { type: "response", id: number } | { type: "paramter", id: string };
export type Variable = Record<string, string | boolean | number>;
export type ColorType = "red" | "red-orange" | "orange" | "yellow" | "green" | "green-blue" | "blue" | "blue-violet" | "violet" | "violet-pink" | "pink" | "gray" | "steel" | "brown"

export type buildInIds = "sleep" | "if" | "variable" | "eval" | "invert" | "retryOnFailedResponse" | "while" | "truthy" | "falsy";
type NativeStepIds = `buildIn.${buildInIds}`;

export type CallStepId = `${"step" | "native"}.${string}` | NativeStepIds;
export type CallParameters =
    | { name: string; type: "number"; value?: number | Source; }
    | { name: string; type: "boolean"; value?: boolean | Source; }
    | { name: string; type: "string"; value?: string | Source; }
    | { name: string; type: "function"; value?: undefined | Source; };

export type CallStep = {
    id: CallStepId,
    paramter?: CallParameters[],
    condition?: CallStep,
    branch?: Record<string, CallStep[]>
};
export type Step = {
    displayText?: string,
    description?: string
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
    steps: Record<Exclude<CallStepId, NativeStepIds>, Step>
}
