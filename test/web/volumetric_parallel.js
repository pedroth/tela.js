/* eslint-disable no-undef */
async (canvas, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 640 / 3;
    const height = 480 / 3;
    canvas.resize(width, height);

    // scene
    const camera = new Camera();
    function distanceFunction(p) {
        const box = new Box(Vec.ONES(3).scale(-1), Vec.ONES(3).scale(1));
        return box.distanceToPoint(p);
    }
    function noise(p, t) {
        return (Math.sin(10 * p.length() - t) + 1) / 2;
    }
    let alpha = 1;
    const rayScene = (ray, { alpha, time }) => {
        const MARCH_STEP = 0.05;
        const MAX_STEPS = 2 / MARCH_STEP;
        const maxDist = 10;
        const epsilon = 1e-3;
        const { init } = ray;
        let p = init;
        let t = distanceFunction(p);
        let density = 0;
        for (let i = 0; i < maxDist; i++) {
            p = ray.trace(t);
            const d = distanceFunction(p);
            t += d;
            if (d < epsilon) {
                break;
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
                density += Math.exp(-(t - t0) * alpha) * noise(p, 2 * time) * MARCH_STEP;
            }
        }
        return Color.ofRGB(density, density, density);
    };

    // mouse handling
    let mousedown = false;
    let mouse = Vec2();
    canvas.onMouseDown((x, y) => {
        mousedown = true;
        mouse = Vec2(x, y);
    });
    canvas.onMouseUp(() => {
        mousedown = false;
        mouse = Vec2();
    });
    canvas.onMouseMove((x, y) => {
        const newMouse = Vec2(x, y);
        if (!mousedown || newMouse.equals(mouse)) {
            return;
        }
        const [dx, dy] = newMouse.sub(mouse).toArray();
        camera.orbit(coords =>
            coords.add(
                Vec3(
                    0,
                    -2 * Math.PI * (dx / canvas.width),
                    -2 * Math.PI * (dy / canvas.height)
                )
            )
        );
        mouse = newMouse;
    });
    canvas.onMouseWheel(({ deltaY }) => {
        camera.orbit(coords => coords.add(Vec3(deltaY * 0.001, 0, 0)));
    });
    loop(async ({ time, dt }) => {
        (await camera.rayMapParallel(rayScene, [distanceFunction, noise]).to(canvas, { alpha, time })).paint();
        logger.print(`FPS: ${(1 / dt).toFixed(2)}`);
    }).play();

}
