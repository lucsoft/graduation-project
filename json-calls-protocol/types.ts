import { CallStep, State } from "./spec.ts";

export type ParamterWithData = Record<string, (
    | { type: "number", value: number }
    | { type: "boolean", value: boolean }
    | { type: "string", value: string }
    | { type: "array", value: unknown[] }
)>;

export type JResponse = number | boolean | string | null | unknown[] | undefined;

export type ProviderType = (parameters: ParamterWithData, ref: {
    state: State;
    controller?: ReadableStreamController<State>;
    step: CallStep;
}) => JResponse | Promise<JResponse>;