import { Color, Vec2, Window, loop, Camera, Vec3, Vec, Image, clamp, Sphere } from "../../src/index.node.js";

const width = 640;
const height = 480;
const window = new Window(width/2, height/2).onResizeWindow(() => window.paint());
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
const blackHole = Sphere.builder().radius(3).build();
const rayScene = (ray) => {
  function renderBackground(ray) {
    const dir = ray.dir;
    const theta = Math.atan2(dir.y, dir.x) / (Math.PI);
    const alpha = Math.acos(-clampAcos(dir.z)) / (Math.PI);
    return backgroundImage.getPxl(theta * backgroundImage.width, alpha * backgroundImage.height);
  }

  const hit = blackHole.interceptWithRay(ray);
  if(hit) {
    const [_, hitPoint, sphere] = hit;
    
    
  }
  return renderBackground(ray);
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