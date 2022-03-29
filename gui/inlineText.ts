import { assert } from "https://deno.land/std@0.130.0/testing/asserts.ts";
import { Icon, PlainText, Button, Color, ButtonStyle } from "../../WebGen/mod.ts";
import { toFirstUpperCase } from "../helper.ts";
import { JsonCalls } from "../json-calls-protocol/mod.ts";
import { ActionTuple, CallParameters, CallStep, Trace } from "../json-calls-protocol/spec.ts";
import { openDialog } from "./debugVariableSetter.ts";
import { makeDropable } from "./dragAndDrop.ts";
import { choose, chooseTranslation, translate, translation } from "./i18n.ts";
import { State, TitleType } from "./types.ts";

export const renderRichTitle = (title: TitleType[], main?: ActionTuple, jcall?: JsonCalls, state?: Partial<State>) => title.map(x => InlineText(x, main, jcall, state));
export const getTracer = (state: Partial<State>, { id: actionId }: ActionTuple) => state.runner?.[ actionId ]?.at(-1);
export function InlineText({ type, value, step }: TitleType, main?: ActionTuple, jcall?: JsonCalls, state?: Partial<State>) {
    if (type == "condition") {
        const display = jcall!.meta(value)?.displayText;
        return Button(typeof display == "string" ? display : choose(display) ?? translation.condition)
            .setColor(Color.Colored)
            .onClick(() => alert("*Open Edit Menu for Conditions*"))
            .setStyle(value ? (getTracer(state!, main!)?._trace === value?.trace && value?.trace ? ButtonStyle.Normal : ButtonStyle.Secondary) : ButtonStyle.Inline)
    }
    else if (type == "text")
        return PlainText(value)
            .addClass("title");
    if (type == "unset-parameter")
        return Button("Eingabe")
            .setColor(Color.Colored)
            .onClick(() => alert("*Open Edit Menu for Parameter*"))
            .setStyle(ButtonStyle.Inline);
    if (type == "parameter") {
        if (typeof value.value == "boolean")
            return Button(translate(`hint.${value.hint ?? "power"}.${value.value.toString()}`)!)
                .setColor(Color.Colored)
                .onRightClick((e) => {
                    e.preventDefault();
                    jcall?.traceEditSingle(main?.data.steps as CallStep[], step?.trace!, { ...value, value: !value.value } as CallParameters);
                })
                .onClick(async () => {
                    assert(main && step?.trace && jcall)
                    const data = await openDialog([ "boolean", "response", "variable" ], [ value.value?.toString() ?? "false" ]);
                    console.log(data);
                    handleResponseAndVariable(data, jcall, main, step.trace, value);
                    if (data.boolean !== undefined)
                        jcall.traceEditSingle(main.data.steps, step.trace, { ...value, value: data.boolean !== "false" } as CallParameters);

                })
                .setStyle(ButtonStyle.Secondary);
        if (typeof value.value == "number")
            return Button(`${value.value.toString()}${translate(`hint.${value.hint}${value.value == 1 ? "" : "s"}`)}`)
                .setColor(Color.Colored)
                .onClick(async () => {
                    assert(main && step?.trace && jcall)
                    const data = await openDialog([ "number", "response", "variable" ]);
                    handleResponseAndVariable(data, jcall, main, step.trace, value);
                    if (data.number)
                        jcall.traceEditSingle(main.data.steps, step.trace, { ...value, value: parseInt(data.number) } as CallParameters);
                })
                .setStyle(ButtonStyle.Secondary);
        if (typeof value.value == "string")
            return Button(toFirstUpperCase(value.value))
                .onClick(() => alert("*Open Edit Menu for Parameter*"))
                .setColor(Color.Colored)
                .setStyle(ButtonStyle.Secondary);
        if (Array.isArray(value.value))
            return PlainText(JSON.stringify(value)).setFont(0.6, 500);
        if (typeof value.value == "object" && jcall && main) {
            if (value.value.type === "variable")
                return makeDropable(Button(toFirstUpperCase(value.value.id))
                    .addPrefix(
                        Icon(jcall.metaFromId("buildIn.variable")?.icon!)
                            .addClass("action-icon", "main")
                            .addClass(`color-${jcall.metaFromId("buildIn.variable")?.color ?? "gray"}`)
                    )
                    .setColor(Color.Colored)
                    .onClick(() => alert("*Open Edit Menu for Parameter*"))
                    .setStyle(ButtonStyle.Secondary), () => { });
            if (value.value.type === "response") {
                const targetStep = jcall.find(main.data?.steps, value.value.id);
                const meta = jcall.meta(targetStep);
                if (targetStep && meta)
                    return makeDropable(Button(chooseTranslation(meta.displayText))
                        .addPrefix(
                            Icon(meta.icon)
                                .addClass("action-icon", "main")
                                .addClass(`color-${meta.color}`)
                        )
                        .onClick(() => alert("*Open Edit Menu for Parameter*"))
                        .setColor(Color.Colored)
                        .setStyle(ButtonStyle.Secondary), (e) => e.trace ? jcall.traceEditSingle(main.data.steps, step!.trace!, { ...value, value: { type: "response", id: e.trace } }) : null);

            }
        }
    }
    return PlainText(JSON.stringify(value)).setFont(0.6, 500);
}

function handleResponseAndVariable(data: Record<"variable" | "response", string | undefined>, jcall: JsonCalls, main: ActionTuple, trace: Trace, value: CallParameters) {
    if (data.variable)
        jcall?.traceEditSingle(main.data.steps, trace, { ...value, value: { type: "variable", id: data.variable } });
    if (data.response)
        jcall?.traceEditSingle(main.data.steps, trace, { ...value, value: { type: "response", id: data.response } });
}
