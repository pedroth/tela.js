import { Color, Vec2, Window, parseSVG, loop, Box } from "../../src/index.node.js";
import { readFileSync } from "fs";

const width = 640;
const height = 480;
const [path] = process.argv.slice(2);
const svg = parseSVG(readFileSync(path ?? "./assets/cross.svg", { encoding: "utf-8" })).normalize();

const coordTransform = (x) => {
    return x.mul(Vec2(width, height)).map(Math.floor);
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
    const pointsX = [];
    const pointsY = [];
    for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        for (let j = 0; j < path.length - 1; j++) {
            const a = path[j];
            const b = path[j + 1];
            const v = b.sub(a);
            const r = x.sub(a);

            if (v.y !== 0) {
                const mu = r.y / v.y;
                let t = v.x * mu - r.x;
                if (mu >= 0 && mu <= 1) {
                    if (t > 0) {
                        const point = x.add(Vec2(t, 0));
                        if (!pointsX.some(p => p.sub(point).length() <= epsilon)) {
                            pointsX.push(point);
                        }
                    }
                    if (t < 0) {
                        const point = x.add(Vec2(t, 0));
                        if (!pointsX.some(p => p.sub(point).length() <= epsilon)) {
                            pointsX.push(point);
                        }
                    }
                }
            }
            if (v.x !== 0) {
                const mu = r.x / v.x;
                let t = v.y * mu - r.y;
                if (mu >= 0 && mu <= 1) {
                    if (t > 0) {
                        const point = x.add(Vec2(0, t));
                        if (!pointsY.some(p => p.sub(point).length() <= epsilon)) {
                            pointsY.push(point);
                        }
                    }
                    if (t < 0) {
                        const point = x.add(Vec2(0, t));
                        if (!pointsY.some(p => p.sub(point).length() <= epsilon)) {
                            pointsY.push(point);
                        }
                    }
                }
            }
        }
    }
    return pointsX.concat(pointsY);
}

const isInsideCurve = x => {
    let count = 0;
    const indices = boxes
        .map((b, i) => ({ box: b, index: i }))
        .filter((obj) => obj.box.collidesWith(x))
        .map((obj) => obj.index);
    for (let i = 0; i < indices.length; i++) {
        const path = paths[indices[i]];
        let theta = 0;
        for (let j = 0; j < path.length - 1; j++) {
            const u = x.sub(path[j]);
            const v = x.sub(path[j + 1]);
            const thetaI = Math.atan2(u.y, u.x);
            const thetaJ = Math.atan2(v.y, v.x);
            let dTheta = thetaJ - thetaI;
            dTheta = Math.atan2(Math.sin(dTheta), Math.cos(dTheta));
            theta += dTheta;
        }
        const winding = theta / (2 * Math.PI);
        count += Math.round(winding);
    }
    return count < 0;
}

const window = new Window(width, height).onResizeWindow(() => window.paint());
let p = Vec2();
window.onMouseMove((x, y) => {
    p = Vec2(x, y);
})
loop(() => {
    window.fill(Color.BLACK);
    // draw paths
    for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        for (let j = 0; j < path.length - 1; j++) {
            window.drawLine(path[j], path[j + 1], () => Color.RED);
        }
    }
    // draw cursor ui
    const isInside = isInsideCurve(p);
    const size = 5;
    for (let i = -size; i < size; i++) {
        for (let j = -size; j < size; j++) {
            window.setPxl(p.x + i, p.y + j, isInside ? Color.YELLOW : Color.BLUE);
        }
    }

    // draw intersecting lines
    window.drawLine(p, p.add(Vec2(width, 0)), () => Color.PURPLE);
    window.drawLine(p, p.add(Vec2(-width, 0)), () => Color.PURPLE);
    window.drawLine(p, p.add(Vec2(0, height)), () => Color.PURPLE);
    window.drawLine(p, p.add(Vec2(0, -height)), () => Color.PURPLE);
    const intersectingPoints = getIntersectionPoints(p);
    intersectingPoints.forEach(x => {
        const size = 2;
        for (let i = -size; i < size; i++) {
            for (let j = -size; j < size; j++) {
                window.setPxl(x.x + i, x.y + j, Color.GREEN);
            }
        }
    })

    window.paint();
}).play()