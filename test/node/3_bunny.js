import { Color, Image, Stream, IO, measureTime, measureTimeWithResult, Mesh, Vec3, BScene, Camera, clamp } from "../../src/index.node.js";
import { readFileSync } from "fs"

const { saveImageStreamToVideo } = IO;

// constants
const width = 640;
const height = 480;
const FPS = 25;
const dt = 1 / FPS;
const maxT = 10;

// scene
const scene = new BScene();
const camera = new Camera().orbit(5, 0, 0);
const stanfordBunnyObj = readFileSync("./assets/bunny_orig.obj", { encoding: "utf-8" });
let bunnyMesh = Mesh.readObj(stanfordBunnyObj, "bunny");
const bunnyBox = bunnyMesh.getBoundingBox();
bunnyMesh = bunnyMesh
    .mapVertices(v => v.sub(bunnyBox.min).div(bunnyBox.diagonal).scale(2).sub(Vec3(1, 1, 1)))
    .mapVertices(v => Vec3(-v.y, v.x, v.z))
    .mapVertices(v => Vec3(v.z, v.y, -v.x))
    .mapColors(v => Color.ofRGB(...v.map(x => clamp()((x + 1) / 2)).toArray()));
scene.add(...bunnyMesh.asPoints(0.05));
scene.rebuild();

const shoot = (img) => camera.normalShot(scene).to(img);

const imageStream = new Stream(
    { time: 0, image: shoot(Image.ofSize(width, height)) },
    ({ time, image }) => {
        const theta = Math.PI / 4 * time;
        camera.orbit(coord => Vec3(coord.x, theta, 0));
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
    await measureTime(async () => {
        await saveImageStreamToVideo(
            "./bunny_stream.mp4",
            imageStream,
            { fps: FPS }
        ).while(({ time }) => time < maxT);
    })
)

