import { MaterialIcons, Horizontal, Icon, SupportedThemes, Vertical, View, WebGen, CustomComponent, PlainText, headless, Card, Component, createElement, Custom } from "../../WebGen/mod.ts";
import { State, TabEntry } from "./types.ts";
import './style/color.css';
import { EditorView } from "./editor.ts";
import { SimpleAction } from "./action.ts";
import { DiscoveryView } from "./discovery.ts";
import './style/sidepanel.css';
import { JsonCalls } from "../json-calls-protocol/mod.ts";
import { register } from "../test-data.ts";
import { streamAsyncIterable } from "../json-calls-protocol/polyfill.ts";

WebGen({
    theme: SupportedThemes.light,
    icon: new MaterialIcons()
})

const jcall = new JsonCalls()

register(jcall);
const defaultTabs: TabEntry[] = [
    "search-tab"
];

const ViewState = View<State>(({ state, update }) => Vertical(
    Horizontal(
        ...(state.tabs ?? []).map(renderNavigationEntry(state, update)),
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
    .appendOn(document.body);

ViewState.unsafeViewOptions().update({
    selectedTab: 0,
    tabs: defaultTabs
});
async function startProcess(id: string) {
    let state = ViewState.unsafeViewOptions();
    state.update({ runner: { ...state.state.runner, [ id ]: [] } });
    for await (const response of streamAsyncIterable(jcall.streamRun(`user.${id}`))) {
        const state = ViewState.unsafeViewOptions();
        state.update({ runner: { ...state.state.runner, [ id ]: [ ...(state.state.runner?.[ id ] ?? []), response ] } });
        console.log(response)
    }
    await (new Promise((done) => setTimeout(done, 200)))
    state = ViewState.unsafeViewOptions();
    const newState = { ...state.state.runner };
    delete newState[ id! ];
    state.update({ runner: { ...newState } });
}
function renderNavigationEntry(state: Partial<State>, update: (data: Partial<State>) => void): (value: TabEntry, index: number, array: TabEntry[]) => CustomComponent {
    return (entry, index) => {
        const main = (state.selectedTab ?? 0) == index;
        let element: Component;
        const div = createElement("div")
        const progress = Custom(div).addClass("progressbar")
        if (entry == "search-tab") element = Card(headless(PlainText("Search"))).addClass("action", "full");
        else {
            const step = jcall.getStepFromIndex(entry)!;
            const stepId = jcall.getStepIdFromIndex(entry);
            const exec = stepId ? state.runner?.[ stepId ] : undefined;
            if (exec) {
                if (exec.length == 0)
                    div.style.width = "2%";
                else {
                    div.style.width = ((1 - exec.at(-1)!._callsLeft / exec[ 0 ]!._callsLeft) * 100) + "%";
                }
            }

            element = SimpleAction(step, "full", true, [
                Icon(exec ? "stop" : "play_arrow").addClass("action-icon").onClick(() => {
                    if (!exec)
                        startProcess(jcall.getStepIdFromIndex(entry)!)
                })
            ])
        }
        if (main)
            return element
                .addPrefix(progress).setGrow(3)

        if (entry == "search-tab")
            return element
                .setGrow(1)
                .onClick(() => update({ selectedTab: index }))
        return SimpleAction(jcall.getStepFromIndex(entry)!, "full")
            .setGrow(1)
            .addPrefix(progress)
            .onClick(() => update({ selectedTab: index }))

    };
}
