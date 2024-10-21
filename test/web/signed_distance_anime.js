/* eslint-disable no-undef */
async (canvas, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 640 / 2;
    const height = 480 / 2;
    canvas.resize(width, height);

    // scene
    const camera = new Camera();

    function torusSdf(p, r, R) {
        const q = Vec2(p.x, p.y).length() - r;
        return Vec2(q, p.z).length() - R;
    }
    function distanceFunction(p, time) {
        const box = new Box(Vec.ONES(3).scale(-0.5), Vec.ONES(3).scale(0.5));
        const sphere = { pos: Vec3(0.0, 0.0, 0.0), radius: 0.65 };
        const tau = (Math.sin(2 * Math.PI * 0.25 * (time - 1)) + 1) / 2;
        const cube = Math.max(box.distanceToPoint(p), -(sphere.pos.sub(p).length() - sphere.radius));
        const torus = torusSdf(p, 0.5, 0.25);
        return tau * torus + (1 - tau) * cube;
    }

    function normalFunction(p, time) {
        const epsilon = 1e-3;
        const f = distanceFunction(p, time);
        const n = Vec3(
            distanceFunction(p.add(Vec3(epsilon, 0, 0)), time) - f,
            distanceFunction(p.add(Vec3(0, epsilon, 0)), time) - f,
            distanceFunction(p.add(Vec3(0, 0, epsilon)), time) - f,
        );
        return n.normalize();
    }

    const rayScene = (ray, { time, lightPosSerial }) => {
        const maxIte = 100;
        const maxDist = 10;
        const epsilon = 1e-3;
        const lightPos = Vec.fromArray(lightPosSerial);
        const { init } = ray;
        let p = init;
        let t = distanceFunction(p, time);
        for (let i = 0; i < maxIte; i++) {
            p = ray.trace(t);
            const d = distanceFunction(p, time);
            t += d;
            if (d < epsilon) {
                const shade = Math.max(
                    0,
                    normalFunction(p, time).dot(lightPos.sub(p).normalize())
                );
                return Color.ofRGB(shade, 0, 0);
            }
            if (d > maxDist) return Color.ofRGB(0, 0, i / maxIte);
        }
        return Color.BLACK;
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
        camera.orbit((coords) =>
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
        camera.orbit((coords) => coords.add(Vec3(deltaY * 0.001, 0, 0)));
    });

    loop(async ({ dt, time }) => {
        const lightPos = Vec3(Math.cos(time), Math.sin(time), 1).scale(2);
        // camera.rayMap(ray => rayScene(ray, {time, lightPosSerial: lightPos.toArray()})).to(canvas).paint()
        (await camera.rayMapParallel(rayScene, [torusSdf, distanceFunction, normalFunction]).to(canvas, { time, lightPosSerial: lightPos.toArray() })).paint();
        logger.print(`FPS: ${(1 / dt).toFixed(2)}`);
    }).play();
}
