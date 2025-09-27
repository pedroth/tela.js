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
  Metallic,
  Vec2,
} from "../../src/index.node.js";
import { readFileSync } from "fs";

// constants
const width = 640 / 2;
const height = 480 / 2;
const window = Window.ofSize(width, height);
window.setWindowSize(width * 2, height * 2);
let exposedWindow = window.exposure();

// scene
const scene = new KScene();
const camera = new Camera({ lookAt: Vec3(1.5, 1.5, 1.5) }).orbit(5, 0, 0);
const meshObj = readFileSync("./assets/teapot.obj", { encoding: "utf-8" });
let mesh = Mesh.readObj(meshObj, "mesh")
// .addTexture(Image.ofUrl("./assets/spot.png"));

const box = mesh.getBoundingBox();
const scaleInv = 2 / box.diagonal.fold((e, x) => Math.max(e, x), Number.MIN_VALUE);
mesh = mesh
  .mapVertices(v => v.sub(box.center).scale(scaleInv))
  .mapVertices((v) => Vec3(-v.z, -v.x, v.y))
  .mapVertices((v) => v.add(Vec3(1.5, 1.5, 1.0)))
  .mapColors(() => Color.WHITE)
  // .mapMaterials(() => DiElectric(1.3333));
  .mapMaterials(() => Metallic(0.01));
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
scene.rebuild()

// mouse handling
let mousedown = false;
let mouse = Vec2();

window.onMouseDown((x, y) => {
  mousedown = true;
  mouse = Vec2(x, y);
});

window.onMouseUp(() => {
  mousedown = false;
  mouse = Vec2();
});

window.onMouseMove((x, y) => {
  const newMouse = Vec2(x, y);
  if (!mousedown || newMouse.equals(mouse)) {
    return;
  }
  const [dx, dy] = newMouse.sub(mouse).toArray();
  camera.orbit((orbitCoord) =>
    orbitCoord.add(
      Vec3(
        0,
        -2 * Math.PI * (dx / window.width),
        -2 * Math.PI * (dy / window.height)
      )
    )
  );
  mouse = newMouse;
  exposedWindow = window.exposure();
});

window.onMouseWheel(({ deltaY }) => {
  camera.orbit((orbitCoord) => orbitCoord.add(Vec3(deltaY * 0.1, 0, 0)));
  exposedWindow = window.exposure();
});


let frames = 0
loop(async ({ dt }) => {
  const image = await camera
    .parallelShot(scene, {
      bounces: 6,
      samplesPerPxl: 1,
      gamma: 0.5,
    })
    .to(exposedWindow);
  image.paint();
  window.setTitle(`FPS: ${Math.round(1 / dt)}, frames: ${frames++}`);
}).play()

