import { CallStep, State } from "./spec.ts";

export type ParamterWithData = Record<string, (
    | { type: "number", value: number }
    | { type: "boolean", value: boolean }
    | { type: "string", value: string }
)>;

export type JResponse = number | boolean | string | null | undefined;

export type ProviderType = (parameters: ParamterWithData, ref: {
    state: State;
    controller: ReadableStreamController<State>;
    step: CallStep;
}) => JResponse | Promise<JResponse>;