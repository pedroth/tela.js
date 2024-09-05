import { Color, Vec2, Window, parseSVG, Image, IO, Box, Ray, loop } from "../src/index.node.js";
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

const keyPointPaths = svg.keyPointPaths
    .flatMap(x => x)
    .map(p => p.map(coordTransform));

const boxes = paths.map(path => {
    let box = new Box();
    for (let j = 0; j < path.length; j++) {
        box = box.add(new Box(path[j], path[j]));
    }
    return box;
});


// const isInsideCurve = path => x => {
//     const epsilon = 1e-6;
//     let theta = 0;
//     for (let j = 0; j < path.length - 1; j++) {
//         const u = x.sub(path[j]);
//         const v = x.sub(path[j + 1]);
//         const thetaI = Math.atan2(u.y, u.x);
//         const thetaJ = Math.atan2(v.y, v.x);
//         let dTheta = thetaJ - thetaI;
//         dTheta = Math.atan2(Math.sin(dTheta), Math.cos(dTheta));
//         theta += dTheta;
//     }
//     const finalTheta = theta / (2 * Math.PI);
//     return finalTheta < -1 + epsilon;
// }
const isInsideCurve = x => {
    const epsilon = 1e-3;
    const pointsX = [];
    const pointsXMinus = [];
    const pointsY = [];

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
            
            let mu = r.y / v.y;
            let t = v.x * mu - r.x;
            if (mu >= 0 && mu <= 1 && t > 0) {
                const point = x.add(Vec2(t, 0));
                if (!pointsX.some(p => p.sub(point).length() <= epsilon)) {
                    pointsX.push(point);
                }
            }

            t = -t;
            if (mu >= 0 && mu <= 1 && t > 0) {
                const point = x.add(Vec2(t, 0));
                if (!pointsXMinus.some(p => p.sub(point).length() <= epsilon)) {
                    pointsXMinus.push(point);
                }
            }

            mu = r.x / v.x;
            t = v.y * mu - r.y;
            if (mu >= 0 && mu <= 1 && t > 0) {
                const point = x.add(Vec2(t, 0));
                if (!pointsY.some(p => p.sub(point).length() <= epsilon)) {
                    pointsY.push(point);
                }
            }
        }
    }
    const A = pointsX.length % 2 === 1;
    const B = pointsXMinus.length % 2 === 1;
    const C = pointsY.length % 2 === 1
    return  (A && B) || (A && C) || (B && C);
}

function drawSVGData() {
    const tela = new Window(width, height).onResizeWindow(() => tela.paint());
    const image = new Image(width, height);
    for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        const keyPointPath = keyPointPaths[i];
        const box = boxes[i];
        image.mapBox((x, y) => {
            const p = Vec2(x + box.min.x, y + box.min.y);
            if (isInsideCurve(p)) return Color.WHITE;
            else Color.BLACK;
        }, box);
        tela.mapBox((x, y) => {
            const p = Vec2(x + box.min.x, y + box.min.y);
            if (isInsideCurve(p)) return Color.WHITE;
            else Color.BLACK;
        }, box);
        for (let j = 0; j < keyPointPath.length - 1; j++) {
            tela.drawLine(keyPointPath[j], keyPointPath[j + 1], () => Color.BLUE);
            image.drawLine(keyPointPath[j], keyPointPath[j + 1], () => Color.BLUE);
        }
        for (let j = 0; j < path.length - 1; j++) {
            tela.drawLine(path[j], path[j + 1], () => Color.RED);
            image.drawLine(path[j], path[j + 1], () => Color.RED);
        }
    }
    tela.paint();
    image.paint();
    IO.saveImageToFile("svgTest.png", image);
    return;
}

drawSVGData();
