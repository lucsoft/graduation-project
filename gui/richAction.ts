import { Component, Card, headless, Horizontal, Icon, Spacer, Vertical, PlainText, createElement, Custom, Box } from "../../WebGen/mod.ts";
import { JsonCalls } from "../json-calls-protocol/mod.ts";
import { CallStep, ActionTuple } from "../json-calls-protocol/spec.ts";
import { mapDataToRichTitle } from "./math.ts";
import { getTracer, renderRichTitle } from "./inlineText.ts";
import './style/rich-elements.css';
import { State } from "./types.ts";

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
                            !closeable ? null
                                : Icon("cancel")
                                    .addClass("close-button")
                                    .onClick(() => jcall.deleteStep(main.id, caller)),
                            actions
                        )
                            .setAlign("center")
                            .setDirection("row")
                            .addClass("actions")
                    )

                )
                    .setDirection("row"),
                // PlainText("test")
            )
                .addClass("rich-elements")
                .setGrow(1)
        ).setAlign("stretch")
    ))
        .addPrefix(progress)
        .addClass("action", "normal", (caller.trace === tracer?._trace || caller.trace === tracer?._masterTrace ? "progress" : "ignore"));
}
