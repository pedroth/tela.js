import { Color, Image, Stream, IO, Utils, Mesh, Vec3, Scene, Camera } from "../../dist/node/index.js";
import { readFileSync } from "fs"

const { measureTime } = Utils;
const { saveImageStreamToVideo } = IO;

const measureTime2 = lambda => {
    const t = performance.now();
    const ans = lambda()
    return [ans, 1e-3 * (performance.now() - t)];
}

const width = 640;
const height = 480;

// scene
const scene = new Scene()
const camera = new Camera({ sphericalCoords: Vec3(5, 0, 0) });
const stanfordBunnyObj = readFileSync("./assets/bunny.obj", { encoding: "utf-8" });
let bunnyMesh = Mesh.readObj(stanfordBunnyObj);
const bunnyBox = bunnyMesh.getBoundingBox();
bunnyMesh = bunnyMesh
    .mapVertices(v => v.sub(bunnyBox.min).div(bunnyBox.diagonal).scale(2).sub(Vec3(1, 1, 1)))
    .mapVertices(v => Vec3(-v.y, v.x, v.z))
    .mapVertices(v => Vec3(v.z, v.y, -v.x))
    .mapColors(v => Color.ofRGB(...v.map(x => Math.max(0, Math.min(1, 0.5 * (x + 1)))).toArray()));
scene.add(...bunnyMesh.asPoints("bunny", 0.05));

const imageStream = new Stream(
    { time: 0, image: camera.sceneShot(scene).to(Image.ofSize(width, height)) },
    ({ time, image }) => {
        const dt = 0.04; // 25 FPS
        const theta = Math.PI / 4 * time;
        camera.sphericalCoords = Vec3(camera.sphericalCoords.get(0), theta, 0);
        camera.orbit();
        const [newImage, t] = measureTime2(() => camera.sceneShot(scene).to(image));
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
            "./bunny_stream.mp4",
            imageStream,
            { fps: 25 }
        ).until(({ time }) => time < 10);
    })
)

