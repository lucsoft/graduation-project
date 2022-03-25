import { Action, ActionId, Language } from "./spec.ts";
export function registerMetaCategory(category: Map<string, Record<Language, string>>) {
    category.set("script", { de: "Skripte", en: "Scripts" });
}
export function registerMetaData(regi: Map<ActionId, Action>) {
    regi.set("buildIn.truthy", {
        steps: "native",
        color: "green",
        category: "conditions",
        icon: "done",
        displayText: {
            de: "ist positive",
            en: "is positiv"
        },
        parameters: [
            {
                type: "string",
                name: "value"
            }
        ]
    })
    regi.set("buildIn.falsy", {
        steps: "native",
        color: "red",
        category: "conditions",
        icon: "close",
        displayText: {
            de: "ist negativ",
            en: "is negative"
        },
        parameters: [
            {
                type: "string",
                name: "value"
            }
        ]
    })
    regi.set("buildIn.text", {
        steps: "native",
        color: "yellow",
        category: "system",
        icon: "notes",
        displayText: {
            de: "Text",
            en: "Text"
        }
    })
    regi.set("buildIn.if", {
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
        },
        branch: {
            default: [
                "true",
                "false"
            ],
            hideFirstStep: true,
            otherBlocks: {
                false: {
                    de: "Sonst",
                    en: "Else"
                }
            },
            endBlock: {
                de: 'Ende von "Wenn"',
                en: 'End of "When"'
            }
        },
        parameters: [
            {
                type: "boolean",
                name: "value"
            }
        ]
    })
    regi.set("buildIn.try", {
        steps: "native",
        color: "gray",
        category: "script",
        icon: "sync_problem",
        displayText: {
            de: "Versuchen",
            en: "Try"
        },
        inlineText: {
            de: [ "Ausführen mit", 0, "versuchen" ],
            en: [ "Execute with", 0, "tries" ]
        },
        parameters: [
            {
                name: "tries",
                type: "number",
                hint: "value"
            }
        ],
        branch: {
            default: [
                "tries"
            ],
            hideFirstStep: true,
            endBlock: {
                de: 'Ende von "Versuchen"',
                en: 'End of "Try"'
            }
        }
    })
    regi.set("buildIn.repeatWith", {
        displayText: {
            de: "Durchlaufen",
            en: "Run through"
        },
        steps: "native",
        category: "script",
        color: "gray",
        icon: "data_array"
    })
    regi.set("buildIn.repeat", {
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
        },
        branch: {
            default: [
                "repeating"
            ],
            hideFirstStep: true,
            endBlock: {
                de: 'Ende von "Wiederholen"',
                en: 'End of "Repeat"'
            }
        },
        parameters: [
            {
                name: "count",
                type: "number",
                hint: "count"
            }
        ]
    })
    regi.set("buildIn.sleep", {
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
                hint: "secound"
            }
        ]
    })
    regi.set("buildIn.multiVariables", {
        color: "orange",
        category: "meta",
        icon: "post_add",
        steps: "native",
        displayText: {
            de: "Variablen festlegen",
            en: "Set variables"
        },
        parameters: [
            { type: "key-value", name: "store", hidden: true }
        ]
    });
    regi.set("buildIn.variable", {
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
    regi.set("buildIn.comment", {
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