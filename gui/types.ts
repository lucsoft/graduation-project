import { ActionId, CallParameters, CallStep, ColorType } from "../json-calls-protocol/spec.ts";
import { State as JsonCallsState } from "../json-calls-protocol/spec.ts";

export type ActionType = "full" | "full.focus" | "normal" | "small" | "small.light";
export type TitleType = (
    | { type: "text", value: string, step?: CallStep }
    | { type: "parameter", value: CallParameters, step?: CallStep }
    | { type: "unset-parameter", value: CallParameters, step?: CallStep }
    | { type: "condition", value?: CallStep, step?: CallStep }
);

export type ActionState = {
    icon: string,
    color: ColorType,
    type: ActionType,
    title: TitleType
} | "searchtab";

export type TabEntry = ActionId | "search-tab";

export type State = {
    selectedTab: number,
    tabs: TabEntry[],
    debugMode: boolean,
    runner: Record<string, JsonCallsState[]>
};