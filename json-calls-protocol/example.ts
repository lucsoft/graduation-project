import { JsonCallsProtocol } from "./spec.ts";

export const exampleOne: JsonCallsProtocol = {
    type: "json-calls",
    version: 0,
    categoryMapping: {
        "test": {
            de: "Test",
            en: "Test"
        }
    },
    actions: {
        "native.lamp": {
            parameters: [
                {
                    name: "value",
                    type: "boolean"
                }
            ],
            steps: "native",
            category: "test",
            icon: "native",
            color: "gray"
        },
        "user.lampTest": {
            icon: "light",
            color: "blue",
            category: undefined,
            displayText: "Blinks the lamp",
            steps: [
                {
                    id: "native.lamp",
                    parameter: [
                        { name: "value", type: "boolean", value: true }
                    ]
                },// Response(Success, 0, null)
                {
                    id: "buildIn.sleep",
                    parameter: [
                        { name: "amount", type: "number", value: 1000 }
                    ]
                }, // Response(Success, 1, null)
                {
                    id: "native.lamp",
                    parameter: [
                        { name: "value", type: "boolean", value: false }
                    ]
                } // Response(Success, 2, null)
            ]
        },
        "user.lampToggleWithVariables": {
            icon: "light",
            color: "blue",
            category: undefined,
            displayText: "Toggles the lamp",
            variables: {
                state: false
            },
            steps: [
                {
                    id: "native.lamp",
                    parameter: [
                        { name: "value", type: "boolean", value: false }
                    ]
                },
                {
                    id: "buildIn.variable",
                    parameter: [ { type: "boolean", name: "state", value: { type: "response", id: "0" } } ]
                },
                {
                    id: "buildIn.if",
                    parameter: [ { type: "boolean", name: "value", value: { type: "variable", id: "state" } } ],
                    condition: { id: "buildIn.truthy" },
                    branch: {
                        true: [ { id: "native.lamp", parameter: [ { type: "boolean", name: "value", value: false } ] } ],
                        false: [ { id: "native.lamp", parameter: [ { type: "boolean", name: "value", value: false } ] } ]
                    }
                }
            ]
        },
        "user.lampToggleWithResponse": {
            icon: "light",
            color: "blue",
            category: undefined,
            displayText: "Toggles the lamp",
            steps: [
                {
                    id: "native.lamp",
                    parameter: [ { type: "boolean", name: "state" } ]
                },
                {
                    id: "buildIn.if",
                    parameter: [ { type: "boolean", name: "state", value: { type: "response", id: "1" } } ],
                    condition: { id: "buildIn.truthy" },
                    branch: {
                        true: [ { id: "native.lamp", parameter: [ { type: "boolean", value: false, name: "value" } ] } ],
                        false: [ { id: "native.lamp", parameter: [ { type: "boolean", value: true, name: "value" } ] } ]
                    }
                },

                // But keep in mind Responses can only be transformed or recreated
                {
                    id: "buildIn.sleep",
                    parameter: [ { type: "number", name: "amount", value: 1000 } ]
                },
                {
                    id: "buildIn.if",
                    parameter: [ { type: "boolean", name: "state", value: { type: "response", id: "5" } } ],
                    condition: { id: "buildIn.truthy" },
                    branch: {
                        true: [ { id: "native.lamp", parameter: [ { type: "boolean", value: false, name: "value" } ] } ],
                        false: [ { id: "native.lamp", parameter: [ { type: "boolean", value: true, name: "value" } ] } ]
                    }
                }
            ]
        }
    }
}