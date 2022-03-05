import { JsonCalls } from "./mod.ts";

const jcall = new JsonCalls()

let lampState = false;
jcall.native.set("lamp", () => ({
    "on": () => {
        lampState = true;
    },
    "state": lampState,
    "off": () => {
        lampState = false;
    }
}));
jcall.steps.set("lampToggle", {
    icon: "light",
    actions: [
        {
            id: "native.lamp",
            paramter: [
                { name: "state", type: "boolean" }
            ]
        },
        {
            id: "buildIn.if",
            paramter: [ { type: "boolean", name: "value", value: { type: "response", id: 1 } } ],
            condition: { id: "buildIn.truthy" },
            branch: {
                true: [ { id: "native.lamp", paramter: [ { type: "function", name: "off" } ] } ],
                false: [ { id: "native.lamp", paramter: [ { type: "function", name: "on" } ] } ]
            }
        }
    ]
})
jcall.steps.set("lampToggleWithVariables", {
    icon: "light",
    displayText: "Toggles the lamp",
    variables: {
        state: false
    },
    actions: [
        {
            id: "native.lamp",
            paramter: [
                { name: "off", type: "function" }
            ]
        },
        {
            id: "buildIn.variable",
            paramter: [ { type: "boolean", name: "state", value: { type: "response", id: 0 } } ]
        },
        {
            id: "buildIn.if",
            paramter: [ { type: "boolean", name: "value", value: { type: "variable", id: "state" } } ],
            condition: { id: "buildIn.truthy" },
            branch: {
                true: [ { id: "native.lamp", paramter: [ { type: "function", name: "off" } ] } ],
                false: [ { id: "native.lamp", paramter: [ { type: "function", name: "on" } ] } ]
            }
        }
    ]
})
jcall.steps.set("lampTest", {
    icon: "light",
    displayText: "Blinks the lamp",
    actions: [
        {
            id: "native.lamp",
            paramter: [
                { name: "on", type: "function" }
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
                { name: "off", type: "function" }
            ]
        },
    ]
})
console.log(lampState);
for await (const _ of jcall.streamRun("step.lampToggle")) {
    // console.log(_)
}
console.log(lampState);
for await (const _ of jcall.streamRun("step.lampToggle")) {
    // console.log(_)
}
console.log(lampState);