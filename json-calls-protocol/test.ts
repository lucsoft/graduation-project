import { register } from "../test-data.ts";
import { JsonCalls } from "./mod.ts";

const jcall = new JsonCalls()
register(jcall);

console.log("Size", jcall.getSize("user.lampToggle"))
// jcall.trace("user.lampToggle")
for await (const _ of jcall.streamRun("user.lampToggle")) {
    console.log(_)
}
for await (const _ of jcall.streamRun("user.lampToggle")) {
    console.log(_)
}