import { Color, Image, Stream, IO, Utils, Mesh, Vec3, Scene, Camera, clamp, Triangle, Metallic, DiElectric } from "../../dist/node/index.js";
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
const camera = new Camera({
    sphericalCoords: Vec3(3, 0, 0),
    focalPoint: Vec3(1.5, 1.5, 1.5)
});
const stanfordBunnyObj = readFileSync("./assets/bunny_orig.obj", { encoding: "utf-8" });
let bunnyMesh = Mesh.readObj(stanfordBunnyObj, "bunny");
const bunnyBox = bunnyMesh.getBoundingBox();
bunnyMesh = bunnyMesh
    .mapVertices(v => v.sub(bunnyBox.min).div(bunnyBox.diagonal).scale(2).sub(Vec3(1, 1, 1)))
    .mapVertices(v => Vec3(-v.y, v.x, v.z))
    .mapVertices(v => Vec3(v.z, v.y, -v.x))
    .mapVertices(v => v.add(Vec3(1.5, 1.5, 1.5)))
    .mapColors(() => Color.WHITE)
    .mapMaterials(() => DiElectric(2.0))
scene.add(...bunnyMesh.asTriangles());

scene.add(

    Triangle
        .builder()
        .name("bottom-1")
        .colors(Color.WHITE, Color.WHITE, Color.WHITE)
        .positions(Vec3(), Vec3(3, 0, 0), Vec3(3, 3, 0))
        .build(),
    Triangle
        .builder()
        .name("bottom-2")
        .colors(Color.WHITE, Color.WHITE, Color.WHITE)
        .positions(Vec3(3, 3, 0), Vec3(0, 3, 0), Vec3())
        .build(),
    Triangle
        .builder()
        .name("top-1")
        .colors(Color.WHITE, Color.WHITE, Color.WHITE)
        .positions(Vec3(3, 3, 3), Vec3(3, 0, 3), Vec3(0, 0, 3))
        .build(),
    Triangle
        .builder()
        .name("top-2")
        .colors(Color.WHITE, Color.WHITE, Color.WHITE)
        .positions(Vec3(0, 0, 3), Vec3(0, 3, 3), Vec3(3, 3, 3))
        .build(),
    Triangle
        .builder()
        .name("light-1")
        .colors(Color.WHITE, Color.WHITE, Color.WHITE)
        .positions(Vec3(1, 1, 2.9), Vec3(2, 1, 2.9), Vec3(2, 2, 2.9))
        .emissive(true)
        .build(),
    Triangle
        .builder()
        .name("light-2")
        .colors(Color.WHITE, Color.WHITE, Color.WHITE)
        .positions(Vec3(2, 2, 2.9), Vec3(1, 2, 2.9), Vec3(1, 1, 2.9))
        .emissive(true)
        .build(),
)

const imageStream = new Stream(
    { time: 0, image: camera.sceneShot(scene).to(Image.ofSize(width, height)) },
    ({ time, image }) => {
        const theta = Math.PI / 4 * time;
        camera.sphericalCoords = Vec3(camera.sphericalCoords.get(0), theta, 0);
        camera.orbit();
        const { result: newImage, time: t } = measureTimeWithResult(() => camera.sceneShot(scene, { samplesPerPxl: 25 }).to(image));
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
            "./bunny_glass_stream.mp4",
            imageStream,
            { fps: FPS }
        ).until(({ time }) => time < maxT);
    })
)
