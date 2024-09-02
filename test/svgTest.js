import { Color, Vec2, Window, parseSVG } from "../src/index.node.js";
import { readFileSync } from "fs";

const width = 640;
const height = 480;
const [path] = process.argv.slice(2);
const svg = parseSVG(readFileSync(path ?? "./assets/cross.svg", { encoding: "utf-8" }));

function drawSVGData(svg) {
    const tela = new Window(width, height).onResizeWindow(() => tela.paint());
    const coordTransform = (x) => {
        const { min, max } = svg.viewBox;
        const diagonal = max.sub(min);
        let p = x.sub(min).div(diagonal);
        p = Vec2(p.x, -p.y).add(Vec2(0, 1))
        p = p.mul(Vec2(width, height)).map(Math.floor);
        return p;
    }
    const paths = Object.values(svg.paths).flatMap(x => x);
    const keyPointPaths = Object.values(svg.keyPointPaths).flatMap(x => x);
    for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        const keyPointPath = keyPointPaths[i];
        let transformedPath = path.map(coordTransform);
        for (let j = 0; j < path.length - 1; j++) {
            tela.drawLine(transformedPath[j], transformedPath[j + 1], () => Color.RED);
        }
        transformedPath = keyPointPath.map(coordTransform);
        for (let j = 0; j < keyPointPath.length - 1; j++) {
            tela.drawLine(transformedPath[j], transformedPath[j + 1], () => Color.BLUE);
        }
    }
    tela.paint();
    return;
}

drawSVGData(svg);