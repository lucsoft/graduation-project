import { Component, Card, headless, Horizontal, Icon, Spacer, Vertical, PlainText, Button, Color, ButtonStyle, createElement, Custom } from "../../WebGen/mod.ts";
import { isCallStep, toFirstUpperCase } from "../helper.ts";
import { JsonCalls } from "../json-calls-protocol/mod.ts";
import { Action, CallStep, CallParameters, ActionId } from "../json-calls-protocol/spec.ts";
import { choose, chooseTranslation, translate } from "./i18n.ts";
import './style/rich-elements.css';
import { State, TitleType } from "./types.ts";

export function RichAction(state: Partial<State>, jcall: JsonCalls, step: Action, caller: CallStep, main: ActionId, closeable = true, actions: Component[] = []) {
    const data = choose(step.inlineText)?.
        map(entry => typeof entry == "string" ? entry : (entry === -1 ? caller.condition : { ...caller.paramter![ entry ], hint: step.parameters?.[ entry ].hint })) as TitleType ?? [ typeof step.displayText == "string" ? step.displayText : choose(step.displayText) ];

    const div = createElement("div")
    const progress = Custom(div).addClass("progressbar")
    const tracer = getTracer(state, main);

    if (caller.trace === tracer?._masterTrace) {
        div.style.width = `${(tracer?._status ?? 1) * 100}%`;
    }
    if (caller.trace === tracer?._trace) {
        div.style.width = `100%`;
    }
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
        .addPrefix(progress)
        .addClass("action", "normal", (caller.trace === tracer?._trace || caller.trace === tracer?._masterTrace ? "progress" : "ignore"));
}

export const renderRichTitle = (title: TitleType, main?: ActionId, jcall?: JsonCalls, state?: Partial<State>) => title.map(x => typeof x == "string" ? PlainText(x).addClass("title") : renderInline(x, main, jcall, state).addClass("element"))
const getTracer = (state: Partial<State>, main: string) => state.runner?.[ main ]?.at(-1)

function renderInline(x: CallParameters | CallStep, main?: ActionId, jcall?: JsonCalls, state?: Partial<State>) {
    if (x == null) throw new Error("CallParamter is null");
    if (isCallStep(x)) {
        return Button(chooseTranslation(jcall!.meta(x)?.displayText))
            .setColor(Color.Colored)
            .setStyle(getTracer(state!, main!)?._trace === x.trace ? ButtonStyle.Normal : ButtonStyle.Secondary)
    }
    if (typeof x.value == "boolean")
        return Button(choose(translate(`hint.${x.hint ?? "power"}.${x.value.toString()}`))!)
            .setColor(Color.Colored)
            .setStyle(ButtonStyle.Secondary);
    if (typeof x.value == "number")
        return Button(`${x.value.toString()}${choose(translate(`hint.${x.hint}${x.value == 1 ? "" : "s"}`))}`)
            .setColor(Color.Colored)
            .setStyle(ButtonStyle.Secondary);
    if (typeof x.value == "string")
        return Button(toFirstUpperCase(x.value))
            .setColor(Color.Colored)
            .setStyle(ButtonStyle.Secondary)
    if (Array.isArray(x.value))
        return PlainText(JSON.stringify(x)).setFont(0.6, 500);
    if (typeof x.value == "object" && jcall && main) {
        if (x.value.type === "variable")
            return Button(toFirstUpperCase(x.value.id))
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
