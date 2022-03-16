import { Button, ButtonStyle, Card, Color, Grid, headless, Horizontal, Icon, Input, Spacer, Vertical } from "../../WebGen/mod.ts";
import { Action } from "./action.ts";

export const EditorView = () => Horizontal(
    Card(headless(
        Vertical(
            Input({
                placeholder: "Suchbegriff"
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
            Vertical(
                Action(("settings"), "green", "small", [ "Motore sperre" ]),
                Action(("sensor_door"), "steel", "small", [ "Auf Türschließung warten" ]),
                Action(("cleaning_services"), "yellow", "small", [ "Tür sperre" ])
            ).setGap("8px")
        ).setPadding("10px")
    ))
        .addClass("sidepanel")
        .setDirection("column")
        .setAlign("stretch"),
    Spacer(),
    Vertical(
        Action(("settings"), "green", "normal", [ "Motore sperre" ]),
        Action(("cleaning_services"), "yellow", "normal", [ "Tür sperre" ]),
        Action(("sensor_door"), "steel", "normal", [ "Auf Türschließung warten" ]),
        Action(("cleaning_services"), "yellow", "normal", [ "Tür sperre" ]),
        Action(("settings"), "green", "normal", [ "Motore sperre" ])
    ).setGap("14px").setWidth("45%"),
    Spacer()
).addClass("container");
