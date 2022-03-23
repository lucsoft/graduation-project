import { assert } from "https://deno.land/std@0.130.0/testing/asserts.ts";
import { ComponentArray, Horizontal, PlainText, Spacer, Vertical } from "../../WebGen/mod.ts";
import { toFirstUpperCase } from "../helper.ts";
import { JsonCalls } from "../json-calls-protocol/mod.ts";
import { ActionId, ActionTuple, CallStep } from "../json-calls-protocol/spec.ts";
import { SimpleAction } from "./action.ts";
import { Dropable, Movable } from "./dragAndDrop.ts";
import { choose } from "./i18n.ts";
import { RichAction } from "./richAction.ts";
import { SidePanel } from "./sidepanel.ts";
import { State } from "./types.ts";

export const EditorView = (jcall: JsonCalls, state: Partial<State>, update: (data: Partial<State>) => void) => {
    const actionId = state.tabs?.[ state.selectedTab ?? 0 ] as ActionId;
    const running = Object.keys(state.runner ?? {}).includes(actionId);
    const action = jcall.metaFromId(actionId);
    if (!action) return null;
    return Horizontal(
        SidePanel(running, update, state, jcall),
        Spacer(),
        action.steps === "native"
            ? PlainText("Can't edit a Native Action")
            : Vertical(
                running ? null : Dropable((data, del) => jcall.addFirstStep(actionId, data, del)),
                ...action.steps.map(x => renderCallStep(state, jcall, x, { id: actionId, data: action }, running)).flat()
            ).setWidth("45%"),
        Spacer()
    ).addClass("container");
};

function renderCallStep(state: Partial<State>, jcall: JsonCalls, call: CallStep, main: ActionTuple, running: boolean) {
    const step = jcall.meta(call);
    assert(step);
    const list: ComponentArray = [
        running ? RichAction(state, jcall, { id: call.id, data: step }, call, main, false)
            : Movable(call, RichAction(state, jcall, { id: call.id, data: step }, call, main))
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
                    }, "normal", !running),
                Horizontal(
                    Dropable((dropData, deleteOld) => jcall.addFirstBranchStep(main.id, dropData, call.trace!, id, deleteOld)),
                    ...data.map(x => renderCallStep(state, jcall, x, main, running)).flat()
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
            }, "normal", !running)
        )
    list.push(Dropable((data, deleteOld) => jcall.addStepAfter(main.id, data, call.trace!, deleteOld)));
    return list;
}