import { Component, Card, headless, Horizontal, Icon, Spacer, Vertical, PlainText, Button, Color, ButtonStyle } from "../../WebGen/mod.ts";
import { isCallStep, toFirstUpperCase } from "../helper.ts";
import { JsonCalls } from "../json-calls-protocol/mod.ts";
import { Action, CallStep, CallParameters, ActionId } from "../json-calls-protocol/spec.ts";
import { choose, chooseTranslation } from "./i8n.ts";
import './style/rich-elements.css';
import { State, TitleType } from "./types.ts";

export function RichAction(state: Partial<State>, jcall: JsonCalls, step: Action, caller: CallStep, main: ActionId, closeable = true, actions: Component[] = []) {
    const data = choose(step.inlineText)?.
        map(entry => typeof entry == "string" ? entry : (entry === -1 ? caller.condition : { ...caller.paramter![ entry ], hint: step.parameters?.[ entry ].hint })) as TitleType;

    return Card(headless(
        Horizontal(
            Icon(step.icon)
                .addClass("action-icon", "main")
                .addClass(`color-${step.color ?? "gray"}`),
            ...renderRichTitle(data, main, jcall, state),
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
        .addClass("action", "normal", (caller.trace === getTracer(state, main) ? "progress" : "ignore"));
}

export const renderRichTitle = (title: TitleType, main?: ActionId, jcall?: JsonCalls, state?: Partial<State>) => title.map(x => typeof x == "string" ? PlainText(x).addClass("title") : renderInline(x, main, jcall, state).addClass("element"))
const getTracer = (state: Partial<State>, main: string) => state.runner?.[ main ]?.at(-1)?._trace

function renderInline(x: CallParameters | CallStep, main?: ActionId, jcall?: JsonCalls, state?: Partial<State>) {
    if (x == null) throw new Error("CallParamter is null");
    if (isCallStep(x)) {
        return Button(chooseTranslation(jcall!.meta(x)?.displayText))
            .setColor(Color.Colored)
            .setStyle(getTracer(state!, main!) === x.trace ? ButtonStyle.Normal : ButtonStyle.Secondary)
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
    if (typeof x.value == "object" && jcall && main) {
        if (x.value.type === "variable")
            return Button(x.value.id.split('').map(toFirstUpperCase).join(""))
                .addPrefix(
                    Icon(jcall.metaFromId("buildIn.variable")?.icon!)
                        .addClass("action-icon", "main")
                        .addClass(`color-${jcall.metaFromId("buildIn.variable")?.color ?? "gray"}`)
                )
                .setColor(Color.Colored)
                .setStyle(ButtonStyle.Secondary);
        if (x.value.type === "response") {
            const targetStep = jcall.find(jcall.metaFromId(main)?.steps, x.value.id);
            const meta = jcall.meta(targetStep);
            if (targetStep && meta)
                return Button(chooseTranslation(meta.displayText))
                    .addPrefix(
                        Icon(meta.icon)
                            .addClass("action-icon", "main")
                            .addClass(`color-${meta.color}`)
                    )
                    .setColor(Color.Colored)
                    .setStyle(ButtonStyle.Secondary)

        }
    }
    return PlainText(JSON.stringify(x)).setFont(0.6, 500);
}
