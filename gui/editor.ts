import { Button, ButtonStyle, Card, Color, Component, Grid, headless, Horizontal, Input, PlainText, Spacer, Vertical } from "../../WebGen/mod.ts";
import { JsonCalls } from "../json-calls-protocol/mod.ts";
import { CallStep } from "../json-calls-protocol/spec.ts";
import { Action, ActionAsStep, ActionWithCaller } from "./action.ts";
import { translate } from "./i8n.ts";
import { State } from "./types.ts";

export const EditorView = (jcall: JsonCalls, state: Partial<State>, _update: (data: Partial<State>) => void) => {
    const actions = jcall.getStepFromIndex(state.tabs?.[ state.selectedTab ?? 0 ] as number)?.actions;
    if (!actions) return null;
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
                    Action(("settings"), "green", "small", [ "Motore sperre" ]),
                    Action(("sensor_door"), "steel", "small", [ "Auf Türschließung warten" ]),
                    Action(("cleaning_services"), "yellow", "small", [ "Tür sperre" ])
                ).setGap("8px")
            ).setPadding("10px")
        ))
            .addClass("sidepanel")
            .setDirection("column")
            .setAlign("stretch"),
        Spacer(),
        actions === "native"
            ? PlainText("Can't edit a Native Action")
            : Vertical(
                ...actions.map(x => renderCallStep(jcall, x)).flat(),
            ).setGap("14px").setWidth("45%"),
        Spacer()
    ).addClass("container");
};

function renderCallStep(jcall: JsonCalls, { id: stepId, branch, paramter }: CallStep) {
    const [ stepType, stepRawId ] = stepId.split(".");
    const step = jcall.getStepMapFromType(stepType)?.get(stepRawId);
    const list: (Component | null)[] = [ step ? ActionWithCaller(step, { id: stepId, branch, paramter }) : Action("question_mark", "gray", "normal", [ translate(stepId) ]) ];
    console.log()
    if (branch)
        list.push(...Object.entries(branch)
            .map(([ id, data ]) => [
                `${stepId}.${id}` == "buildIn.if.true" ? null : Action(step?.icon, step?.color, "normal", [ translate(`${stepId}.${id}`) ]),
                Horizontal(...data.map(x => renderCallStep(jcall, x)).flat())
                    .setPadding("0 0 0 1rem")
                    .setDirection("column")
            ]
            ).flat(),
            Action(step?.icon, step?.color, "normal", [ translate(`${stepId}.end`) ])
        )
    return list;
}