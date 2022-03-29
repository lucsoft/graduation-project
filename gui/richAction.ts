import { Component, Card, headless, Horizontal, Icon, Spacer, Vertical, PlainText, createElement, Custom, Box, Input, Button, ButtonStyle, Grid, Color } from "../../WebGen/mod.ts";
import { JsonCalls } from "../json-calls-protocol/mod.ts";
import { CallStep, ActionTuple, Source } from "../json-calls-protocol/spec.ts";
import { mapDataToRichTitle } from "./math.ts";
import { getTracer, renderRichTitle } from "./inlineText.ts";
import './style/rich-elements.css';
import { State } from "./types.ts";
import { toFirstUpperCase } from "../helper.ts";

export function RichAction(state: Partial<State>, jcall: JsonCalls, Action: ActionTuple, caller: CallStep, main: ActionTuple, closeable = true, actions: Component[] = []) {

    const div = createElement("div")
    const progress = Custom(div).addClass("progressbar")
    const tracer = getTracer(state, main);
    const runner = Object.keys(state.runner ?? {}).includes(main.id)
    if (caller.trace === tracer?._masterTrace) {
        div.style.width = `${(tracer?._status ?? 1) * 100}%`;
    }
    if (caller.trace === tracer?._trace) {
        div.style.width = `100%`;
    }
    const hasMore = (caller.parameter ?? [])?.find((x) => x.hidden);
    const showMore = !(caller.collapsed ?? true);
    return Card(headless(
        Horizontal(
            Vertical(
                Spacer(),
                Icon(Action.data.icon)
                    .addClass("action-icon", "main")
                    .addClass(`color-${Action.data.color ?? "gray"}`),
                Spacer()
            ),
            Vertical(
                Horizontal(
                    Box(...renderRichTitle(mapDataToRichTitle(Action, jcall, caller), main, jcall, state))
                        .addClass("element"),
                    Vertical(
                        Horizontal(
                            !(state.debugMode && runner) ? null
                                : PlainText(caller.trace!)
                                    .setMargin("0 0.5rem 0 0")
                                    .setFont(0.5, 500),
                            !hasMore ? null :
                                Icon(showMore ? "expand_less" : "expand_more")
                                    .onClick(() => {
                                        // TODO: Moved to JsonCalls
                                        jcall.traceFindSingle(main.data.steps as CallStep[], caller.trace!).collapsed = showMore
                                        dispatchEvent(new Event("actions-update"));
                                    })
                                    .addClass("close-button"),
                            !closeable ? null
                                : Icon("cancel")
                                    .addClass("close-button")
                                    .onClick(() => jcall.deleteStep(main.id, caller)),
                            actions
                        )
                            .setAlign("center")
                            .setDirection("row")
                    )
                ),
                hasMore && showMore ? Vertical(
                    ...(caller.parameter ?? []).filter((x) => x.hidden).map(x => {
                        if (x.type == "key-value")
                            return Vertical(
                                (x.value as Exclude<typeof x.value, Source>)!.map(e => Grid(
                                    Button(toFirstUpperCase(e[ 0 ])).setStyle(ButtonStyle.Inline),
                                    Button(JSON.stringify(e[ 1 ])).setColor(Color.Colored).setStyle(ButtonStyle.Inline),
                                ).setEvenColumns(2).addClass("tiny-element").setDirection("row"))
                            ).setGap("0.1rem").setMargin("0 0.65rem 0.7rem -0.2rem")
                        return PlainText("TODO: Add all display modes");
                    })
                ) : null
            )
                .addClass("rich-elements")
                .setGrow(1)
        ).setAlign("stretch")
    ))
        .addPrefix(progress)
        .addClass("action", "normal", (caller.trace === tracer?._trace || caller.trace === tracer?._masterTrace ? "progress" : "ignore"));
}
