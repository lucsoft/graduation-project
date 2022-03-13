import { serve, build } from "https://deno.land/x/esbuild@v0.14.25/mod.js";
import { emptyDirSync } from "https://deno.land/std@0.128.0/fs/empty_dir.ts";
import { copySync } from "https://deno.land/std@0.128.0/fs/copy.ts";
import { BuildOptions } from "https://deno.land/x/esbuild@v0.14.25/mod.js";
import { httpImports } from "https://deno.land/x/esbuild_plugin_http_imports@v1.2.3/index.ts";

export const config: BuildOptions = {
    metafile: true,
    loader: {
        ".woff": "file",
        ".woff2": "file",
        ".html": "file",
        ".svg": "file",
        ".png": "file",
    },
    plugins: [
        {
            name: "statpoints",
            setup(build) {
                build.onStart(() => {
                    emptyDirSync("dist");
                    copySync("gui/templates/index.html", "dist/index.html");
                })
            }
        }, httpImports() ],
    bundle: true,
    entryPoints: {
        "index": "./gui/mod.ts"
    },
    outdir: "dist/",
    minify: true,
    splitting: true,
    format: "esm",
    logLevel: "info",
};

if (Deno.args[ 0 ] == "dev" || Deno.args.length === 0) {
    console.log("🚀 WebServer @ http://localhost:1337");
    await serve({
        port: 1337,
        servedir: "dist",
        onRequest: ({ method, remoteAddress, path }) =>
            console.log("📦", method, `http://localhost${path} from ${remoteAddress}`),
    }, { ...config, minify: false, splitting: false });
} else {
    (await build(config));
    Deno.exit();
}
