/* eslint-disable no-undef */
async (canvas, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 640 / 3;
    const height = 480 / 3;
    canvas.resize(width, height);

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

    // Main rendering loop
    const camera = new Camera();
    const clampAcos = clamp(-1, 1);
    const backgroundImage = await Canvas.ofUrl("/assets/universe.jpg");
    const blackHole = Sphere.builder().radius(1).build();
    const rayScene = (ray) => {
        function renderBackground(ray) {
            const dir = ray.dir;
            const theta = Math.atan2(dir.y, dir.x) / (Math.PI);
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
    loop(({ dt }) => {
        // Render the scene
        const renderedScene = camera
            .rayMap(rayScene)
            .to(canvas);

        // Paint the rendered scene
        renderedScene.paint();

        // Update window title with FPS
        logger.print(`FPS: ${(1 / dt).toFixed(2)}`);
    }).play();

}
