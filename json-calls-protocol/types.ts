import { CallStep, State } from "./spec.ts";

export type ParameterWithData = Record<string, (
    | { type: "number", value: number }
    | { type: "boolean", value: boolean }
    | { type: "string", value: string }
    | { type: "array", value: unknown[] }
    | { type: "key-value", value: [ key: string, value?: number | boolean | string ][] }

)>;

export type JResponse = number | boolean | string | null | unknown[] | undefined;

export type ProviderType = (parameters: ParameterWithData, ref: {
    state: State;
    controller?: ReadableStreamController<State>;
    step: CallStep;
}) => JResponse | Promise<JResponse>;