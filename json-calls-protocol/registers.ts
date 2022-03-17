import { Action } from "./spec.ts";
export function registerMetaCategory(category: Map<string, { de: string, en: string }>) {
    category.set("script", { de: "Skripte", en: "Scripts" });
}
export function registerMetaData(buildIn: Map<string, Action>) {
    buildIn.set("truthy", {
        steps: "native",
        color: "green",
        category: "conditions",
        icon: "done",
        displayText: "ist positiv"
    })
    buildIn.set("falsy", {
        steps: "native",
        color: "red",
        category: "conditions",
        icon: "close",
        displayText: "ist negativ"
    })
    buildIn.set("text", {
        steps: "native",
        color: "yellow",
        category: "system",
        icon: "notes",
        displayText: "Text"
    })
    buildIn.set("if", {
        steps: "native",
        color: "gray",
        category: "script",
        displayText: "Wenn",
        icon: "fork_right",
        inlineText: {
            de: [ "Wenn", 0, -1 ],
            en: [ "When", 0, -1 ]
        }
    })
    buildIn.set("retry", {
        steps: "native",
        color: "gray",
        category: "script",
        icon: "sync_problem",
        displayText: "Versuchen*"
    })
    buildIn.set("repeatWith", {
        displayText: "Durchlaufen*",
        steps: "native",
        category: "script",
        color: "gray",
        icon: "data_array"
    })
    buildIn.set("repeat", {
        steps: "native",
        color: "gray",
        category: "script",
        inlineText: {
            de: [ 0, "wiederholen" ],
            en: [ "Repeat", 0 ]
        },
        icon: "sync",
        displayText: "Wiederholen*"
    })
    buildIn.set("sleep", {
        steps: "native",
        color: "gray",
        category: "script",
        inlineText: {
            de: [ 0, "warten" ],
            en: [ "Wait", 0 ]
        },
        displayText: "Warten",
        icon: "hourglass_bottom",
        parameters: [
            {
                type: "number",
                name: "amount",
                hint: "secounds"
            }
        ]
    })
    buildIn.set("variable", {
        steps: "native",
        color: "orange",
        category: "script",
        displayText: "Zu Variable hinzufügen",
        icon: "format_quote",
        parameters: [
            { type: "number", name: "source" },
            { type: "string", name: "target" }
        ],
        inlineText: {
            de: [ 0, "zu", 1, "hinzufügen" ],
            en: [ "Set", 0, "to", 1 ]
        }
    })
    buildIn.set("comment", {
        steps: "native",
        color: "gray",
        category: "system",
        icon: "notes",
        displayText: "Kommentar"
    })
}