import { Button, ButtonStyle, Card, Color, ComponentArray, Grid, headless, Horizontal, Input, PlainText, Spacer, Vertical, View } from "../../WebGen/mod.ts";
import { toFirstUpperCase } from "../helper.ts";
import { JsonCalls } from "../json-calls-protocol/mod.ts";
import { Action, ActionId, ActionTuple, CallStep } from "../json-calls-protocol/spec.ts";
import { SimpleAction } from "./action.ts";
import { Dropable, Movable } from "./dragAndDrop.ts";
import { choose, defaultOrTranslation } from "./i18n.ts";
import { branches, sortByRelevance } from "./math.ts";
import { RichAction } from "./richAction.ts";
import { State } from "./types.ts";

export const EditorView = (jcall: JsonCalls, state: Partial<State>, _update: (data: Partial<State>) => void) => {
    const actionId = state.tabs?.[ state.selectedTab ?? 0 ] as ActionId;
    const action = jcall.metaFromId(actionId);
    const actionList = View<{ actions: Map<ActionId, Action>, query: string }>(({ state }) => Vertical(
        (state.actions ? Array.from(state.actions.entries())
            .filter(([ _, x ]) => defaultOrTranslation(x.displayText).toLowerCase().startsWith(state.query?.toLowerCase() ?? ""))
            .sort(sortByRelevance())
            .filter(step => step[ 1 ].category !== "conditions")
            .map(([ id, action ]) => Movable({ id, branch: branches(jcall, id) }, SimpleAction(action, "small", false), false)) : []),
    ).setGap("8px"));

    if (!action) return null;
    return Horizontal(
        Card(headless(
            Vertical(
                Input({
                    placeholder: "Suchbegriff",
                    liveOn: (val) => actionList
                        .viewOptions()
                        .update({ query: val })
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
                actionList
                    .change(({ update }) => update({
                        actions: jcall.actions
                    }))
                    .asComponent()
            ).setPadding("10px")
        ))
            .addClass("sidepanel")
            .setDirection("column")
            .setAlign("stretch"),
        Spacer(),
        action.steps === "native"
            ? PlainText("Can't edit a Native Action")
            : Vertical(
                Dropable((data, del) => jcall.addFirstStep(actionId, data, del)),
                ...action.steps.map(x => renderCallStep(state, jcall, x, [ actionId, action ])).flat()
            ).setWidth("45%"),
        Spacer()
    ).addClass("container");
};

function renderCallStep(state: Partial<State>, jcall: JsonCalls, call: CallStep, main: ActionTuple) {
    const step = jcall.meta(call);
    if (!step) throw new Error(`${call.id} is undefined!`);
    const list: ComponentArray = [
        Movable(call, RichAction(state, jcall, [ call.id, step ], call, main))
    ];
    if (call.branch)
        list.push(Object.entries(call.branch)
            .map(([ id, data ]) => [
                step.branch?.hideFirstStep === true && id == Object.keys(call.branch ?? {})[ 0 ]
                    ? null
                    : SimpleAction({
                        icon: step.icon,
                        steps: "native",
                        category: undefined,
                        color: step.color,
                        displayText: choose(step.branch?.otherBlocks?.[ id ]) ?? toFirstUpperCase(id)
                    }, "normal"),
                Horizontal(
                    Dropable((dropData, deleteOld) => jcall.addFirstBranchStep(main[ 0 ], dropData, call.trace!, id, deleteOld)),
                    ...data.map(x => renderCallStep(state, jcall, x, main)).flat()
                )
                    .setPadding("0 0 0 1rem")
                    .setDirection("column")
            ]).flat(),
            SimpleAction({
                icon: step.icon,
                color: step.color,
                category: undefined,
                steps: "native",
                displayText: choose(step.branch?.endBlock)
            }, "normal")
        )
    list.push(Dropable((data, deleteOld) => jcall.addStepAfter(main[ 0 ], data, call.trace!, deleteOld)));
    return list;
}