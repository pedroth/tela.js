import { Color, Image, Stream, IO, Utils, Mesh, Vec3, Scene, BScene, Camera, clamp } from "../../dist/node/index.js";
import { readFileSync } from "fs"

const { measureTime, measureTimeWithResult } = Utils;
const { saveImageStreamToVideo } = IO;

// constants
const width = 640;
const height = 480;
const FPS = 25;
const dt = 1 / FPS;
const maxT = 10;

// scene
const scene = new Scene();
const camera = new Camera({ sphericalCoords: Vec3(5, 0, 0) });
const stanfordBunnyObj = readFileSync("./assets/bunny_orig.obj", { encoding: "utf-8" });
let bunnyMesh = Mesh.readObj(stanfordBunnyObj, "bunny");
const bunnyBox = bunnyMesh.getBoundingBox();
bunnyMesh = bunnyMesh
    .mapVertices(v => v.sub(bunnyBox.min).div(bunnyBox.diagonal).scale(2).sub(Vec3(1, 1, 1)))
    .mapVertices(v => Vec3(-v.y, v.x, v.z))
    .mapVertices(v => Vec3(v.z, v.y, -v.x))
    .mapColors(v => Color.ofRGB(...v.map(x => clamp()((x + 1) / 2)).toArray()));
scene.add(...bunnyMesh.asPoints(0.05));

const shoot = (img) => camera.normalShot(scene).to(img);

const imageStream = new Stream(
    { time: 0, image: shoot(Image.ofSize(width, height)) },
    ({ time, image }) => {
        const theta = Math.PI / 4 * time;
        camera.sphericalCoords = Vec3(camera.sphericalCoords.get(0), theta, 0);
        camera.orbit();
        const { result: newImage, time: t } = measureTimeWithResult(() => shoot(image));
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
            { fps: FPS }
        ).until(({ time }) => time < maxT);
    })
)

