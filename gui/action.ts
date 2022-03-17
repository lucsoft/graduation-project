import './style/actions.css';
import { Component, Card, headless, Horizontal, Icon, PlainText, Spacer, Vertical, Button, Color, ButtonStyle } from "../../WebGen/mod.ts";
import { ActionType, TitleType } from "./types.ts";
import { CallStep, ColorType, Step } from "../json-calls-protocol/spec.ts";

export function ActionWithCaller(step: Step, caller: CallStep, closeable = true, actions: Component[] = []) {
    console.log(step, caller);
    const data = step.inlineText?.de.map(x => typeof x == "string" ? x : caller.paramter?.[ x ]!);
    console.log(data);
    return Action(
        step.icon,
        step.color,
        "normal",
        data ? data : [ step.displayText ?? "Unnammed Step" ],
        closeable,
        actions
    )
}
export function ActionAsStep(step: Step, type: ActionType, closeable = true, actions: Component[] = []) {
    return Action(
        step.icon,
        step.color,
        type,
        [ step.displayText ?? "Unnammed Step" ]
        , closeable,
        actions
    )
}

export function Action(icon: string | undefined, color: ColorType | undefined, type: ActionType, title: TitleType, closeable = true, actions: Component[] = []) {
    return Card(headless(Horizontal(
        icon ? Icon(icon).addClass("action-icon", "main").addClass("color-" + (color ?? "gray")) : null,
        type == "full" && closeable ? Icon("disabled_by_default").addClass("close-button", "action-icon") : null,
        ...title.map(x =>
            typeof x == "string"
                ? PlainText(x).addClass("title")
                : (x && typeof x.value == "boolean"
                    ? Button(x.value ? "An" : "Aus")
                        .setColor(Color.Colored)
                        .setStyle(ButtonStyle.Secondary)
                    : PlainText(JSON.stringify(x))
                )
        ),
        Spacer(),
        Vertical(
            type == "normal" && closeable ? Icon("cancel").addClass("close-button") : null,
            ...actions
        ).setDirection("row").addClass("actions")
    ).setAlign("center"))).addClass("action", ...type.split("."));
}