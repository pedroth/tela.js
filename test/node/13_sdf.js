import { Image, Stream, IO, measureTime, measureTimeWithResult, Mesh, Vec3, Camera, KScene } from "../../dist/node/index.js";
import { readFileSync } from "fs"

const { saveImageStreamToVideo } = IO;

// constants
const width = 640;
const height = 480;
const FPS = 25;
const dt = 1 / FPS;
const maxT = 10;

// scene
const scene = new KScene();
const camera = new Camera().orbit(5, 0, 0);
const obj = readFileSync("./assets/spot.obj", { encoding: "utf-8" });
let mesh = Mesh.readObj(obj, "mesh");
mesh = mesh
    .mapVertices(v => Vec3(-v.y, v.x, v.z))
    .mapVertices(v => Vec3(v.z, v.y, -v.x))
scene.addList(mesh.asPoints(0.05));

const canvas = Image.ofSize(width, height);
const imageStream = new Stream(
    { time: 0, image: camera.sdfShot(scene).to(canvas) },
    ({ time, image }) => {
        const theta = Math.PI / 4 * time;
        camera.orbit(coords => Vec3(coords.x, theta, 0));
        const { result: newImage, time: t } = measureTimeWithResult(() => camera.sdfShot(scene).to(image));
        console.log(`Image took ${t}s`);
        return {
            time: time + dt,
            image: newImage
        };
    }
)

console.log(
    "Video created in: ",
    await measureTime(async () => {
        await saveImageStreamToVideo(
            "./sdf.mp4",
            imageStream,
            { fps: FPS }
        ).while(({ time }) => time < maxT);
    })
)

