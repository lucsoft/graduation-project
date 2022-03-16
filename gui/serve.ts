import { serve } from "https://deno.land/x/esbuild_serve@0.0.3/mod.ts";

serve({
    templateRoot: "gui/templates",
    pages: {
        "index": "./gui/mod.ts"
    }
})