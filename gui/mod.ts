import { MaterialIcons, Horizontal, Icon, SupportedThemes, Vertical, View, WebGen, CustomComponent, PlainText, headless, Card, Component, createElement, Custom, Dialog, Button } from "../../WebGen/mod.ts";
import { State, TabEntry } from "./types.ts";
import './style/color.css';
import { EditorView } from "./editor.ts";
import { SimpleAction } from "./action.ts";
import { DiscoveryView } from "./discovery.ts";
import './style/sidepanel.css';
import { JsonCalls } from "../json-calls-protocol/mod.ts";
import { register } from "../test-data.ts";
import { streamAsyncIterable } from "../json-calls-protocol/polyfill.ts";
import { ActionId } from "../json-calls-protocol/spec.ts";
import { applyProgress } from "./math.ts";

WebGen({
    theme: SupportedThemes.light,
    icon: new MaterialIcons()
})

const jcall = new JsonCalls()

register(jcall);

const ViewState = View<State>(({ state, update }) => Vertical(
    Horizontal(
        (state.tabs ?? []).map(renderNavigationEntry(state, update)),
        Icon("add").addClass("new-tab").onClick(() => {
            update({
                selectedTab: state.tabs?.length,
                tabs: [
                    ...state.tabs ?? [],
                    "search-tab"
                ]
            })
        })
    )
        .setGap("8px")
        .addClass("navigation")
        .setAlign("center"),
    state.tabs?.[ state.selectedTab ?? 0 ] == "search-tab" ?
        DiscoveryView(jcall, state, update)
        : EditorView(jcall, state, update)
)
    .setPadding("9px 13px")
    .setGap(".7rem"))
    .change(({ update }) => update({ selectedTab: 0, tabs: [ "search-tab" ] }))
    .appendOn(document.body);

addEventListener("actions-update", () => ViewState.change(({ update }) => update({})));

async function startProcess(id: ActionId) {
    let state = ViewState.viewOptions();
    state.update({ runner: { ...state.state.runner, [ id ]: [] } });
    try {

        for await (const response of streamAsyncIterable(jcall.runAsStream(id))) {
            console.log(response);
            const state = ViewState.viewOptions();
            state.update({ runner: { ...state.state.runner, [ id ]: [ ...(state.state.runner?.[ id ] ?? []), response ] } });
        }

    } catch (error) {
        Dialog(() => PlainText(error)).setTitle("Error").allowUserClose().addButton("OK", "remove").open()
    }
    await (new Promise((done) => setTimeout(done, 200)))
    state = ViewState.viewOptions();
    const newState = { ...state.state.runner };
    delete newState[ id! ];
    state.update({ runner: { ...newState } });
}

function renderNavigationEntry(state: Partial<State>, update: (data: Partial<State>) => void): (value: TabEntry, index: number, array: TabEntry[]) => CustomComponent {
    return (actionId, index) => {
        const main = (state.selectedTab ?? 0) == index;
        let element: Component;
        const div = createElement("div")
        const progress = Custom(div).addClass("progressbar")
        if (actionId == "search-tab") element = Card(headless(PlainText("Search"))).addClass("action", "full");
        else {
            const action = jcall.metaFromId(actionId)!;
            const exec = actionId ? state.runner?.[ actionId ] : undefined;
            applyProgress(exec, div);
            element = SimpleAction(jcall.traceform(action), "full", true, [
                Icon(exec ? "stop" : "play_arrow")
                    .addClass("action-icon")
                    .onClick(() => {
                        if (!exec) startProcess(actionId)
                    })
            ])
        }

        if (main)
            return element
                .addPrefix(progress)
                .setGrow(3)

        if (actionId == "search-tab")
            return element
                .setGrow(1)
                .onClick(() => update({ selectedTab: index }))

        return SimpleAction(jcall.metaFromId(actionId)!, "full")
            .setGrow(1)
            .addPrefix(progress)
            .onClick(() => update({ selectedTab: index }))

    };
}