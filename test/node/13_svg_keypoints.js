import {
  Color,
  Vec2,
  Window,
  parseSVG,
  Image,
  IO,
  Box,
  Ray,
  loop,
  measureTime,
} from "../../src/index.node.js";
import { readFileSync } from "fs";

const width = 640;
const height = 480;
const [path] = process.argv.slice(2);
const svg = parseSVG(
  readFileSync(path ?? "./assets/cross.svg", { encoding: "utf-8" })
);

const coordTransform = (x) => {
  const { min, max } = svg.viewBox;
  const diagonal = max.sub(min);
  let p = x.sub(min).div(diagonal);
  p = Vec2(p.x, -p.y).add(Vec2(0, 1));
  p = p.mul(Vec2(width, height)).map(Math.floor);
  return p;
};

const paths = svg.paths.flatMap((x) => x).map((p) => p.map(coordTransform));

const keyPointPaths = svg.keyPointPaths
  .flatMap((x) => x)
  .map((p) => p.map(coordTransform));

const boxes = paths.map((path) => {
  let box = new Box();
  for (let j = 0; j < path.length; j++) {
    box = box.add(new Box(path[j], path[j]));
  }
  return box;
});

const isInsideCurve0 = (x) => {
  let count = 0;
  const indices = boxes
    .map((b, i) => ({ box: b, index: i }))
    .filter((obj) => obj.box.collidesWith(x))
    .map((obj) => obj.index);
  // compute winding number
  for (let i = 0; i < indices.length; i++) {
    const path = paths[indices[i]];
    let theta = 0;
    for (let j = 0; j < path.length - 1; j++) {
      const samples = 5;
      let vecInt = Vec2();
      const h = 1 / samples;
      const vJ = path[j + 1].sub(path[j]);
      const tangent = path[j + 1].sub(path[j]);
      const RvJ = Vec2(vJ.y, -vJ.x);
      for (let k = 0; k < samples; k++) {
        const t = k / samples;
        const rT = x.sub(path[j].add(tangent.scale(t)));
        const squareLength = rT.dot(rT);
        if (squareLength === 0) continue;
        vecInt = vecInt.add(rT.scale(h / squareLength));
      }
      const dTheta = RvJ.dot(vecInt);
      theta += dTheta;
    }
    const winding = theta / (2 * Math.PI);
    count += winding;
  }
  return Math.round(count) > 0;
};

const isInsideCurve1 = (x) => {
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
};

const isInsideCurve2 = (x) => {
  // compute intersections in e1 and e2 directions
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
      const r = x.sub(a);

      if (v.y !== 0) {
        const mu = r.y / v.y;
        let t = v.x * mu - r.x;
        if (mu >= 0 && mu <= 1) {
          if (t > 0) {
            const point = x.add(Vec2(t, 0));
            if (!pointsX.some((p) => p.sub(point).length() <= epsilon)) {
              pointsX.push(point);
            }
          }
          if (t < 0) {
            const point = x.add(Vec2(t, 0));
            if (!pointsXMinus.some((p) => p.sub(point).length() <= epsilon)) {
              pointsXMinus.push(point);
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
            if (!pointsY.some((p) => p.sub(point).length() <= epsilon)) {
              pointsY.push(point);
            }
          }
          // if (t < 0) {
          //     const point = x.add(Vec2(0, t));
          //     if (!pointsY.some(p => p.sub(point).length() <= epsilon)) {
          //         pointsY.push(point);
          //     }
          // }
        }
      }
    }
  }
  const A = pointsX.length % 2 === 1;
  const B = pointsXMinus.length % 2 === 1;
  const C = pointsY.length % 2 === 1;
  return (A && B) || (A && C) || (B && C);
};

const isInsideCurve3 = (x) => {
  // compute intersections in e1 and e2 directions
  const epsilon = 1e-3;
  const pointsX = [];
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
      const r = x.sub(a);

      if (v.y !== 0) {
        const mu = r.y / v.y;
        let t = v.x * mu - r.x;
        if (mu >= 0 && mu <= 1 && t > 0) {
          const point = x.add(Vec2(t, 0));
          if (!pointsX.some((p) => p.sub(point).length() <= epsilon)) {
            pointsX.push(point);
          }
        }
      }
    }
  }
  return pointsX.length % 2 === 1;
};

function drawSVGData() {
  const tela = new Window(width, height).onResizeWindow(() => tela.paint());
  const image = new Image(width, height);
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    const keyPointPath = keyPointPaths[i];
    const box = boxes[i];
    const isInsideMethod = [
      isInsideCurve0,
      isInsideCurve1,
      isInsideCurve2,
      isInsideCurve3,
    ][2];
    image.mapBox((x, y) => {
      const p = Vec2(x + box.min.x, y + box.min.y);
      if (isInsideMethod(p)) return Color.WHITE;
      else Color.BLACK;
    }, box);
    tela.mapBox((x, y) => {
      const p = Vec2(x + box.min.x, y + box.min.y);
      if (isInsideMethod(p)) return Color.WHITE;
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

console.log(`Took ${await measureTime(() => drawSVGData())}s`);
