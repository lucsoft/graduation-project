import { MaterialIcons, Horizontal, Icon, SupportedThemes, Vertical, View, WebGen, Input, CustomComponent } from "../../WebGen/mod.ts";
import { ActionState, State } from "./types.ts";
import './style/color.css';
import { EditorView } from "./editor.ts";
import { Action } from "./action.ts";
import { DiscoveryView } from "./discovery.ts";
import './style/sidepanel.css';

WebGen({
    theme: SupportedThemes.light,
    icon: new MaterialIcons()
})

const defaultTabs: ActionState[] = [
    {
        color: "yellow",
        type: "full",
        icon: "cleaning_services",
        title: [ "This is a test" ]
    }
];

View<State>(({ state, update }) => Vertical(
    Horizontal(
        ...(state.tabs ?? []).map(renderNavigationEntry(state, update)),
        Icon("add").addClass("new-tab").onClick(() => {
            update({
                selectedTab: state.tabs?.length,
                tabs: [
                    ...state.tabs ?? [],
                    "searchtab"
                ]
            })
        })
    )
        .setGap("8px")
        .addClass("navigation")
        .setAlign("center"),
    state.tabs?.[ state.selectedTab ?? 0 ] == "searchtab" ?
        DiscoveryView(state, update)
        : EditorView()
)
    .setPadding("9px 13px")
    .setGap(".7rem"))
    .appendOn(document.body)
    .unsafeViewOptions()
    .update({
        selectedTab: 0,
        tabs: defaultTabs
    });

function renderNavigationEntry(state: Partial<State>, update: (data: Partial<State>) => void): (value: ActionState, index: number, array: ActionState[]) => CustomComponent {
    return (entry, index) => {
        const main = (state.selectedTab ?? 0) == index;
        const element = entry == "searchtab"
            ? Action("search", "steel", "full", [ "Search" ])
            : Action(entry.icon, entry.color, entry.type, entry.title, true, [ Icon("play_arrow").addClass("action-icon") ])
        if (main)
            return element.setGrow(3)

        if (entry == "searchtab")
            return element
                .setGrow(1)
                .onClick(() => update({ selectedTab: index }))
        return Action(entry.icon, entry.color, entry.type, entry.title)
            .setGrow(1)
            .onClick(() => update({ selectedTab: index }))

    };
}
