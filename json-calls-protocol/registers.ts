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
        displayText: {
            de: "ist positive",
            en: "is positiv"
        }
    })
    buildIn.set("falsy", {
        steps: "native",
        color: "red",
        category: "conditions",
        icon: "close",
        displayText: {
            de: "ist negativ",
            en: "is negative"
        }
    })
    buildIn.set("text", {
        steps: "native",
        color: "yellow",
        category: "system",
        icon: "notes",
        displayText: {
            de: "Text",
            en: "Text"
        }
    })
    buildIn.set("if", {
        steps: "native",
        color: "gray",
        category: "script",
        displayText: {
            de: "Wenn",
            en: "When"
        },
        icon: "fork_right",
        inlineText: {
            de: [ "Wenn", 0, -1 ],
            en: [ "When", 0, -1 ]
        }
    })
    buildIn.set("try", {
        steps: "native",
        color: "gray",
        category: "script",
        icon: "sync_problem",
        displayText: {
            de: "Versuchen",
            en: "Try"
        }
    })
    buildIn.set("repeatWith", {
        displayText: {
            de: "Durchlaufen",
            en: "Run through"
        },
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
        displayText: {
            de: "Wiederholen",
            en: "Repeat"
        }
    })
    buildIn.set("sleep", {
        steps: "native",
        color: "gray",
        category: "script",
        inlineText: {
            de: [ 0, "warten" ],
            en: [ "Wait", 0 ]
        },
        displayText: {
            de: "Warten",
            en: "Wait"
        },
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
        displayText: {
            de: "Zu Variable hinzufügen",
            en: "Add to variable"
        },
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
        displayText: {
            de: "Kommentar",
            en: "Comment"
        }
    })
}