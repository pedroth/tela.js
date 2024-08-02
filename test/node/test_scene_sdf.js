import { Image, IO, measureTimeWithResult, Mesh, Vec3, Camera, NaiveScene, BScene, KScene } from "../../dist/node/index.js";
import { readFileSync } from "fs"

const { saveImageToFile } = IO;

// constants
const width = 640;
const height = 480;
// re-usable scene
const canvas = Image.ofSize(width, height);
const camera = new Camera().orbit(5, 0, 0);
const obj = readFileSync("./assets/spot.obj", { encoding: "utf-8" });
let mesh = Mesh.readObj(obj, "mesh");
mesh = mesh
    .mapVertices(v => Vec3(-v.y, v.x, v.z))
    .mapVertices(v => Vec3(v.z, v.y, -v.x))
const scenes = [new BScene(), new KScene(100), new KScene(50), new NaiveScene()];
scenes.forEach(async scene => {
    scene.addList(mesh.asPoints(0.05));
    const { result, time } = await measureTimeWithResult(() => camera.sdfShot(scene).to(canvas));
    console.log(`${scene.constructor.name}: ${time}s`);
    saveImageToFile(`${scene.constructor.name}.png`, result);
})
