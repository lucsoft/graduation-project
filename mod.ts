import { Webview } from "https://raw.githubusercontent.com/webview/webview_deno/main/mod.ts";

new Worker(new URL("./worker.ts", import.meta.url).href, { deno: true, type: "module" })
const view = new Webview(900, 600);
view.title = "Proof of Concept";
view.navigate(`http://0.0.0.0:41337`);
view.run();