import { Color, Vec2, Window, parseSVG, loop, Box } from "../src/index.node.js";
import { readFileSync } from "fs";

const width = 640;
const height = 480;
const [path] = process.argv.slice(2);
const svg = parseSVG(readFileSync(path ?? "./assets/cross.svg", { encoding: "utf-8" }));
const coordTransform = (x) => {
    const { min, max } = svg.viewBox;
    const diagonal = max.sub(min);
    let p = x.sub(min).div(diagonal);
    p = Vec2(p.x, -p.y).add(Vec2(0, 1))
    p = p.mul(Vec2(width, height)).map(Math.floor);
    return p;
}
const paths = svg.paths
    .flatMap(x => x)
    .map(p => p.map(coordTransform));
const boxes = paths.map(path => {
    let box = new Box();
    for (let j = 0; j < path.length; j++) {
        box = box.add(new Box(path[j], path[j]));
    }
    return box;
});
function getIntersectionPoints(x) {
    const epsilon = 1e-3;
    const points = [];

    const indices = boxes
        .map((b, i) => ({ box: b, index: i }))
        .filter((obj) => obj.box.collidesWith(x))
        .map((obj) => obj.index);
    for (let i = 0; i < indices.length; i++) {
        const path = paths[indices[i]];
        for (let j = 0; j < path.length - 1; j++) {
            const a = path[j];
            const b = path[j + 1];
            const v = b.sub(a);
            if (v.y === 0) {
                continue;
            }
            const r = x.sub(a);
            const mu = r.y / v.y;
            const t = v.x * mu - r.x;

            if (mu >= 0 && mu <= 1 && t > 0) {
                const point = x.add(Vec2(t, 0));
                // if (!points.some(p => p.sub(point).length() <= epsilon)) {
                    points.push(point);
                // }
            }
        }
    }
    return points;
}
const window = new Window(width, height).onResizeWindow(() => window.paint());
let p = Vec2();
window.onMouseMove((x, y) => {
    p = Vec2(x, y);
})
loop(() => {
    window.fill(Color.BLACK);
    for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        for (let j = 0; j < path.length - 1; j++) {
            window.drawLine(path[j], path[j + 1], () => Color.RED);
        }
    }
    window.drawLine(p, p.add(Vec2(width, 0)), () => Color.BLUE);
    const intersectingPoints = getIntersectionPoints(p);
    intersectingPoints.forEach(x => {
        const size = 2;
        for (let i = -size; i < size; i++) {
            for (let j = -size; j < size; j++) {
                window.setPxl(x.x + i, x.y + j, Color.GREEN);
            }
        }
    })
    const size = 5;
    for (let i = -size; i < size; i++) {
        for (let j = -size; j < size; j++) {
            window.setPxl(p.x + i, p.y + j, intersectingPoints.length % 2 === 1 ? Color.YELLOW : Color.PURPLE);
        }
    }
    console.log(`points : ${intersectingPoints.length}`);
    window.paint();
}).play()