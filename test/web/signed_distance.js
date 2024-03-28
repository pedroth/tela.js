/* eslint-disable no-undef */
async (canvas, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 640/2;
    const height = 480/2;
    canvas.resize(width, height);
    // scene
    const camera = new Camera();
    const light = { pos: Vec3(2, 0, 0) };
    const maxIte = 100;
    const maxDist = 10;
    const epsilon = 1e-3;

    const box = new Box(Vec.ONES(3).scale(-0.5), Vec.ONES(3).scale(0.5));
    const sphere = { pos: Vec3(0.0, 0.0, 0.0), radius: 0.65 };
    const distanceFunction = p => Math.max(box.distanceToPoint(p), -(sphere.pos.sub(p).length() - sphere.radius))

    const rayScene = (ray) => {
        const { init } = ray;
        let p = init;
        let t = distanceFunction(p);
        for (let i = 0; i < maxIte; i++) {
            p = ray.trace(t);
            const d = distanceFunction(p);
            t += d;
            if (d < epsilon) {
                const shade = Math.max(
                    0,
                    box
                        .estimateNormal(p)
                        .dot(
                            light
                                .pos
                                .sub(p)
                                .normalize()
                        )
                )
                return Color.ofRGB(shade, 0, 0);
            }
            if (d > maxDist) return Color.ofRGB(0, 0, i / maxIte);
        }
        return Color.BLACK;
    }
    // mouse handling
    let mousedown = false;
    let mouse = Vec2();
    canvas.onMouseDown((x, y) => {
        mousedown = true;
        mouse = Vec2(x, y);
    })
    canvas.onMouseUp(() => {
        mousedown = false;
        mouse = Vec2();
    })
    canvas.onMouseMove((x, y) => {
        const newMouse = Vec2(x, y);
        if (!mousedown || newMouse.equals(mouse)) {
            return;
        }
        const [dx, dy] = newMouse.sub(mouse).toArray();
        camera.sphericalCoords = camera.sphericalCoords.add(
            Vec3(
                0,
                -2 * Math.PI * (dx / canvas.width),
                -2 * Math.PI * (dy / canvas.height)
            )
        );
        mouse = newMouse;
        camera.orbit();
    })
    canvas.onMouseWheel(({ deltaY }) => {
        camera.sphericalCoords = camera.sphericalCoords.add(Vec3(deltaY * 0.001, 0, 0));
        camera.orbit();
    })

    Animation
        .builder()
        .initialState({ it: 1, time: 0, oldTime: new Date().getTime() })
        .nextState(({ it, time, oldTime }) => {
            const dt = (new Date().getTime() - oldTime) * 1e-3;
            oldTime = new Date().getTime()
            const t = time;
            light.pos = Vec3(Math.cos(t), Math.sin(t), 1).scale(2);
            camera.rayMap(rayScene).to(canvas);
            logger.print(`FPS: ${Math.floor(1 / dt)}`);
            return {
                it: it + 1,
                time: time + dt,
                oldTime
            };
        })
        .while(() => true)
        .build()
        .play();
}
