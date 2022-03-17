import { Button, ButtonStyle, Card, Color, Component, Grid, headless, Horizontal, Input, PlainText, Spacer, Vertical } from "../../WebGen/mod.ts";
import { JsonCalls } from "../json-calls-protocol/mod.ts";
import { ActionId, CallStep, Step } from "../json-calls-protocol/spec.ts";
import { SimpleAction } from "./action.ts";
import { translate } from "./i8n.ts";
import { RichAction } from "./richAction.ts";
import { State } from "./types.ts";

export const EditorView = (jcall: JsonCalls, state: Partial<State>, _update: (data: Partial<State>) => void) => {
    const step = jcall.getStepFromIndex(state.tabs?.[ state.selectedTab ?? 0 ] as number);
    if (!step) return null;
    return Horizontal(
        Card(headless(
            Vertical(
                Input({
                    placeholder: "Suchbegriff"
                }),
                Grid(
                    Button("Alle Aktionen")
                        .setColor(Color.Colored)
                        .setStyle(ButtonStyle.Secondary),
                    Button("Ventile")
                        .setColor(Color.Colored)
                        .setStyle(ButtonStyle.Inline),
                    Button("Motore")
                        .setColor(Color.Colored)
                        .setStyle(ButtonStyle.Inline),
                    Button("Heater")
                        .setColor(Color.Colored)
                        .setStyle(ButtonStyle.Inline),
                    Button("Flüssigkeiten")
                        .setColor(Color.Colored)
                        .setStyle(ButtonStyle.Inline),
                    Button("System")
                        .setColor(Color.Colored)
                        .setStyle(ButtonStyle.Inline),
                    Button("Laser")
                        .setColor(Color.Colored)
                        .setStyle(ButtonStyle.Inline),
                    Button("Kamera")
                        .setColor(Color.Colored)
                        .setStyle(ButtonStyle.Inline),
                    Button("Kasseten")
                        .setColor(Color.Colored)
                        .setStyle(ButtonStyle.Inline)
                )
                    .addClass("quick-filter")
                    .setGap("0 1.5rem")
                    .setPadding("18px 0")
                    .setEvenColumns(3),
                Vertical(
                    ...(Array.from([
                        ...jcall.userActions.entries(),
                        ...jcall.buildInActions.entries(),
                        ...jcall.nativeActions.entries()
                    ])
                        .map(([ _, step ]) => step)
                        .filter(step => step.category !== "conditions")
                        .map(step => SimpleAction(step, "small", false))),
                ).setGap("8px")
            ).setPadding("10px")
        ))
            .addClass("sidepanel")
            .setDirection("column")
            .setAlign("stretch"),
        Spacer(),
        step.actions === "native"
            ? PlainText("Can't edit a Native Action")
            : Vertical(
                ...step.actions.map(x => renderCallStep(jcall, x, step)).flat(),
            ).setGap("14px").setWidth("45%"),
        Spacer()
    ).addClass("container");
};

function renderCallStep(jcall: JsonCalls, call: CallStep, main: Step) {
    const step = jcall.getMetaDataFromId(call.id);
    const list: (Component | null)[] = [ step ? RichAction(jcall, step, call, main) : incompatibleFunction(call.id) ];
    if (call.branch)
        list.push(...Object.entries(call.branch)
            .map(([ id, data ]) => [
                `${call.id}.${id}` == "buildIn.if.true"
                    ? null
                    : SimpleAction({ icon: step?.icon!, actions: "native", category: undefined, color: step?.color!, displayText: translate(`${call.id}.${id}`) }, "normal"),
                Horizontal(...data.map(x => renderCallStep(jcall, x, main)).flat())
                    .setPadding("0 0 0 1rem")
                    .setGap("10px")
                    .setDirection("column")
            ]).flat(),
            SimpleAction({ icon: step?.icon!, color: step?.color!, category: undefined, actions: "native", displayText: translate(`${call.id}.end`) }, "normal")
        )
    return list;
}

function incompatibleFunction(stepId: ActionId): Component | null {
    return SimpleAction({ icon: "question_mark", color: "gray", category: undefined, actions: "native", displayText: translate(stepId) }, "normal");
}
