import { MaterialIcons, Horizontal, Icon, SupportedThemes, Vertical, View, WebGen, CustomComponent, PlainText, headless, Card } from "../../WebGen/mod.ts";
import { State, TabEntry } from "./types.ts";
import './style/color.css';
import { EditorView } from "./editor.ts";
import { SimpleAction } from "./action.ts";
import { DiscoveryView } from "./discovery.ts";
import './style/sidepanel.css';
import { JsonCalls } from "../json-calls-protocol/mod.ts";
import { register } from "../test-data.ts";

WebGen({
    theme: SupportedThemes.light,
    icon: new MaterialIcons()
})

const jcall = new JsonCalls()

register(jcall);
const defaultTabs: TabEntry[] = [
    "search-tab"
];

View<State>(({ state, update }) => Vertical(
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
    .appendOn(document.body)
    .unsafeViewOptions()
    .update({
        selectedTab: 0,
        tabs: defaultTabs
    });

function renderNavigationEntry(state: Partial<State>, update: (data: Partial<State>) => void): (value: TabEntry, index: number, array: TabEntry[]) => CustomComponent {
    return (entry, index) => {
        const main = (state.selectedTab ?? 0) == index;
        const element = entry == "search-tab"
            ? Card(headless(PlainText("Search"))).addClass("action", "full")// Action("search", "steel", "full", [ "Search" ])
            : SimpleAction(jcall.getStepFromIndex(entry)!, "full", true, [ Icon("play_arrow").addClass("action-icon") ])
        if (main)
            return element.setGrow(3)

        if (entry == "search-tab")
            return element
                .setGrow(1)
                .onClick(() => update({ selectedTab: index }))
        return SimpleAction(jcall.getStepFromIndex(entry)!, "full")
            .setGrow(1)
            .onClick(() => update({ selectedTab: index }))

    };
}
