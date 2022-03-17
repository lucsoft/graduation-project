import './style/actions.css';
import { Component, Card, headless, Horizontal, Icon, Spacer, Vertical } from "../../WebGen/mod.ts";
import { ActionType } from "./types.ts";
import { Step } from "../json-calls-protocol/spec.ts";
import { renderRichTitle } from "./richAction.ts";


export function SimpleAction({ icon, color, displayText }: Step, type: ActionType, closeable = true, actions: Component[] = []) {
    return Card(headless(
        Horizontal(
            icon ? Icon(icon)
                .addClass("action-icon", "main")
                .addClass(`color-${color ?? "gray"}`)
                : null,
            type == "full" && closeable
                ? Icon("disabled_by_default")
                    .addClass("close-button", "action-icon")
                : null,
            ...renderRichTitle([ displayText ?? "Unnammed Step" ]),
            Spacer(),
            Vertical(
                type == "normal" && closeable ? Icon("cancel").addClass("close-button") : null,
                ...actions
            )
                .setDirection("row")
                .addClass("actions")
        )
            .addClass("rich-elements")
            .setAlign("center")
    ))
        .addClass("action", ...type.split("."));
}