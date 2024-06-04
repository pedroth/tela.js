import watch from "node-watch";
import { execSync } from "child_process";

if ("--watch" === Bun.argv.at(-1)) {
    watch('./src/', { recursive: true }, (evt, name) => {
        console.log("%s changed", name);
        console.log("%s", execSync("bun run build"));
    });
}

// eslint-disable-next-line no-undef
const build = await Bun.build({
    entrypoints: [
        "./src/index.js"
    ],
    outdir: "./dist/web/",
    // target: "web",
    // minify: true,
    // sourcemap: "external",
    // splitting: true // not working
})
console.log("WEB:", build);

console.log(">>>>>>>>>>>");

// eslint-disable-next-line no-undef
const buildNode = await Bun.build({
    entrypoints: [
        "./src/index.node.js",
    ],
    outdir: "./dist/node/",
    target: "node",
    naming: "index.js"
    // minify: true,
    // sourcemap: "external",
    // splitting: true // not working
})
console.log("NODE:", buildNode);

