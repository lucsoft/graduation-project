import { Step } from "./spec.ts";
export function registerMetaCategory(category: Map<string, { de: string, en: string }>) {
    category.set("script", { de: "Skripte", en: "Scripts" });
}
export function registerMetaData(buildIn: Map<string, Step>) {
    buildIn.set("truthy", {
        actions: "native",
        color: "green",
        category: "hide",
        icon: "done",
        displayText: "ist positiv"
    })
    buildIn.set("variable", {
        actions: "native",
        color: "gray",
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
    buildIn.set("sleep", {
        actions: "native",
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
    buildIn.set("if", {
        actions: "native",
        color: "gray",
        category: "script",
        displayText: "Wenn",
        icon: "fork_right",
        inlineText: {
            de: [ "Wenn", 0, -1 ],
            en: [ "When", 0, -1 ]
        }
    })
}