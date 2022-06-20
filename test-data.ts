import { JsonCalls } from "./json-calls-protocol/mod.ts";

export function register(jcall: JsonCalls) {

    let lampState = false;
    jcall.category.set("test", {
        de: "Test",
        en: "Test"
    });
    jcall.provider.set("native.getLamp", () => lampState);
    jcall.provider.set("native.opticits", () => undefined)
    jcall.provider.set("native.systemCopyInfo", () => undefined)
    jcall.provider.set("native.fluidsPrepAndRunBuffer", () => undefined)
    jcall.provider.set("native.singleSeparation", () => undefined)
    jcall.provider.set("native.moveMotors", () => undefined)
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
    jcall.actions.set("native.moveMotors", {
        color: "orange",
        category: "motor",
        icon: "view_in_ar",
        steps: "native",
        displayText: "Kanülen im Leerlauf",
        inlineText: {
            de: [ "Kanüle in ", 0, "Leerlauf stellen" ],
            en: [ "Move all Motors to", 0 ],
        },
        parameters: [
            { type: "string", name: "position" }
        ]
    })
    jcall.actions.set("native.singleSeparation", {
        color: "blue",
        category: "motor",
        icon: "swap_vert",
        steps: "native",
        displayText: "Einzelne Trennung",
    })
    jcall.actions.set("native.status", {
        color: "steel",
        category: "camera",
        icon: "info",
        steps: "native",
        inlineText: {
            de: [ "Systemstatus auf", 0 ],
            en: [ "Set Systemstatus to", 0 ]
        },
        parameters: [
            { type: "string", name: "status" }
        ],
        displayText: "Systemstatus setzen"
    })
    jcall.actions.set("native.systemCopyInfo", {
        color: "steel",
        category: "system",
        icon: "dns",
        steps: "native",
        displayText: "Kopiere Systemdateien"
    })
    jcall.actions.set("native.checkpoint", {
        color: "gray",
        category: "system",
        icon: "check_circle_outline",
        steps: "native",
        displayText: "Checkpoint",
        parameters: [
            { type: "string", name: "message" },
            { type: "number", name: "duration", hint: "secound" }
        ],
        inlineText: {
            de: [ "Checkpoint", 0, "erriecht in", 1 ],
            en: []
        }
    })
    jcall.actions.set("native.opticits", {
        color: "green",
        category: "camera",
        icon: "center_focus_weak",
        steps: "native",
        displayText: "Kameraeinstellung abrufen"
    })
    jcall.actions.set("native.fluidsPrepAndRunBuffer", {
        color: "blue",
        category: "fluids",
        icon: "water_drop",
        steps: "native",
        displayText: "Ventile vorbereiten und Puffer-Pumpe starten"
    });
    jcall.actions.set("user.demo", {
        icon: "waving_hand",
        color: "violet",
        displayText: "Demo: Einzelne Trennung",
        category: undefined,
        steps: [
            {
                id: "native.opticits"
            },
            {
                id: "buildIn.multiVariables",
                parameter: [
                    {
                        type: "key-value",
                        hidden: true,
                        name: "store",
                        value: [
                            [ "redOn", true ],
                            [ "blueOn", true ],
                            [ "heaterOn", true ],
                            [ "heaterTemp", 35, "tempature" ],
                            [ "rinseTime", 5000, "milliseconds" ],
                            [ "injectionVoltage", -3000, "power" ],
                            [ "injectionTime", 30000, "milliseconds" ],
                            [ "separationVoltage", -9000, "power" ],
                            [ "separationTime", 450000, "milliseconds" ],
                            [ "gelVolume", 135, "microliter" ],
                            [ "gelFlowRate", 135, "micoliterPerMinute" ],
                            [ "gelFillRate", 135, "micoliterPerMinute" ],
                        ]
                    }
                ]
            },
            {
                id: "native.systemCopyInfo"
            },
            {
                id: "native.fluidsPrepAndRunBuffer"
            },
            {
                id: "buildIn.repeat",
                parameter: [
                    { type: "number", name: "count", value: 500 }
                ],
                branch: {
                    repeating: [
                        { id: "native.singleSeparation" }
                    ]
                }
            },
            {
                id: "native.moveMotors",
                parameter: [
                    { type: "string", name: "position", value: "A1" }
                ]
            }
        ]
    })
    jcall.actions.set("user.lampToggle", {
        icon: "light",
        category: "test",
        displayText: "Verzweigungs Test",
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
                                { name: "amount", type: "number", value: 2 }
                            ]
                        },
                        { id: "native.lamp", parameter: [ { type: "boolean", name: "value", value: true } ] },
                        {
                            id: "buildIn.sleep",
                            parameter: [
                                { name: "amount", type: "number", value: 1 }
                            ]
                        },
                        { id: "native.lamp", parameter: [ { type: "boolean", name: "value", value: false } ] }
                    ],
                    false: [
                        { id: "native.lamp", parameter: [ { type: "boolean", name: "value", value: true } ] },
                        {
                            id: "buildIn.sleep",
                            parameter: [
                                { name: "amount", type: "number", value: 2 }
                            ]
                        },
                    ]
                }
            }
        ]
    })
    jcall.actions.set("user.sleep", {
        icon: "check_box_outline_blank",
        color: "pink",
        category: undefined,
        displayText: "Einfaches Warten",
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
    jcall.actions.set("user.lampToggleWithVariables", {
        icon: "light",
        color: "blue",
        category: "test",
        displayText: "Lampe umschalten",
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