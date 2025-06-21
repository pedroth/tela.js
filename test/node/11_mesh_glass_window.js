import {
  Color,
  Image,
  Mesh,
  Vec3,
  Camera,
  Triangle,
  DiElectric,
  KScene,
  loop,
  Window,
} from "../../src/index.node.js";
import { readFileSync } from "fs";

// constants
const width = 640;
const height = 480;

// scene
const scene = new KScene();
const camera = new Camera({ lookAt: Vec3(1.5, 1.5, 1.5) }).orbit(5, 0, 0);
const meshObj = readFileSync("./assets/spot.obj", { encoding: "utf-8" });
let mesh = Mesh.readObj(meshObj, "mesh").addTexture(
  Image.ofUrl("./assets/spot.png")
);
mesh = mesh
  .mapVertices((v) => Vec3(-v.z, -v.x, v.y))
  .mapVertices((v) => v.add(Vec3(1.5, 1.5, 1.0)))
  .mapColors(() => Color.WHITE)
  .mapMaterials(() => DiElectric(1.3333));
scene.addList(mesh.asTriangles());
scene.add(
  Triangle.builder()
    .name("left-1")
    .colors(Color.RED, Color.RED, Color.RED)
    .positions(Vec3(3, 0, 3), Vec3(3, 0, 0), Vec3())
    .build(),
  Triangle.builder()
    .name("left-2")
    .colors(Color.RED, Color.RED, Color.RED)
    .positions(Vec3(), Vec3(0, 0, 3), Vec3(3, 0, 3))
    .build(),
  Triangle.builder()
    .name("right-1")
    .colors(Color.GREEN, Color.GREEN, Color.GREEN)
    .positions(Vec3(0, 3, 0), Vec3(3, 3, 0), Vec3(3, 3, 3))
    .build(),
  Triangle.builder()
    .name("right-2")
    .colors(Color.GREEN, Color.GREEN, Color.GREEN)
    .positions(Vec3(3, 3, 3), Vec3(0, 3, 3), Vec3(0, 3, 0))
    .build(),
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
  Triangle.builder()
    .name("top-1")
    .colors(Color.WHITE, Color.WHITE, Color.WHITE)
    .positions(Vec3(3, 3, 3), Vec3(3, 0, 3), Vec3(0, 0, 3))
    .build(),
  Triangle.builder()
    .name("top-2")
    .colors(Color.WHITE, Color.WHITE, Color.WHITE)
    .positions(Vec3(0, 0, 3), Vec3(0, 3, 3), Vec3(3, 3, 3))
    .build(),
  Triangle.builder()
    .name("back-1")
    .colors(Color.WHITE, Color.WHITE, Color.WHITE)
    .positions(Vec3(), Vec3(0, 3, 0), Vec3(0, 3, 3))
    .build(),
  Triangle.builder()
    .name("back-2")
    .colors(Color.WHITE, Color.WHITE, Color.WHITE)
    .positions(Vec3(0, 3, 3), Vec3(0, 0, 3), Vec3())
    .build(),
  Triangle.builder()
    .name("light-1")
    .colors(Color.WHITE, Color.WHITE, Color.WHITE)
    .positions(Vec3(1, 1, 2.9), Vec3(2, 1, 2.9), Vec3(2, 2, 2.9))
    .emissive(true)
    .build(),
  Triangle.builder()
    .name("light-2")
    .colors(Color.WHITE, Color.WHITE, Color.WHITE)
    .positions(Vec3(2, 2, 2.9), Vec3(1, 2, 2.9), Vec3(1, 1, 2.9))
    .emissive(true)
    .build()
);

const window = Window.ofSize(width, height).exposure();
let frames = 0
loop(async ({ dt }) => {
   const image = await camera
    .parallelShot(scene, {
      bounces: 10,
      samplesPerPxl: 1,
      gamma: 0.5,
    })
    .to(window);
  image.paint();
  window.setTitle(`FPS: ${Math.round(1 / dt)}, frames: ${frames++}`);
}).play()

