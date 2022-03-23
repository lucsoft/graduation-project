import { assert, assertEquals } from "https://deno.land/std@0.130.0/testing/asserts.ts";
import { JsonCalls } from "../json-calls-protocol/mod.ts";
import { streamToArray } from "../helper.ts";
import { register } from "../test-data.ts";

Deno.test("GP: No Step Action", async () => {
    const jcall = new JsonCalls();
    register(jcall);
    const list = await streamToArray(jcall.runAsStream("user.empty"));
    assert(list.length == 0)
})

Deno.test("GP: Single Step Action", async () => {
    const jcall = new JsonCalls();
    register(jcall);
    const list = await streamToArray(jcall.runAsStream("user.sleep"));
    assertEquals(list, [
        { _trace: "0", _callsLeft: 0, _responses: {} }
    ])
})

Deno.test("GP: Single Step Action: Point to User Action", async () => {
    const jcall = new JsonCalls();
    register(jcall);
    jcall.actions.set("user.sleep", {
        icon: "check_box_outline_blank",
        color: "pink",
        category: undefined,
        steps: [
            {
                id: "user.empty"
            },
            {
                id: "buildIn.sleep",
                parameter: [
                    { name: "amount", type: "number", value: 0.5 }
                ]
            }
        ]
    })
    const list = await streamToArray(jcall.runAsStream("user.sleep"));
    assertEquals(list, [
        { _trace: "0", _callsLeft: 1, _responses: {} },
        { _trace: "1", _callsLeft: 0, _responses: {} }
    ])
})
