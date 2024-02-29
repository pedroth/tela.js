import { Image, Stream, IO, Utils, Mesh, Vec3, Camera, NaiveScene, BScene, KScene, VoxelScene } from "../../dist/node/index.js";
import { readFileSync } from "fs"

const { measureTime, measureTimeWithResult } = Utils;
const { saveImageToFile } = IO;

// constants
const width = 640;
const height = 480;
// re-usable scene
const canvas = Image.ofSize(width, height);
const camera = new Camera({ sphericalCoords: Vec3(5, 0, 0) });
const obj = readFileSync("./assets/spot.obj", { encoding: "utf-8" });
let mesh = Mesh.readObj(obj, "mesh");
mesh = mesh
    .mapVertices(v => Vec3(-v.y, v.x, v.z))
    .mapVertices(v => Vec3(v.z, v.y, -v.x))
const scenes = [new BScene(), new KScene(100), new VoxelScene(0.2), new NaiveScene()];
scenes.forEach(scene => {
    scene.addList(mesh.asPoints(0.05));
    const { result, time } = measureTimeWithResult(() => camera.sceneShot(scene).to(canvas));
    console.log(`${scene.constructor.name}: ${time}s`);
    saveImageToFile(`${scene.constructor.name}.png`, result);
})
