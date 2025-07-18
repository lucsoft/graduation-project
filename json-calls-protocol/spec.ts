// deno-lint-ignore-file no-explicit-any
export type Source = { type: "variable", id: string } | { type: "response", id: Trace } | { type: "parameter", id: string };
export type Variable = Record<string, string | boolean | number>;
export type ColorType = "red" | "red-orange" | "orange" | "yellow" | "green" | "green-blue" | "blue" | "blue-violet" | "violet" | "violet-pink" | "pink" | "gray" | "steel" | "brown"
export type Trace = string;
export type State =
    Record<string, string | boolean | number | Map<number, any>>
    & { _responses: Map<Trace, any>, _callsLeft: number, _trace: Trace, _masterTrace?: Trace, _status?: number };

export type ActionId = `${"user" | "native" | "buildIn"}.${string}`;
export type ActionTuple = { id: ActionId, data: Action };
export type CallHints = "count" | "secound" | "power" | "lock" | "value" | "tempature" | "milliseconds" | "microliter" | "micoliterPerMinute";
export type CallParameters =
    | { name: string; type: "number"; value?: number | Source; hint?: CallHints; hidden?: boolean }
    | { name: string; type: "boolean"; value?: boolean | Source; hint?: CallHints; hidden?: boolean }
    | { name: string; type: "string"; value?: string | Source; hint?: CallHints; hidden?: boolean }
    | { name: string; type: "array"; value?: unknown[] | Source; hint?: CallHints; hidden?: boolean }
    | { name: string; type: "key-value"; value?: [ key: string, value?: number | boolean | string, hint?: CallHints ][] | Source; hint?: CallHints; hidden: true };

export type CallStep = {
    id: ActionId,
    trace?: string,
    collapsed?: boolean,
    parameter?: CallParameters[],
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
    branch?: {
        default: string[]
        hideFirstStep?: boolean
        otherBlocks?: Record<string, Record<Language, string>>
        endBlock: Record<Language, string>
    },
    parameters?: CallParameters[],
    steps: CallStep[] | 'native'
};
export type JsonCallsProtocol = {
    type: "json-calls",
    version: 0,
    categoryMapping: Record<string, Record<Language, string>>,
    actions: Record<ActionId, Action>
}
