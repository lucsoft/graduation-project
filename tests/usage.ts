import { JsonCalls } from "../json-calls-protocol/mod.ts";
import { register } from "../test-data.ts";

const jcall = new JsonCalls()
register(jcall);

console.log(JSON.stringify(jcall.traceform(jcall.metaFromId("user.lampToggle")!)))
console.log("Size", jcall.getSizeInAction("user.lampToggle"))

for await (const _ of jcall.streamRun("user.lampToggle")) {
    console.log(_)
}
for await (const _ of jcall.streamRun("user.lampToggle")) {
    console.log(_)
}