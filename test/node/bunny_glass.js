import { Color, Image, IO, Utils, Mesh, Vec3, Camera, Triangle, DiElectric, KScene, Point, Metallic, } from "../../dist/node/index.js";
import { readFileSync } from "fs"

const { measureTime, } = Utils;
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
    .mapMaterials(() => Metallic(1.3333))
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
    // Point
    //     .builder()
    //     .radius(0.25)
    //     .name("sphere")
    //     .color(Color.ofRGB(1, 0, 1))
    //     .material(Metallic(0.25))
    //     .position(Vec3(1.5, 0.5, 1.5))
    //     .build(),
    // Point
    //     .builder()
    //     .radius(0.25)
    //     .name("metal-sphere")
    //     .color(Color.WHITE)
    //     .material(Metallic())
    //     .position(Vec3(1.5, 2.5, 1.5))
    //     .build(),
    // Point
    //     .builder()
    //     .radius(0.5)
    //     .name("glass-sphere")
    //     .color(Color.ofRGB(1, 1, 1))
    //     .material(DiElectric(1.5))
    //     .position(Vec3(1.0, 1.5, 1.0))
    //     .build(),
)

const shot = (image) => camera.sceneShot(scene, { samplesPerPxl: 100, bounces: 20 }).to(image ?? Image.ofSize(width, height));

const time = measureTime(
    () => saveImageToFile(
        `./bunny_glass.png`,
        shot(Image.ofSize(width, height))
    )
);
console.log(`Image done in ${time}s`);


// let w = width;
// let h = height;
// const sizes = [[w, h]];
// let i = 1;
// while ((h >> i) % 2 === 0 && (w >> i) % 2 === 0) {
//     w = w >> i;
//     h = h >> i;
//     sizes.push([w, h]);
//     i++;
// }

// const sortedSizes = sizes.sort((a, b) => a[0] - b[0]);
// sortedSizes.forEach(([wi, hi]) => {
//     console.log(">>>", sizes);
//     const time = measureTime(
//         () => saveImageToFile(
//             `./bunny_glass_${wi}_${hi}.ppm`,
//             shot(Image.ofSize(wi, hi))
//         )
//     );
//     console.log(`Image done in ${time}s`);
// })
