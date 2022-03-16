import { Component, Horizontal, Spacer, Vertical, PlainText, Grid } from "../../WebGen/mod.ts";
import { Action } from "./action.ts";
import { State } from "./types.ts";

export function DiscoveryView(state: Partial<State>, update: (data: Partial<State>) => void): Component {
    return Horizontal(
        Spacer(),
        Vertical(
            Spacer(),
            Horizontal(
                PlainText("Zuletzt verwendet", "h1")
                    .setMargin("2rem 0 .5rem")
                    .setFont(1.8, 500),
                Spacer()
            ),
            Grid(
                Action("star_rate", "blue-violet", "full.focus", [ "test" ])
                    .onClick(() => {
                        update({
                            tabs: state.tabs?.map((x, i) => i == state.selectedTab ? {
                                icon: "star_rate",
                                color: "blue-violet",
                                title: [ "test" ],
                                type: "full"
                            } : x)
                        })
                    }),
                Action("bento", "blue", "full.focus", [ "test" ]),
                Action("lightbulb", "steel", "full.focus", [ "test" ]),
                Action("bento", "green", "full.focus", [ "test" ]),
                Action("lightbulb", "yellow", "full.focus", [ "test" ]),
                Action("star_rate", "red-orange", "full.focus", [ "test" ])
            )
                .setGap("8px")
                .setEvenColumns(3),
            Horizontal(
                PlainText("Alle Aktionen", "h1")
                    .setMargin("2rem 0 .5rem")
                    .setFont(1.8, 500),
                Spacer()
            ),
            Grid(
                Action("star_rate", "blue-violet", "normal", [ "test" ], false),
                Action("bento", "blue", "normal", [ "test" ], false),
                Action("lightbulb", "steel", "normal", [ "test" ], false),
                Action("bento", "green", "normal", [ "test" ], false),
                Action("lightbulb", "yellow", "normal", [ "test" ], false),
                Action("star_rate", "red-orange", "normal", [ "test" ], false)
            )
                .setGap("8px")
                .setEvenColumns(4),
            Spacer(),
            Spacer(),
            Spacer()
        ).setWidth("50%"),
        Spacer()
    ).addClass("container");
}
