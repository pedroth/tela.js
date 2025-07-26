import { Color, Vec2, Window, loop, Camera, Vec3, Vec, Image, clamp, Sphere, Ray } from "../../src/index.node.js";

const width = 640;
const height = 480;
const window = new Window(width / 3, height / 3).onResizeWindow(() => window.paint());
window.setWindowSize(width, height);

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
  camera.orbit(coords => coords.add(
    Vec3(
      0,
      -2 * Math.PI * (dx / window.width),
      -2 * Math.PI * (dy / window.height)
    )
  ));
  mouse = newMouse;
});
window.onMouseWheel(({ deltaY }) => {
  camera.orbit(coords => coords.add(Vec3(deltaY * 0.1, 0, 0)));
});

// Main rendering loop
const camera = new Camera();
const clampAcos = clamp(-1, 1);
const backgroundImage = await Image.ofUrl("./assets/universe.jpg");
const blackHole = Sphere.builder().radius(1).build();
const rayScene = (ray) => {
  function renderBackground(ray) {
    const dir = ray.dir;
    // atan2 returns [-π, π], we want [0, 1]
    const theta = Math.atan2(dir.y, dir.x) / (2 * Math.PI) + 0.5;
    const alpha = Math.acos(-clampAcos(dir.z)) / (Math.PI);
    return backgroundImage.getPxl(theta * backgroundImage.width, alpha * backgroundImage.height);
  }

  const realBHRadius = 0.1;
  const n = 50; // Number of steps for simulation
  const speedOfLight = 3; // Arbitrary speed of light
  const dt = 1 / n; // Time step for simulation
  let v = ray.dir.scale(speedOfLight);
  let x = ray.init;
  for (let i = 0; i < n; i++) {
    const r = blackHole.position.sub(x);
    const a = r.scale(1 / r.squareLength());
    v = v.add(a.scale(dt)); // Simulate gravitational pull
    x = x.add(v.scale(dt)); // Update position
    if (blackHole.position.sub(x).length() < blackHole.radius * realBHRadius) {
      return Color.ofRGB(0, 0, 0); // Black hole color
    }
  }
  return renderBackground(Ray(x, v.normalize()));
};
loop(async ({ dt, time }) => {
  // Render the scene
  const renderedScene = await camera
    .rayMap(rayScene)
    .to(window);

  // Paint the rendered scene
  renderedScene.paint();

  // Update window title with FPS
  window.setTitle(`FPS: ${(1 / dt).toFixed(2)}`);
}).play();