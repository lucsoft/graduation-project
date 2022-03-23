import { JsonCalls } from "./json-calls-protocol/mod.ts";

export function register(jcall: JsonCalls) {

    let lampState = false;
    jcall.category.set("test", {
        de: "Test",
        en: "Test"
    });
    jcall.provider.set("native.getLamp", () => lampState);
    jcall.provider.set("native.devices", () => [ "lamp" ]);
    jcall.provider.set("native.lamp", ({ value }) => {
        if (value.type !== "boolean" || !Object.hasOwn(value, "value")) return null;
        console.log("LAMP", lampState, value.value);
        lampState = value.value;
        return lampState;
    });
    jcall.actions.set("native.getLamp", {
        color: "yellow",
        category: "test",
        inlineText: {
            de: [ "Licht abrufen" ],
            en: [ "Get Light" ]
        },
        icon: "lightbulb",
        displayText: {
            de: "Licht abrufen",
            en: "Get Light"
        },
        steps: "native"
    });
    jcall.actions.set("native.devices", {
        color: "blue",
        category: "test",
        icon: "devices_other",
        steps: "native",
        displayText: {
            de: "Geräte abrufen",
            en: "Get Devices"
        }
    })
    jcall.actions.set("native.lamp", {
        color: "yellow",
        category: "test",
        inlineText: {
            de: [ "Licht", 0 ],
            en: [ "Light", 0 ]
        },
        icon: "lightbulb",
        displayText: {
            de: "Licht konfigurieren",
            en: "Set Light"
        },
        steps: "native",
        parameters: [
            {
                name: "value",
                type: "boolean",
                value: false
            }
        ]
    });
    jcall.actions.set("user.empty", {
        icon: "check_box_outline_blank",
        color: "pink",
        displayText: "Leerer Aktion",
        category: undefined,
        steps: [

        ]
    })
    jcall.actions.set("user.sleep", {
        icon: "check_box_outline_blank",
        color: "pink",
        category: undefined,
        displayText: "Einfaches warten",
        steps: [
            {
                id: "buildIn.sleep",
                parameter: [
                    { name: "amount", type: "number", value: 0.5 }
                ]
            }
        ]
    })
    jcall.actions.set("user.test", {
        icon: "directions_bike",
        color: "green",
        displayText: "Komplexe Aktion",
        category: "test",
        steps: [
            {
                id: "native.getLamp"
            },
            {
                id: "native.devices"
            },
            {
                id: "buildIn.if",
                parameter: [ { type: "boolean", name: "value", value: { type: "response", id: "0" } } ],
                condition: { id: "buildIn.falsy" },
                branch: {
                    true: [
                        {
                            id: "buildIn.repeat",
                            parameter: [
                                { type: "number", name: "count", value: 5 }
                            ],
                            branch: {
                                repeating: [
                                    { id: "user.lampTest" }
                                ]
                            }
                        },
                        { id: "native.lamp", parameter: [ { type: "boolean", name: "value", value: true } ] }
                    ],
                    false: [
                        {
                            id: "buildIn.try",
                            parameter: [
                                {
                                    name: "tries",
                                    type: "number",
                                    value: 3
                                }
                            ],
                            branch: {
                                try: [
                                    { id: "user.lampTest" }
                                ]
                            }
                        },
                        { id: "native.lamp", parameter: [ { type: "boolean", name: "value", value: false } ] }
                    ]
                }
            }
        ]
    })
    jcall.actions.set("user.lampToggle", {
        icon: "light",
        category: "test",
        displayText: "Branching Test",
        color: "yellow",
        steps: [
            {
                id: "native.getLamp"
            },
            {
                id: "buildIn.if",
                parameter: [ { type: "boolean", name: "value", value: { type: "response", id: "0" } } ],
                condition: { id: "buildIn.truthy" },
                branch: {
                    true: [
                        { id: "native.lamp", parameter: [ { type: "boolean", name: "value", value: false } ] },
                        {
                            id: "buildIn.sleep",
                            parameter: [
                                { name: "amount", type: "number", value: 1 }
                            ]
                        },
                        { id: "native.lamp", parameter: [ { type: "boolean", name: "value", value: true } ] },
                        {
                            id: "buildIn.sleep",
                            parameter: [
                                { name: "amount", type: "number", value: 0.5 }
                            ]
                        },
                        { id: "native.lamp", parameter: [ { type: "boolean", name: "value", value: false } ] }
                    ],
                    false: [ { id: "native.lamp", parameter: [ { type: "boolean", name: "value", value: true } ] } ]
                }
            }
        ]
    })
    jcall.actions.set("user.lampToggleWithVariables", {
        icon: "light",
        color: "blue",
        category: "test",
        displayText: "Toggles the lamp",
        variables: {
            state: false
        },
        steps: [
            {
                id: "native.lamp",
                parameter: [
                    { type: "boolean", name: "value", value: false }
                ]
            },
            {
                id: "buildIn.variable",
                parameter: [
                    { type: "number", name: "source", value: { type: "response", id: "0" } },
                    { type: "string", name: "target", value: "state" }
                ]
            },
            {
                id: "buildIn.if",
                parameter: [ { type: "boolean", name: "value", value: { type: "variable", id: "state" } } ],
                condition: { id: "buildIn.truthy" },
                branch: {
                    true: [ { id: "native.lamp", parameter: [ { type: "boolean", name: "value", value: false } ] } ],
                    false: [ { id: "native.lamp", parameter: [ { type: "boolean", name: "value", value: true } ] } ]
                }
            }
        ]
    })
    jcall.actions.set("user.lampTest", {
        icon: "light",
        color: "violet",
        category: "test",
        displayText: "Blinken",
        steps: [
            {
                id: "native.lamp",
                parameter: [
                    { type: "boolean", name: "value", value: true }
                ]
            },
            {
                id: "buildIn.sleep",
                parameter: [
                    { name: "amount", type: "number", value: 5 }
                ]
            },
            {
                id: "native.lamp",
                parameter: [
                    { type: "boolean", name: "value", value: false }
                ]
            },
        ]
    })

}