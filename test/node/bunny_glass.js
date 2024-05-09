import { Color, Image, IO, Utils, Mesh, Vec3, Camera, Triangle, DiElectric, KScene, } from "../../dist/node/index.js";
import { readFileSync } from "fs"

const { measureTime,  } = Utils;
const { saveImageToFile } = IO;

// constants
const width = 640;
const height = 480;

// scene
const scene = new KScene();
const camera = new Camera({
    sphericalCoords: Vec3(5, 0, 0),
    focalPoint: Vec3(1.5, 1.5, 1.5)
});
const stanfordBunnyObj = readFileSync("./assets/bunny_orig.obj", { encoding: "utf-8" });
let bunnyMesh = Mesh.readObj(stanfordBunnyObj, "bunny");
const bunnyBox = bunnyMesh.getBoundingBox();
bunnyMesh = bunnyMesh
    .mapVertices(v => v.sub(bunnyBox.min).div(bunnyBox.diagonal).scale(2).sub(Vec3(1, 1, 1)))
    .mapVertices(v => v.scale(1))
    .mapVertices(v => Vec3(-v.y, v.x, v.z))
    .mapVertices(v => Vec3(v.z, v.y, -v.x))
    .mapVertices(v => v.add(Vec3(1.5, 1.5, 1.5)))
    .mapColors(() => Color.WHITE)
    .mapMaterials(() => DiElectric(1.3333))
scene.add(...bunnyMesh.asTriangles());

scene.add(
    Triangle
        .builder()
        .name("left-1")
        .colors(Color.RED, Color.RED, Color.RED)
        .positions(Vec3(3, 0, 3), Vec3(3, 0, 0), Vec3())
        .build(),
    Triangle
        .builder()
        .name("left-2")
        .colors(Color.RED, Color.RED, Color.RED)
        .positions(Vec3(), Vec3(0, 0, 3), Vec3(3, 0, 3))
        .build(),
    Triangle
        .builder()
        .name("right-1")
        .colors(Color.GREEN, Color.GREEN, Color.GREEN)
        .positions(Vec3(0, 3, 0), Vec3(3, 3, 0), Vec3(3, 3, 3))
        .build(),
    Triangle
        .builder()
        .name("right-2")
        .colors(Color.GREEN, Color.GREEN, Color.GREEN)
        .positions(Vec3(3, 3, 3), Vec3(0, 3, 3), Vec3(0, 3, 0))
        .build(),
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
        .name("back-1")
        .colors(Color.WHITE, Color.WHITE, Color.WHITE)
        .positions(Vec3(), Vec3(0, 3, 0), Vec3(0, 3, 3))
        .build(),
    Triangle
        .builder()
        .name("back-2")
        .colors(Color.WHITE, Color.WHITE, Color.WHITE)
        .positions(Vec3(0, 3, 3), Vec3(0, 0, 3), Vec3())
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

const shot = (image) => camera.sceneShot(scene, { samplesPerPxl: 25, bounces: 20, gamma: 0.01 }).to(image ?? Image.ofSize(width, height));

const time = measureTime(
    () => saveImageToFile(
        "./bunny_glass.jpeg",
        shot(Image.ofSize(width, height))
    )
);

console.log(`Image done in ${time}s`);