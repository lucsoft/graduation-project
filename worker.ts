

import { serve } from "https://deno.land/std@0.130.0/http/mod.ts";

serve(() =>
    new Response(performance.now() + "<h1>Hello World</h1><button onclick=\"location.href = location.href\">Reload</button>", {
        headers: new Headers({
            "content-type": "text/html",
        }),
    }), { port: 41337 });