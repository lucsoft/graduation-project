import './style/actions.css';
import { Component, Card, headless, Horizontal, Icon, Spacer, Vertical } from "https://raw.githubusercontent.com/lucsoft/WebGen/39f8439fb8e478dba5d351546f0156d331ebda3d/mod.ts";
import { ActionType } from "./types.ts";
import { Action } from "../json-calls-protocol/spec.ts";
import { renderRichTitle } from "./inlineText.ts";
import { chooseTranslation } from "./i18n.ts";


export function SimpleAction({ icon, color, displayText }: Action, type: ActionType, closeable = true, actions: Component[] = []) {
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
            renderRichTitle([ { type: "text", value: chooseTranslation(displayText) } ]),
            Vertical(
                type == "normal" && closeable ? Icon("cancel").addClass("close-button") : null,
                actions
            )
                .setDirection("row")
                .addClass("actions")
        )
            .addClass("rich-elements")
            .setAlign("center")
    ))
        .addClass("action", ...type.split("."));
}