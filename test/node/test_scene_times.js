import { Image, Stream, IO, Utils, Mesh, Vec3, Camera, NaiveScene, BScene, KScene } from "../../dist/node/index.js";
import { readFileSync } from "fs"

const { measureTime, measureTimeWithResult } = Utils;
const { saveImageStreamToVideo } = IO;

// constants
const width = 640;
const height = 480;
const FPS = 25;
const dt = 1 / FPS;
const maxT = 1;
// re-usable scene
const canvas = Image.ofSize(width, height);
const camera = new Camera({ sphericalCoords: Vec3(5, 0, 0) });
const obj = readFileSync("./assets/spot.obj", { encoding: "utf-8" });
let mesh = Mesh.readObj(obj, "mesh");
mesh = mesh
    .mapVertices(v => Vec3(-v.y, v.x, v.z))
    .mapVertices(v => Vec3(v.z, v.y, -v.x))
const scenes = [new BScene(), new KScene(100), new NaiveScene()];

// test
scenes.forEach(scene => {
    scene.addList(mesh.asPoints(0.025));
    const imageStream = new Stream(
        { time: 0, image: camera.sceneShot(scene).to(canvas) },
        ({ time, image }) => {
            const theta = Math.PI / 4 * time;
            camera.sphericalCoords = Vec3(camera.sphericalCoords.get(0), theta, 0);
            camera.orbit();
            const { result: newImage, time: t } = measureTimeWithResult(() => camera.sceneShot(scene).to(image));
            console.log(`Image took ${t}s`);
            return {
                time: time + dt,
                image: newImage
            };
        }
    )
    const totalTimeElapsed = measureTime(() => {
        saveImageStreamToVideo(
            `./test_${scene.constructor.name}.mp4`,
            imageStream,
            { fps: FPS }
        ).until(({ time }) => time < maxT);
    });
    console.log(
        `${scene.constructor.name} video created in: `,
        totalTimeElapsed
    )
    console.log(
        `${scene.constructor.name} average time per frame: `,
        totalTimeElapsed / (FPS * maxT)
    )
})


