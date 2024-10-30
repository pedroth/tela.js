import { Color, Vec2, parseSVG, IO, Stream, Image, Box, Vec, measureTime } from "../../src/index.node.js";
import { readFileSync } from "fs";

const width = 640;
const height = 480;
const FPS = 30;
const dt = 1 / FPS;
const maxT = 10;
const [path] = process.argv.slice(2);
const svg = parseSVG(readFileSync(path ?? "./assets/cross.svg", { encoding: "utf-8" })).normalize();
const coordTransform = (x) => {
    return x.mul(Vec2(width, height)).map(Math.floor);
}
const image = new Image(width, height);
const paths = svg.paths.flatMap(x => x).map(path => path.map(coordTransform));
function windingNumber(x, n, somePaths) {
    let count = 0;
    for (let i = 0; i < somePaths.length; i++) {
        const path = somePaths[i];
        let theta = 0;
        const N = Math.floor(2 * n * (path.length - 1));
        for (let j = 0; j < Math.min(path.length - 1, N); j++) {
            const u = x.sub(path[j]);
            const v = x.sub(path[j + 1]);
            const thetaI = Math.atan2(u.y, u.x);
            const thetaJ = Math.atan2(v.y, v.x);
            let dTheta = thetaJ - thetaI;
            dTheta = dTheta - 2 * Math.PI * Math.round(dTheta / (2 * Math.PI));
            theta += -dTheta;
        }
        const winding = theta / (2 * Math.PI);
        count += winding;
    }
    return count;
}
const drawFrame = (time) => {
    const n = (time / maxT);
    // return image.map((x, y) => {
    //     const p = Vec2(x, y);
    //     const t = windingNumber(p, n, paths);
    //     return Color.BLUE.scale(1 - t).add(Color.YELLOW.scale(t));
    // })
    return image.mapParallel((x, y, { paths, n }) => {
        const deserializePaths = paths.map(p => p.map(x => Vec.fromArray(x)));
        const p = Vec2(x, y);
        const t = windingNumber(p, n, deserializePaths);
        return Color.BLUE.scale(1 - t).add(Color.YELLOW.scale(t));
    }, [windingNumber]).run({ n, paths: paths.map(p => p.map(x => x.toArray())) });
}

const videoStream = new Stream(
    { time: 0, image: await drawFrame(0) },
    async ({ time }) => {
        return {
            time: time + dt,
            image: await drawFrame(time)
        }
    }
)
console.log(`Took ${await measureTime(() =>
    IO.saveImageStreamToVideo("svg_anime_2.mp4", videoStream, { fps: FPS })
        .while(({ time }) => time < maxT + 1e-1))
    }s`
)