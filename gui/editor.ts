import { Button, ButtonStyle, Card, Color, Component, Grid, headless, Horizontal, Input, PlainText, Spacer, Vertical } from "../../WebGen/mod.ts";
import { JsonCalls } from "../json-calls-protocol/mod.ts";
import { ActionId, CallStep } from "../json-calls-protocol/spec.ts";
import { SimpleAction } from "./action.ts";
import { translate } from "./i18n.ts";
import { RichAction } from "./richAction.ts";
import { State } from "./types.ts";

export const EditorView = (jcall: JsonCalls, state: Partial<State>, _update: (data: Partial<State>) => void) => {
    const ActionUnion = jcall.getUserActionIndex(state.tabs?.[ state.selectedTab ?? 0 ] as number);
    if (!ActionUnion) return null;
    const [ ActionId, Action ] = ActionUnion;
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
        Action.steps === "native"
            ? PlainText("Can't edit a Native Action")
            : Vertical(
                ...Action.steps.map(x => renderCallStep(state, jcall, x, ActionId)).flat(),
            ).setGap("14px").setWidth("45%"),
        Spacer()
    ).addClass("container");
};

function renderCallStep(state: Partial<State>, jcall: JsonCalls, call: CallStep, main: ActionId) {
    const step = jcall.meta(call);
    const list: (Component | null)[] = [ step ? RichAction(state, jcall, step, call, main) : incompatibleFunction(call.id) ];
    if (call.branch)
        list.push(...Object.entries(call.branch)
            .map(([ id, data ]) => [
                `${call.id}.${id}` == "buildIn.if.true"
                    ? null
                    : SimpleAction({ icon: step?.icon!, steps: "native", category: undefined, color: step?.color!, displayText: translate(`${call.id}.${id}`) }, "normal"),
                Horizontal(...data.map(x => renderCallStep(state, jcall, x, main)).flat())
                    .setPadding("0 0 0 1rem")
                    .setGap("10px")
                    .setDirection("column")
            ]).flat(),
            SimpleAction({ icon: step?.icon!, color: step?.color!, category: undefined, steps: "native", displayText: translate(`${call.id}.end`) }, "normal")
        )
    return list;
}

function incompatibleFunction(stepId: ActionId): Component | null {
    return SimpleAction({ icon: "question_mark", color: "gray", category: undefined, steps: "native", displayText: translate(stepId) }, "normal");
}
