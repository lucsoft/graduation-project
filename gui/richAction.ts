import { Component, Card, headless, Horizontal, Icon, Spacer, Vertical, PlainText, Button, Color, ButtonStyle } from "../../WebGen/mod.ts";
import { isCallStep, toFirstUpperCase } from "../helper.ts";
import { JsonCalls } from "../json-calls-protocol/mod.ts";
import { Step, CallStep, CallParameters } from "../json-calls-protocol/spec.ts";
import './style/rich-elements.css';
import { TitleType } from "./types.ts";

export function RichAction(jcall: JsonCalls, step: Step, caller: CallStep, main: Step, closeable = true, actions: Component[] = []) {
    const data = step.inlineText?.[ jcall.language ].
        map(entry => typeof entry == "string" ? entry : (entry === -1 ? caller.condition : { ...caller.paramter![ entry ], hint: step.parameters?.[ entry ].hint })
        ) as TitleType;

    return Card(headless(
        Horizontal(
            Icon(step.icon)
                .addClass("action-icon", "main")
                .addClass(`color-${step.color ?? "gray"}`),
            ...renderRichTitle(data, main, jcall),
            Spacer(),
            Vertical(
                closeable ? Icon("cancel").addClass("close-button") : null,
                ...actions
            )
                .setDirection("row")
                .addClass("actions")
        )
            .addClass("rich-elements")
            .setAlign("center")
    ))
        .addClass("action", "normal");
}

export const renderRichTitle = (title: TitleType, main?: Step, jcall?: JsonCalls) => title.map(x => typeof x == "string" ? PlainText(x).addClass("title") : renderInline(x, main, jcall).addClass("element"))

function renderInline(x: CallParameters | CallStep, main?: Step, jcall?: JsonCalls) {
    if (x == null) throw new Error("CallParamter is null");
    if (isCallStep(x)) {
        return Button(jcall?.getMetaDataFromId(x.id)?.displayText ?? "lol")
            .setColor(Color.Colored)
            .setStyle(ButtonStyle.Secondary)
    }
    if (typeof x.value == "boolean")
        return Button(x.value ? "An" : "Aus")
            .setColor(Color.Colored)
            .setStyle(ButtonStyle.Secondary);
    if (typeof x.value == "number")
        return Button(x.value.toString() + " Sekunden")
            .setColor(Color.Colored)
            .setStyle(ButtonStyle.Secondary);
    if (typeof x.value == "string")
        return Button(x.value.split('').map(toFirstUpperCase).join(''))
            .setColor(Color.Colored)
            .setStyle(ButtonStyle.Secondary)
    if (typeof x.value == "object") {
        if (x.value.type === "variable")
            return Button(x.value.id.split('').map(toFirstUpperCase).join(""))
                .addPrefix(
                    Icon(jcall?.getMetaDataFromId("buildIn.variable")?.icon!)
                        .addClass("action-icon", "main")
                        .addClass(`color-${jcall?.getMetaDataFromId("buildIn.variable")?.color ?? "gray"}`)
                )
                .setColor(Color.Colored)
                .setStyle(ButtonStyle.Secondary);
        if (x.value.type === "response") {
            const targetStep = main?.actions[ x.value.id ];
            if (targetStep && typeof targetStep !== "string")
                return Button(jcall?.getMetaDataFromId(targetStep.id)?.displayText!)
                    .addPrefix(
                        Icon(jcall?.getMetaDataFromId(targetStep.id)?.icon!)
                            .addClass("action-icon", "main")
                            .addClass(`color-${jcall?.getMetaDataFromId(targetStep.id)?.color ?? "gray"}`)
                    )
                    .setColor(Color.Colored)
                    .setStyle(ButtonStyle.Secondary)

        }
    }
    return PlainText(JSON.stringify(x)).setFont(0.6, 500);
}
