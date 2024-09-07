import { Color, Vec2, parseSVG, IO, Stream, Image, Box } from "../../src/index.node.js";
import { readFileSync } from "fs";

const width = 640;
const height = 480;
const FPS = 30;
const dt = 1 / FPS;
const maxT = 3;
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
const image = new Image(width, height);
const paths = svg.paths.flatMap(x => x).map(path => path.map(coordTransform));
const boxes = paths.map(path => {
    let box = new Box();
    for (let j = 0; j < path.length; j++) {
        box = box.add(new Box(path[j], path[j]));
    }
    return box;
});
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
            dTheta = dTheta - 2 * Math.PI * Math.round(dTheta / (2 * Math.PI));
            theta += dTheta;
        }
        const winding = theta / (2 * Math.PI);
        count += Math.round(winding);
    }
    return count < 0;
}
const drawFrame = (time) => {
    for (let i = 0; i < paths.length; i++) {
        const n = (time / maxT);
        const path = paths[i];

        const box = boxes[i];
        image.mapBox((x, y) => {
            const p = Vec2(x + box.min.x, y + box.min.y);
            const t = Math.max(0, 2 * n - 0.75);
            if (isInsideCurve(p)) return Color.BLACK.scale(1 - t).add(Color.WHITE.scale(t));
        }, box);

        for (let j = 0; j < Math.min(path.length - 1, Math.floor(2 * n * (path.length - 1))); j++) {
            image.drawLine(path[j], path[j + 1], () => Color.WHITE);
        }
    }
    return image.paint();
}

const videoStream = new Stream(
    { time: 0, image: drawFrame(0) },
    ({ time }) => {
        return {
            time: time + dt,
            image: drawFrame(time)
        }
    }
)
IO.saveImageStreamToVideo("svg_anime.mp4", videoStream, { fps: FPS }).while(({ time }) => time < maxT + 1e-1);