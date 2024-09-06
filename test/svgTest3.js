import { Color, Vec2, Window, parseSVG, loop, Box, IO, Image, measureTime } from "../src/index.node.js";
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

function numericalWinding(x) {
    let count = 0;
    for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        let theta = 0;
        for (let j = 0; j < path.length - 1; j++) {
            const samples = 10;
            let vecInt = Vec2();
            const h = 1 / samples;
            const vJ = path[j + 1].sub(path[j]);
            const RvJ = Vec2(vJ.y, -vJ.x);
            for(let k = 0; k < samples; k++) {
                const t = k / samples;
                const rT = x.sub(path[j].scale(1 - t).add(path[j+1].scale(t)));
                const squareLength = rT.dot(rT);
                if(squareLength === 0) continue;
                vecInt = vecInt.add(rT.scale(h / squareLength));
            }
            const dTheta = RvJ.dot(vecInt);
            theta += dTheta;
        }
        const winding = theta / (2 * Math.PI);
        count += winding;
    }
    return count;
}

function discreteWinding(x) {
    let count = 0;
    for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        let theta = 0;
        for (let j = 0; j < path.length - 1; j++) {
            const u = x.sub(path[j]);
            const v = x.sub(path[j + 1]);
            const thetaI = Math.atan2(u.y, u.x);
            const thetaJ = Math.atan2(v.y, v.x);
            let dTheta = thetaJ - thetaI;
            // dTheta = Math.atan2(Math.sin(dTheta), Math.cos(dTheta)); // slow
            dTheta = dTheta - 2 * Math.PI * Math.round(dTheta / (2 * Math.PI));
            theta += dTheta;
        }
        const winding = -theta / (2 * Math.PI);
        count += winding;
    }
    return count;
}

const image = new Image(width, height);
console.log(`Image took ${await measureTime(() => {
    const windingMethod = [numericalWinding, discreteWinding][0]; 
    image.map((x, y) => {
        const p = Vec2(x, y);
        const winding = windingMethod(p); // [-1,1] value
        const t = (winding + 1) / 2 // [0,1] value
        return Color.BLUE.scale(1 - t).add(Color.YELLOW.scale(t));
    });
})}`);
IO.saveImageToFile("winding_number.jpg", image)