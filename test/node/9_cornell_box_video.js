import {
  Camera,
  Vec3,
  Color,
  DiElectric,
  Triangle,
  Image,
  renderBackground,
  videoAsync,
  Sphere,
  NaiveScene,
} from "../../src/index.node.js";

const width = 640;
const height = 480;

// scene
const scene = new NaiveScene();
const camera = new Camera({ lookAt: Vec3(1.5, 1.5, 1.5) }).orbit(5, 0, 0);


async function loadMesh() {
  // cornell box
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
}
await loadMesh();
const sphere = Sphere.builder()
  .name("sphere")
  .position(Vec3(1.5, 1.5, 1.5))
  .radius(0.5)
  .material(DiElectric(3))
  .color(Color.WHITE)
  .build();
scene.add(sphere);

const background = Image.ofUrl("./assets/sky.jpg");
function renderSkyBox(ray) {
  return renderBackground(ray, background);
}

const FPS = 30;
const maxVideoTime = 6; // time in seconds
let ite = 1;
async function animation({ time, image }) {
  sphere.position = Vec3(1.5 + 0.7 * Math.cos(time), 1.5 + 0.7 * Math.sin(time), 1.5);
  sphere.name = sphere.name + ite;
  ite++;
  return (await camera
    .parallelShot(
      scene,
      {
        bounces: 10,
        samplesPerPxl: 100,
        gamma: 0.5,
        useCache: true,
        useMetro: true
        // isBiased: false,
        // renderSkyBox
      }
    )
    .to(image))
    .paint();
}

videoAsync("cornell_box_video.mp4", animation, { width, height, FPS })
  .while(
    ({ time }) => time < maxVideoTime
  );