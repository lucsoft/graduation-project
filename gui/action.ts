import './style/actions.css';
import { Component, Card, headless, Horizontal, Icon, PlainText, Spacer, Vertical } from "../../WebGen/mod.ts";
import { ColorType, ActionType, TitleType } from "./types.ts";

export function Action(icon: string, color: ColorType, type: ActionType, title: TitleType, closeable = true, actions: Component[] = []) {
    return Card(headless(Horizontal(
        Icon(icon).addClass("action-icon", "main").addClass("color-" + color),
        type == "full" && closeable ? Icon("disabled_by_default").addClass("close-button", "action-icon") : null,
        ...title.map(x =>
            typeof x == "string"
                ? PlainText(x).addClass("title")
                : null
        ),
        Spacer(),
        Vertical(
            type == "normal" && closeable ? Icon("cancel").addClass("close-button") : null,
            ...actions
        ).setDirection("row").addClass("actions")
    ).setAlign("center"))).addClass("action", ...type.split("."));
}