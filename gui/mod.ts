import { Button, ButtonStyle, MaterialIcons, Card, Color, Component, Grid, headless, Horizontal, Icon, PlainText, Spacer, SupportedThemes, Vertical, View, WebGen } from "../../WebGen/mod.ts";
import { ActionType, ColorType, TitleType } from "./types.ts";
import './style/actions.css';
import './style/sidepanel.css';
import './style/color.css';
WebGen({
    theme: SupportedThemes.light,
    icon: new MaterialIcons()
})
type ActionState = {
    icon: string,
    color: ColorType,
    type: ActionType,
    title: TitleType
};
type State = {
    selectedTab: number,
    tabs: ActionState[]
};
// Action(Icon("cleaning_services"), "yellow", "full", [ "Wipe Down System" ]),
// Action(Icon("cleaning_services"), "yellow", "full", [ "Wipe Down System" ], [ Icon("play_arrow").addClass("action-icon") ]).setGrow(),
const defaultTabs: ActionState[] = [
    {
        color: "yellow",
        type: "full",
        icon: "cleaning_services",
        title: [ "Wipe Down System" ]
    }
];

View<State>(({ state, update }) => Vertical(
    Horizontal(
        ...(state.tabs ?? []).map((x, i) => (state.selectedTab ?? 0) == i
            ? Action(Icon(x.icon), x.color, x.type, x.title, [ Icon("play_arrow").addClass("action-icon") ])
                .setGrow()
            : Action(Icon(x.icon), x.color, x.type, x.title).onClick(() => update({ selectedTab: i }))),
        Icon("add").addClass("new-tab").onClick(() => {
            update({
                selectedTab: state.tabs?.length,
                tabs: [
                    ...state.tabs ?? [],
                    {
                        color: "yellow",
                        type: "full",
                        icon: "cleaning_services",
                        title: [ "Wipe Down System" ]
                    }
                ]
            })
        })
    ).setGap("8px").addClass("navigation").setAlign("center"),
    Horizontal(
        Card(headless(
            Vertical(
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
                    .setEvenColumns(3),
                Vertical(
                    Action(Icon("settings"), "green", "small", [ "Motore sperre" ]),
                    Action(Icon("sensor_door"), "steel", "small", [ "Auf Türschließung warten" ]),
                    Action(Icon("cleaning_services"), "yellow", "small", [ "Tür sperre" ]),
                ).setGap("10px")
            ).setPadding("10px")
        ))
            .addClass("sidepanel")
            .setDirection("column")
            .setAlign("stretch"),
        Spacer()
    ),
)
    .setPadding("9px 13px")
    .setGap(".7rem"))
    .appendOn(document.body).unsafeViewOptions().update({
        selectedTab: 0,
        tabs: defaultTabs
    });

function Action(icon: Component, color: ColorType, type: ActionType, title: TitleType, actions: Component[] = []) {
    return Card(headless(Horizontal(
        icon.addClass("action-icon").addClass("color-" + color),
        ...title.map(x =>
            typeof x == "string"
                ? PlainText(x).addClass("title")
                : null
        ),
        Spacer(),
        Vertical(
            ...actions
        ).setDirection("row").addClass("actions")
    ).setAlign("center"))).addClass("action", type.toLowerCase());
}