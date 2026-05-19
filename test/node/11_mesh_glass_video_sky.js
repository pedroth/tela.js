import {
  Color,
  Image,
  Stream,
  IO,
  measureTime,
  measureTimeWithResult,
  Mesh,
  Vec3,
  Camera,
  Triangle,
  DiElectric,
  KScene,
} from "../../src/index.node.js";
import { readFileSync } from "fs";

const { saveImageStreamToVideo } = IO;

// constants
const width = 640;
const height = 480;
const FPS = 25;
const dt = 1 / FPS;
const maxT = 10;

// scene
const scene = new KScene();
const camera = new Camera({ lookAt: Vec3(1.5, 1.5, 1.5) }).orbit(5, 0, 0);
const stanfordBunnyObj = readFileSync("./assets/bunny_orig.obj", {
  encoding: "utf-8",
});
let bunnyMesh = Mesh.readObj(stanfordBunnyObj, "bunny");
const bunnyBox = bunnyMesh.getBoundingBox();
bunnyMesh = bunnyMesh
  .mapVertices((v) =>
    v.sub(bunnyBox.min).div(bunnyBox.diagonal).scale(2).sub(Vec3(1, 1, 1))
  )
  .mapVertices((v) => Vec3(-v.y, v.x, v.z))
  .mapVertices((v) => Vec3(v.z, v.y, -v.x))
  .mapVertices((v) => v.add(Vec3(1.5, 1.5, 1.2)))
  .mapColors(() => Color.WHITE)
  .mapMaterials(() => DiElectric(1.3));
scene.addList(bunnyMesh.asTriangles());

scene.add(
  Triangle.builder()
    .name("bottom-1")
    .colors(Color.WHITE, Color.WHITE, Color.WHITE)
    .positions(Vec3(), Vec3(3, 0, 0), Vec3(3, 3, 0))
    .build(),
  Triangle.builder()
    .name("bottom-2")
    .colors(Color.WHITE, Color.WHITE, Color.WHITE)
    .positions(Vec3(3, 3, 0), Vec3(0, 3, 0), Vec3())
    .build(),
);

const lightDir = Vec3(0, 1, 1).normalize();
const lightSharpness = 200;
const shot = async (image) => {
  return await camera
    .parallelShot(
      scene,
      {
        samplesPerPxl: 20,
        bounces: 10,
        gamma: 0.5,
        isBiased: false,
        skyBoxPath: "./assets/sky.jpg",
        useMetro: true,
        useCache: true,
        lightDir,
        lightSharpness,
      }
    )
    .to(image ?? Image.ofSize(width, height));
};

const imageStream = new Stream(
  { time: 0, image: await shot() },
  async ({ time, image }) => {
    const theta = (Math.PI / 4) * time;
    camera.orbit((spherical) => Vec3(spherical.x, theta, 0));

    const { result: newImage, time: t } = await measureTimeWithResult(() =>
      shot(image)
    );

    console.log(`Image took ${t}s`);

    return {
      time: time + dt,
      image: newImage,
    };
  }
);

console.log(
  "Video created in: ",
  await measureTime(async () => {
    await saveImageStreamToVideo("./bunny_glass_sky.mp4", imageStream, {
      fps: FPS,
    }).while(({ time }) => time < maxT);
  })
);