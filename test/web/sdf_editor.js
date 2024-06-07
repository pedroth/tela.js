/* eslint-disable no-undef */
async (canvas, logger) => {
    const div = document.createElement("div");
    div.innerHTML = `
        <p>Left mouse button: draw</p>
        <p>Right mouse button: move camera</p>
    `
    document.body.appendChild(div);
    canvas.DOM.addEventListener("contextmenu", (e) => e.preventDefault());
    // resize incoming canvas:Canvas object.
    const width = 640 / 2;
    const height = 480 / 2;
    canvas.resize(width, height);
    // scene
    const scene = new KScene()
    const camera = new Camera().orbit(5, 0, 0);
    const canvas2Ray = camera.getRaysFromCanvas(canvas);
    // mouse handling
    let leftMouseDown = false;
    let rightMouseDown = false;
    let mouse = Vec2();
    let ballId = 0;
    canvas.onMouseDown((x, y, e) => {
        e.preventDefault();
        if (e.button === 0) {
            leftMouseDown = true;
        } else {
            rightMouseDown = true;
        }
        mouse = Vec2(x, y);
    })
    canvas.onMouseUp(() => {
        leftMouseDown = false;
        rightMouseDown = false;
        mouse = Vec2();
    })
    canvas.onMouseMove((x, y) => {
        const newMouse = Vec2(x, y);
        const [dx, dy] = newMouse.sub(mouse).toArray();
        if (leftMouseDown) {
            const ray = canvas2Ray(x, y);
            const normal = canvas2Ray(width / 2, height / 2).dir;
            const p = ray.trace(-normal.dot(ray.init) / normal.dot(ray.dir));
            scene.add(
                Point
                    .builder()
                    .radius(0.25)
                    .position(p)
                    .name(ballId++)
                    .build()
            );
        }
        if (rightMouseDown) {
            camera.orbit(coords => coords.add(
                Vec3(
                    0,
                    -2 * Math.PI * (dx / canvas.width),
                    -2 * Math.PI * (dy / canvas.height)
                )
            ));
        }
        mouse = newMouse;
    })
    canvas.onMouseWheel(({ deltaY }) => {
        camera.orbit(coords => coords.add(Vec3(deltaY * 0.001, 0, 0)));
    })

    function render(ray) {
        const maxIte = 100;
        const epsilon = 1e-6;
        let p = ray.init;
        let t = scene.distanceOnRay(ray);
        let minT = t;
        for (let i = 0; i < maxIte; i++) {
            p = ray.trace(t);
            const d = scene.distanceOnRay(Ray(p, ray.dir));
            t += d;
            if (d < epsilon) {
                const normal = scene.normalToPoint(p);
                return Color.ofRGB(
                    (normal.x + 1) / 2,
                    (normal.y + 1) / 2,
                    (normal.z + 1) / 2
                )
            }
            if (d > 10) {
                return Color.ofRGB(0, 0, i / maxIte);
            }
            minT = d;
        }
        return Color.BLACK;
    }
    // scene
    Animation
        .loop(({ dt, time }) => {
            logger.print(Math.floor(1 / dt));
            camera.rayMap(render).to(canvas);
            // scene.debug({ camera, canvas });
            if (time % 10 < 0.5) scene.rebuild();
        })
        .play();
}
