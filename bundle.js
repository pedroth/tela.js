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
console.log(build);

// eslint-disable-next-line no-undef
const buildNode = await Bun.build({
    entrypoints: [
        "./src/index.js",
    ],
    outdir: "./dist/node/",
    target: "node",
    // minify: true,
    // sourcemap: "external",
    // splitting: true // not working
})
console.log(buildNode);

