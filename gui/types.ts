import { CallParameters, CallStep, ColorType } from "../json-calls-protocol/spec.ts";
import { State as JsonCallsState } from "../json-calls-protocol/spec.ts";

export type ActionType = "full" | "full.focus" | "normal" | "small" | "small.light";
export type TitleType = (string | CallParameters | CallStep)[];

export type ActionState = {
    icon: string,
    color: ColorType,
    type: ActionType,
    title: TitleType
} | "searchtab";

export type TabEntry = number | "search-tab";

export type State = {
    selectedTab: number,
    tabs: TabEntry[]
    runner: Record<string, JsonCallsState[]>
};