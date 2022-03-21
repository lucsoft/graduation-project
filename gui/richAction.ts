import { Component, Card, headless, Horizontal, Icon, Spacer, Vertical, PlainText, Button, Color, ButtonStyle, createElement, Custom } from "../../WebGen/mod.ts";
import { toFirstUpperCase } from "../helper.ts";
import { JsonCalls } from "../json-calls-protocol/mod.ts";
import { CallStep, ActionTuple } from "../json-calls-protocol/spec.ts";
import { choose, chooseTranslation, defaultOrTranslation, translate, translation } from "./i18n.ts";
import './style/rich-elements.css';
import { State, TitleType } from "./types.ts";

export function RichAction(state: Partial<State>, jcall: JsonCalls, Action: ActionTuple, caller: CallStep, main: ActionTuple, closeable = true, actions: Component[] = []) {

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
            Icon(Action[ 1 ].icon)
                .addClass("action-icon", "main")
                .addClass(`color-${Action[ 1 ].color ?? "gray"}`),
            ...renderRichTitle(mapDataToRichTitle(Action, jcall, caller), main, jcall, state),
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

export const renderRichTitle = (title: TitleType[], main?: ActionTuple, jcall?: JsonCalls, state?: Partial<State>) => title.map(x => renderInline(x, main, jcall, state).addClass("element"))
const getTracer = (state: Partial<State>, [ actionId ]: ActionTuple) => state.runner?.[ actionId ]?.at(-1)

function mapDataToRichTitle([ actionId, step ]: ActionTuple, jcall: JsonCalls, caller: CallStep) {
    const fallback = step.inlineText ? choose(step.inlineText)! : [ defaultOrTranslation(step.displayText) ];
    const data = fallback.map<TitleType>(e => {
        if (typeof e == "string")
            return { type: "text", value: e };
        if (e == -1)
            return { type: "condition", value: caller.condition };
        if (caller.parameter && caller.parameter[ e ])
            return { type: "parameter", value: { ...caller.parameter[ e ], hint: step.parameters?.[ e ].hint } };
        return { type: "unset-parameter", value: (jcall.metaFromId(actionId)?.parameters ?? [])[ e ] };
    });
    return data;
}

function renderInline({ type, value }: TitleType, main?: ActionTuple, jcall?: JsonCalls, state?: Partial<State>) {
    if (type == "condition") {
        const display = jcall!.meta(value)?.displayText;
        return Button(typeof display == "string" ? display : choose(display ?? translation.condition)!)
            .setColor(Color.Colored)
            .onClick(() => alert("*Open Edit Menu for Conditions*"))
            .setStyle(value ? (getTracer(state!, main!)?._trace === value?.trace && value?.trace ? ButtonStyle.Normal : ButtonStyle.Secondary) : ButtonStyle.Inline)
    }
    if (type == "text")
        return PlainText(value).addClass("title");
    if (type == "unset-parameter")
        return Button("Eingabe")
            .setColor(Color.Colored)
            .setStyle(ButtonStyle.Inline);
    if (type == "parameter") {
        if (typeof value.value == "boolean")
            return Button(choose(translate(`hint.${value.hint ?? "power"}.${value.value.toString()}`))!)
                .setColor(Color.Colored)
                .setStyle(ButtonStyle.Secondary);
        if (typeof value.value == "number")
            return Button(`${value.value.toString()}${choose(translate(`hint.${value.hint}${value.value == 1 ? "" : "s"}`))}`)
                .setColor(Color.Colored)
                .setStyle(ButtonStyle.Secondary);
        if (typeof value.value == "string")
            return Button(toFirstUpperCase(value.value))
                .setColor(Color.Colored)
                .setStyle(ButtonStyle.Secondary)
        if (Array.isArray(value.value))
            return PlainText(JSON.stringify(value)).setFont(0.6, 500);
        if (typeof value.value == "object" && jcall && main) {
            if (value.value.type === "variable")
                return Button(toFirstUpperCase(value.value.id))
                    .addPrefix(
                        Icon(jcall.metaFromId("buildIn.variable")?.icon!)
                            .addClass("action-icon", "main")
                            .addClass(`color-${jcall.metaFromId("buildIn.variable")?.color ?? "gray"}`)
                    )
                    .setColor(Color.Colored)
                    .setStyle(ButtonStyle.Secondary);
            if (value.value.type === "response") {
                const targetStep = jcall.find(main[ 1 ]?.steps, value.value.id);
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
    }
    return PlainText(JSON.stringify(value)).setFont(0.6, 500);
}
