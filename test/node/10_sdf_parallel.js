import {
    measureTime,
    Mesh,
    Vec3,
    Camera,
    KScene,
    videoAsync,
    Color,
    Vec2,
    Ray
} from "../../src/index.node.js";
import { readFileSync } from "fs";


// constants
const width = 640;
const height = 640;
const FPS = 30;
const dt = 1 / FPS;
const maxT = 4;

const scene = new KScene();
const camera = new Camera();
const obj = readFileSync("./assets/bunny_orig.obj", { encoding: "utf-8" });
let mesh = Mesh.readObj(obj, "mesh");
const box = mesh.getBoundingBox();
const scaleInv = 2 / box.diagonal.fold((e, x) => Math.max(e, x), Number.MIN_VALUE);
mesh = mesh
    .mapVertices((v) => v.sub(box.center).scale(scaleInv))
    .mapVertices((v) => Vec3(-v.y, v.x, v.z))
    .mapVertices((v) => Vec3(v.z, v.y, -v.x))
scene.addList(mesh.asSpheres(0.05));
scene.rebuild();

function torusSdf(r, R) {
    return p => {
        const q = Vec2(p.x, p.y).length() - r;
        return Vec2(q, p.z).length() - R;
    }
}

function smin(a, b, k = 32) {
    const res = Math.exp(-k * a) + Math.exp(-k * b);
    return -Math.log(res) / k;
}

function normalFunction(F, p) {
    const epsilon = 1e-3;
    const f = F(p);
    const n = Vec3(
        F(p.add(Vec3(epsilon, 0, 0))) - f,
        F(p.add(Vec3(0, epsilon, 0))) - f,
        F(p.add(Vec3(0, 0, epsilon))) - f,
    );
    return n.normalize();
}

const rayScene = (ray, { scene, time }) => {
    const maxIte = 100;
    const maxDist = 10;
    const epsilon = 1e-3;
    const { init } = ray;
    let p = init;
    let t = 0;
    const torusDist = torusSdf(0.75, 0.25);
    for (let i = 0; i < maxIte; i++) {
        p = ray.trace(t);
        const tau = ((Math.sin(2 * Math.PI * 0.25 * (time - 1)) + 1) / 2);
        const torusD = torusDist(p);
        const sceneDist = scene.distanceOnRay(Ray(p, ray.dir), smin);
        const d = tau * torusD + (1 - tau) * sceneDist;
        t += d;
        if (d < epsilon) {
            const normal = normalFunction(torusDist, p).scale(tau).add(scene.normalToPoint(p).scale(1 - tau)).normalize();
            return Color.ofRGB(...normal.map(x => (x + 1) / 2).toArray());
        }
        if (d > maxDist) return Color.ofRGB(0, 0, 0);
    }
    return Color.BLACK;
};


async function animation({ time, image }) {
    const theta = 2 * Math.PI * 0.25 * (time - 1);
    camera.orbit((coords) => Vec3(coords.x, theta, Math.PI/4));
    return (await camera.rayMapParallel(rayScene, [torusSdf, normalFunction, smin]).to(image, { scene, time })).paint();
}

console.log(
    "Video created in: ",
    await measureTime(async () => {
        await videoAsync(
            "./sdf_parallel.mp4",
            animation,
            { width, height, fps: FPS }
        ).while(({ time }) => time < maxT);
    })
);
