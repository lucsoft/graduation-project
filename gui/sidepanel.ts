import { Button, ButtonStyle, Card, Color, Component, Grid, headless, Horizontal, Icon, Input, PlainText, Spacer, Vertical, View } from "https://raw.githubusercontent.com/lucsoft/WebGen/39f8439fb8e478dba5d351546f0156d331ebda3d/mod.ts";
import { JsonCalls } from "../json-calls-protocol/mod.ts";
import { Action, ActionId, ActionTuple, CallParameters } from "../json-calls-protocol/spec.ts";
import { SimpleAction } from "./action.ts";
import { Movable } from "./dragAndDrop.ts";
import { defaultOrTranslation } from "./i18n.ts";
import { branches, sortByRelevance } from "./math.ts";
import { State } from "./types.ts";

export function SidePanel(running: boolean, update: (data: Partial<State>) => void, state: Partial<State>, jcall: JsonCalls): Component {
    const actionList = View<{ actions: Map<ActionId, Action>, query: string }>(({ state }) => Vertical(
        (state.actions ? Array.from(state.actions.entries())
            .map(([ id, data ]) => ({ id, data }) as ActionTuple)
            .filter(({ data }) => defaultOrTranslation(data.displayText).toLowerCase().startsWith(state.query?.toLowerCase() ?? ""))
            .sort(sortByRelevance())
            .filter(step => step.data.category !== "conditions")
            .map(({ id, data }) => Movable({ id, branch: branches(jcall, id) }, SimpleAction(data, "small", false), false)) : []),
    ).setGap("8px"));
    return Card(headless(
        Vertical(
            running
                ? [
                    PlainText("Laufzeit-Variablen")
                        .setFont(0.75, 500)
                        .setWidth("17.9rem"),
                    PlainText("Keine Variablen")
                        .setFont(0.6, 600)
                        .setMargin(".2rem 0 0"),
                    Spacer().setMargin("2rem 0"),
                    Horizontal(
                        Spacer(),
                        Icon("bug_report")
                            .onClick(() => update({ debugMode: !(state.debugMode ?? false) }))
                            .setPadding("10px")
                    )
                        .addClass("icons")
                        .setGap("4px")
                ]
                : [
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
                ]
        ).setPadding("10px")
    )).addClass("sidepanel")
        .setDirection("column")
        .setAlign("stretch");
}
