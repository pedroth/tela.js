import { Color, Vec2, Window, parseSVG, loop, Box, triangulate, NaiveScene, Triangle, Camera2D } from "../../src/index.node.js";
import { readFileSync } from "fs";

const width = 640;
const height = 480;
const [path] = process.argv.slice(2);
const svg = parseSVG(readFileSync(path ?? "./assets/cross.svg", { encoding: "utf-8" })).normalize();

const camera = new Camera2D(new Box(Vec2(), Vec2(1, 1)));
const paths = svg.paths.flatMap(x => x);
const scene = new NaiveScene();
triangulate(paths)
    .map(t => {
        return scene.add(
            Triangle
                .builder()
                .positions(...t)
                .colors(Color.random(), Color.random(), Color.random())
                .build()
        )
    });
const window = new Window(width, height).onResizeWindow(() => window.paint());
loop(() => {
    window.fill(Color.BLACK);
    camera.raster(scene).to(window);
    window.paint();
}).play()