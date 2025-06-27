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

const camera = new Camera().orbit(2, 0, 0);
    const backgroundSrc = "./assets/universe.jpg";
    const rayScene = async (ray, { _memory_, backgroundSrc, time }) => {
        if (_memory_.backgroundImage === undefined) {
            _memory_.backgroundImage = await Image.ofUrl(backgroundSrc);
        }
        const clampAcos = (x) => x > 1 ? 1 : x < -1 ? -1 : x;
        const realBHRadius = 0.1;
        const blackHole = Sphere.builder().radius(realBHRadius).build();
        const backgroundImage = _memory_.backgroundImage;
        function renderBackground(ray) {
            const dir = ray.dir;
            const theta = Math.atan2(dir.y, dir.x) / (Math.PI);
            const alpha = Math.acos(-clampAcos(dir.z)) / (Math.PI);
            return backgroundImage
                .getPxl(
                    theta * backgroundImage.width,
                    alpha * backgroundImage.height
                );
        }

        function torusSdf(p, r, R) {
            const q = Vec2(p.x, p.y).length() - r;
            return Vec2(q, p.z).length() - R;
        }
        const torus = p => torusSdf(p, 0.5, 0.05);
        const n = 100; // Number of steps for simulation
        const speedOfLight = 2.3; // Arbitrary speed of light
        const dt = 0.01; // Time step for simulation
        let v = ray.dir.scale(speedOfLight);
        let x = ray.init;
        for (let i = 0; i < n; i++) {
            const r = blackHole.position.sub(x);
            const a = r.scale(1 / r.squareLength());
            v = v.add(a.scale(dt)); // Simulate gravitational pull
            x = x.add(v.scale(dt)); // Update position
            const tD = torus(x);
            if (tD < 1e-6) {
                const theta = (Math.atan2(x.y, x.x) - 2 * time) % Math.PI;
                const angle = Math.exp(-0.25 * theta * theta);
                return Color.ofRGB(0.9, 0.7 * angle, 0.25 * angle)
            }
            if (blackHole.distanceToPoint(x) < 1e-3) {
                return Color.ofRGB(0, 0, 0); // Black hole color
            }
        }
        const tD = torus(x);
        const tDD = clampAcos(0.04 / (tD * tD));
        return Color.ofRGB(tDD, 0.5 * tDD, 0.3 * tDD)
            .add(renderBackground(Ray(x, v.normalize())))
            .scale(0.5)
    };

    loop(async ({ dt, time }) => {
        // Render the scene
        const renderedCanvas = await camera
            .rayMapParallel(rayScene)
            .to(window, { backgroundSrc, time });
        // Paint the rendered scene
        renderedCanvas.paint();

        // Update window title with FPS
        window.setTitle(`FPS: ${(1 / dt).toFixed(2)}`);
    }).play();