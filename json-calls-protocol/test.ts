import { register } from "../test-data.ts";
import { JsonCalls } from "./mod.ts";

const jcall = new JsonCalls()
register(jcall);
console.log("Size", jcall.getSize("step.lampToggle"))
for await (const _ of jcall.streamRun("step.lampToggle")) {
    // console.log(_)
}
for await (const _ of jcall.streamRun("step.lampToggle")) {
    // console.log(_)
}