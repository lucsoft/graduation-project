import { JsonCalls } from "../json-calls-protocol/mod.ts";
import { assertEquals, assert } from "https://deno.land/std@0.130.0/testing/asserts.ts";

Deno.test("GP: Query by ActionId Works", () => {
    const jcall = new JsonCalls()
    jcall.actions.set("native.user", {
        category: "test",
        color: "blue",
        icon: "close",
        steps: "native"
    })

    const meta = jcall.metaFromId("native.user");
    assert(meta)
    assertEquals(meta.color, "blue")
    assertEquals(meta.icon, "close")
    assertEquals(meta.category, "test")
    assertEquals(meta.steps, "native")
})