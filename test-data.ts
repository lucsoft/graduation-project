import { JsonCalls } from "./json-calls-protocol/mod.ts";

export function register(jcall: JsonCalls) {

    let lampState = false;
    jcall.category.set("test", {
        de: "Test",
        en: "Test"
    });
    jcall.methodProvider.set("getLamp", () => lampState);
    jcall.methodProvider.set("lamp", ({ value }) => {
        if (value.type !== "boolean" || !Object.hasOwn(value, "value")) return null;
        console.log("LAMP", lampState, value.value);
        lampState = value.value;
        return lampState;
    });
    jcall.native.set("getLamp", {
        color: "yellow",
        category: "test",
        inlineText: {
            de: [ "Licht abrufen" ],
            en: [ "Get Light" ]
        },
        icon: "lightbulb",
        displayText: "Licht abrufen",
        actions: "native"
    });
    jcall.native.set("lamp", {
        color: "yellow",
        category: "test",
        inlineText: {
            de: [ "Licht", 0 ],
            en: [ "Light", 0 ]
        },
        icon: "lightbulb",
        displayText: "Licht konfigurieren",
        actions: "native",
        parameters: [
            {
                name: "value",
                type: "boolean",
                value: false
            }
        ]
    });
    jcall.steps.set("lampToggle", {
        icon: "light",
        category: "test",
        displayText: "Flips the Lamp",
        color: "yellow",
        actions: [
            {
                id: "native.getLamp"
            },
            {
                id: "buildIn.if",
                paramter: [ { type: "boolean", name: "value", value: { type: "response", id: 1 } } ],
                condition: { id: "buildIn.truthy" },
                branch: {
                    true: [ { id: "native.lamp", paramter: [ { type: "boolean", name: "value", value: false } ] } ],
                    false: [ { id: "native.lamp", paramter: [ { type: "boolean", name: "value", value: true } ] } ]
                }
            }
        ]
    })
    jcall.steps.set("lampToggleWithVariables", {
        icon: "light",
        color: "blue",
        category: "test",
        displayText: "Toggles the lamp",
        variables: {
            state: false
        },
        actions: [
            {
                id: "native.lamp",
                paramter: [
                    { type: "boolean", name: "value", value: false }
                ]
            },
            {
                id: "buildIn.variable",
                paramter: [ { type: "boolean", name: "value", value: { type: "response", id: 0 } } ]
            },
            {
                id: "buildIn.if",
                paramter: [ { type: "boolean", name: "value", value: { type: "variable", id: "state" } } ],
                condition: { id: "buildIn.truthy" },
                branch: {
                    true: [ { id: "native.lamp", paramter: [ { type: "boolean", name: "value", value: false } ] } ],
                    false: [ { id: "native.lamp", paramter: [ { type: "boolean", name: "value", value: false } ] } ]
                }
            }
        ]
    })
    jcall.steps.set("lampTest", {
        icon: "light",
        color: "violet",
        category: "test",
        displayText: "Blinks the lamp",
        actions: [
            {
                id: "native.lamp",
                paramter: [
                    { type: "boolean", name: "value", value: true }
                ]
            },
            {
                id: "buildIn.sleep",
                paramter: [
                    { name: "amount", type: "number", value: 1000 }
                ]
            },
            {
                id: "native.lamp",
                paramter: [
                    { type: "boolean", name: "value", value: false }
                ]
            },
        ]
    })
    new Array(10).fill(1).forEach((_, i) => jcall.steps.set("counte" + i, {
        actions: [],
        category: "test",
        color: "gray",
        icon: "close"
    }))
}