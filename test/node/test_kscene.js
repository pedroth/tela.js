import { Camera, Image, Mesh, measureTimeWithResult, Vec3, KScene } from "../../src/index.node.js";
import { readFileSync } from "fs"

const width = 640;
const height = 480;
// scene
const camera = new Camera().orbit(5, 0, 0);
// scene
const obj = readFileSync("./assets/statue.obj", { encoding: "utf-8" });
let mesh = Mesh.readObj(obj, "mesh");
mesh = mesh
    .mapVertices(v => Vec3(-v.y, v.x, v.z))
    .mapVertices(v => Vec3(v.z, v.y, -v.x))

const maxIte = 20;
const spacing = 10;
const size = 0.5;
let minTime = Number.MAX_VALUE;
let minIndex = -1;
for (let i = 0; i < maxIte; i++) {
    const scene = new KScene((i + 1) * spacing);
    scene.addList(mesh.asSpheres(size));
    const { time } = await measureTimeWithResult(() => camera.normalShot(scene).to(Image.ofSize(width, height)));
    if (time < minTime) {
        minTime = time;
        minIndex = i;
        console.log(`${i} >>> ${minTime}`);
    }
}
console.log(`Size of points: ${size}, Number of vertices: ${mesh.vertices.length}>>> K: ${minIndex * spacing}>>>`);