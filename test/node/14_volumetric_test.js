import { Color, Vec2, Window, loop, Camera, Vec3, Vec } from "../../src/index.node.js";

const width = 640 / 3;
const height = 480 / 3;
const window = new Window(width, height).onResizeWindow(() => window.paint());
window.setWindowSize(1024, 720);

// scene
const camera = new Camera();

// utils
function distanceFunction(p) {
  return p.length() - 1;
}

function noise(p, coeffs, phases, time = 0) {
  let acc = 0;
  let halves = 0.7;
  for (let i = 0; i < coeffs.length; i++) {
    acc += halves * Math.sin(2 * Math.PI * i * p.dot(coeffs[i]) - phases[i] - time);
    halves *= halves;
  }
  return Math.abs(acc - Math.floor(acc));
}

function pallete(density) {
  let t = density;
  // Define color stops
  const stops = [
    { t: 0.0, r: 0.0, g: 0.0, b: 1.0 },  // Blue
    { t: 0.25, r: 0.0, g: 1.0, b: 1.0 }, // Cyan
    { t: 0.5, r: 0.0, g: 1.0, b: 0.0 },  // Green
    { t: 0.75, r: 1.0, g: 1.0, b: 0.0 }, // Yellow
    { t: 1.0, r: 1.0, g: 0.0, b: 0.0 }   // Red
  ];

  // Find the two stops we're between
  let i = 0;
  while (i < stops.length - 1 && stops[i + 1].t <= t) {
    i++;
  }

  const stop1 = stops[i];
  const stop2 = stops[i + 1] || stop1;

  // Interpolate between the two stops
  const range = stop2.t - stop1.t;
  const factor = range === 0 ? 0 : (t - stop1.t) / range;
  const color = [
    stop1.r + (stop2.r - stop1.r) * factor,
    stop1.g + (stop2.g - stop1.g) * factor,
    stop1.b + (stop2.b - stop1.b) * factor
  ];
  return Color.ofRGB(t * color[0], t * color[1], t * color[2]);
}

const rayScene = (ray, { time, serialCoeffs, phases }) => {
  const alpha = 0.01;
  const maxDist = 10;
  const epsilon = 1e-3;
  const MARCH_STEP = 0.01;
  const MAX_STEPS = 1 / MARCH_STEP;
  const coeffs = serialCoeffs.map(c => Vec.fromArray(c));

  const { init } = ray;
  let p = init;
  let t = distanceFunction(p);
  let density = 0;
  for (let i = 0; i < maxDist; i++) {
    p = ray.trace(t);
    const d = distanceFunction(p);
    t += d;
    if (d < epsilon) {
      continue;
    }
    if (d > maxDist) {
      return Color.BLACK;
    }
  }
  const t0 = t;
  for (let i = 0; i < MAX_STEPS; i++) {
    t += MARCH_STEP;
    p = ray.trace(t);
    const d = distanceFunction(p);
    if (d < 0) {
      density += Math.exp(-(t - t0) * alpha) * MARCH_STEP * noise(p, coeffs, phases, time);
    }
  }
  return pallete(density);
};

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

// main
// Generate random coefficients and phases
const coeffs = [...Array(10)].map(() =>
  Vec.RANDOM(3).scale(2).sub(Vec3(1, 1, 1)).normalize()
);
const phases = coeffs.map(() => 2 * Math.PI * Math.random());

// Main rendering loop
loop(async ({ dt, time }) => {
  // Render the scene
  const renderedScene = await camera
    .rayMapParallel(rayScene, [noise, distanceFunction, pallete])
    .to(window, {
      time,
      serialCoeffs: coeffs.map(x => x.toArray()),
      phases
    });

  // Paint the rendered scene
  renderedScene.paint();

  // Update window title with FPS
  window.setTitle(`FPS: ${(1 / dt).toFixed(2)}`);
}).play();