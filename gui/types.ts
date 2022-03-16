export type ActionType = "full" | "full.focus" | "normal" | "small" | "small.light";
export type ColorType = "red" | "red-orange" | "orange" | "yellow" | "green" | "green-blue" | "blue" | "blue-violet" | "violet" | "violet-pink" | "pink" | "gray" | "steel" | "brown"
export type TitleType = (string | {
    type: "button";
})[];

export type ActionState = {
    icon: string,
    color: ColorType,
    type: ActionType,
    title: TitleType
} | "searchtab";
export type State = {
    selectedTab: number,
    tabs: ActionState[]
};