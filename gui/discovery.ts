import { Component, Horizontal, Spacer, Vertical, PlainText, Grid } from "../../WebGen/mod.ts";
import { limit } from "../helper.ts";
import { JsonCalls } from "../json-calls-protocol/mod.ts";
import { SimpleAction } from "./action.ts";
import { State } from "./types.ts";

export function DiscoveryView(jcall: JsonCalls, state: Partial<State>, update: (data: Partial<State>) => void): Component {
    return Horizontal(
        Spacer(),
        Vertical(
            Spacer(),
            Horizontal(
                PlainText("Zuletzt verwendet", "h1")
                    .setMargin("8rem 0 .5rem")
                    .setFont(1.8, 500),
                Spacer()
            ),
            Grid(
                ...Array.from(jcall.steps.values()).filter(limit(3 * 2)).map((x, index) =>
                    SimpleAction(x, "full.focus")
                        .onClick(() => {
                            update({
                                tabs: state.tabs?.map((x, i) => i == state.selectedTab ? index : x)
                            })
                        })
                )
            )
                .setGap("8px")
                .setDynamicColumns(14),
            Horizontal(
                PlainText("Alle Aktionen", "h1")
                    .setMargin("2rem 0 .5rem")
                    .setFont(1.8, 500),
                Spacer()
            ),
            Grid(
                ...Array.from(jcall.steps.values()).map((x, index) =>
                    SimpleAction(x, "normal", false)
                        .onClick(() => {
                            update({
                                tabs: state.tabs?.map((x, i) => i == state.selectedTab ? index : x)
                            })
                        })
                )
            )
                .setGap("8px")
                .setDynamicColumns(9),
            Spacer(),
            Spacer(),
            Spacer()
        ).setWidth("50%"),
        Spacer()
    );
}
