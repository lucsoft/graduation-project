import { JsonCallsProtocol } from "./spec.ts";

export const exampleOne: JsonCallsProtocol = {
    type: "json-calls",
    version: 0,
    steps: {
        "native.lamp": {
            parameters: [
                {
                    name: "on",
                    type: "function"
                },
                {
                    name: "off",
                    type: "function"
                },
                {
                    name: "state",
                    type: "boolean",
                    value: false
                },
            ],
            actions: "native",
            icon: "native",
            color: "gray"
        },
        "step.lampTest": {
            icon: "light",
            color: "blue",
            displayText: "Blinks the lamp",
            actions: [
                {
                    id: "native.lamp",
                    paramter: [
                        { name: "on", type: "function" }
                    ]
                },// Response(Success, 0, null)
                {
                    id: "buildIn.sleep",
                    paramter: [
                        { name: "amount", type: "number", value: 1000 }
                    ]
                }, // Response(Success, 1, null)
                {
                    id: "native.lamp",
                    paramter: [
                        { name: "off", type: "function" }
                    ]
                } // Response(Success, 2, null)
            ]
        },
        "step.lampToggleWithVariables": {
            icon: "light",
            color: "blue",
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
        },
        "step.lampToggleWithResponse": {
            icon: "light",
            color: "blue",
            displayText: "Toggles the lamp",
            actions: [
                {
                    id: "native.lamp",
                    paramter: [ { type: "boolean", name: "state" } ]
                },
                {
                    id: "buildIn.if",
                    paramter: [ { type: "boolean", name: "state", value: { type: "response", id: 1 } } ],
                    condition: { id: "buildIn.truthy" },
                    branch: {
                        true: [ { id: "native.lamp", paramter: [ { type: "function", name: "off" } ] } ],
                        false: [ { id: "native.lamp", paramter: [ { type: "function", name: "on" } ] } ]
                    }
                },

                // But keep in mind Responses can only be transformed or recreated
                {
                    id: "buildIn.sleep",
                    paramter: [ { type: "number", name: "amount", value: 1000 } ]
                },
                {
                    id: "buildIn.if",
                    paramter: [ { type: "boolean", name: "state", value: { type: "response", id: 5 } } ],
                    condition: { id: "buildIn.truthy" },
                    branch: {
                        true: [ { id: "native.lamp", paramter: [ { type: "function", name: "off" } ] } ],
                        false: [ { id: "native.lamp", paramter: [ { type: "function", name: "on" } ] } ]
                    }
                }
            ]
        }
    }
}