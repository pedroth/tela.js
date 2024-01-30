import { Color, Image, Stream, IO, Utils, Mesh, Vec3, Scene, Camera, clamp } from "../../dist/node/index.js";
import { readFileSync } from "fs"

const { measureTime, measureTimeWithResult } = Utils;
const { saveImageStreamToVideo } = IO;

// constants
const width = 1080;
const height = 720;
const FPS = 25;
const dt = 1 / FPS;
const maxT = 10;

// scene
const scene = new Scene();
const camera = new Camera({ sphericalCoords: Vec3(10, 0, Math.PI / 6) });
const stanfordBunnyObj = readFileSync("./assets/bunny.obj", { encoding: "utf-8" });
let bunnyMesh = Mesh.readObj(stanfordBunnyObj, "bunny");
const bunnyBox = bunnyMesh.getBoundingBox();
bunnyMesh = bunnyMesh
    .mapVertices(v => v.sub(bunnyBox.min).div(bunnyBox.diagonal).scale(2).sub(Vec3(1, 1, 1)))
    .mapVertices(v => Vec3(-v.y, v.x, v.z))
    .mapVertices(v => Vec3(v.z, v.y, -v.x))
    .mapVertices(v => v.add(Vec3(0, 0, 3)))
    .mapColors(v => Color.ofRGB(...v.map(x => clamp()((x + 1) / 2)).toArray()));

const bunnyPoints = bunnyMesh.asPoints(0.02);
const bunnySpeeds = [...Array(bunnyPoints.length)].map(() => Vec3().map(() => 5 * (2 * Math.random() - 1)));
scene.addList(bunnyPoints);
// physics
const g = -9.8;
const bunnyPhysics = dt => {
    for (let i = 0; i < bunnyPoints.length; i++) {
        const acceleration = Vec3(0, 0, g);
        bunnySpeeds[i] = bunnyPoints[i].position.z <= 0 ?
            Vec3(0, 0, -bunnyPoints[i].position.z) :
            bunnySpeeds[i].add(acceleration.scale(dt));
        bunnyPoints[i].position = bunnyPoints[i].position.add(bunnySpeeds[i].scale(dt));
    }
}

const canvas = Image.ofSize(width, height);
const imageStream = new Stream(
    { time: 0, image: camera.sceneShot(scene).to(canvas) },
    ({ time, image }) => {
        const theta = Math.PI / 6 * time;
        camera.sphericalCoords = Vec3(camera.sphericalCoords.get(0), theta, Math.PI / 6);
        camera.orbit();
        const { result: newImage, time: t } = measureTimeWithResult(() => camera.sceneShot(scene).to(image));
        if (time > 1) bunnyPhysics(dt);
        console.log(`Image took ${t}s`);
        return {
            time: time + dt,
            image: newImage
        };
    }
)

console.log(
    "Video created in: ",
    measureTime(() => {
        saveImageStreamToVideo(
            "./bunny_explode.mp4",
            imageStream,
            { fps: FPS }
        ).until(({ time }) => time < maxT);
    })
)

