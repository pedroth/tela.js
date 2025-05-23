/* eslint-disable no-undef */
async (canvas, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 640;
    const height = 480;
    canvas.resize(width, height);
    // scene
    const scene = new NaiveScene();
    const camera = new Camera({ lookAt: Vec3(0.5, 0.5, 0.5) }).orbit(5, 0, 0);
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
        camera.orbit(coords => coords.add(
            Vec3(
                0,
                -2 * Math.PI * (dx / canvas.width),
                -2 * Math.PI * (dy / canvas.height)
            )
        ));
        mouse = newMouse;
    })
    canvas.onMouseWheel(({ deltaY }) => {
        camera.orbit(coords => coords.add(Vec3(deltaY * 0.001, 0, 0)));
    })
    // scene
    const img = await Canvas.ofUrl("/assets/kakashi.jpg");
    const grid = [...Array(img.width * img.height)]
        .map((_, k) => {
            const i = Math.floor(k / img.width);
            const j = k % img.width;
            const x = j;
            const y = i;
            const initial = Vec3(0, x / img.width, y / img.height);
            return {
                init: initial,
                point: Sphere
                    .builder()
                    .name(`pxl_${k}`)
                    .radius(1e-5)
                    .position(initial)
                    .color(img.getPxl(x, y))
                    .build()
            }
        });
    scene.addList(grid.map(({ point }) => point));

    const duration = 2;
    const animation = Anima.list(
        Anima.behavior(t => {
            grid.forEach(({ init, point }) => {
                const speed = init.sub(point.position);
                point.position = point.position.add(speed.scale(t));
            })
        }, duration),
        Anima.wait(duration),
        Anima.behavior(t => {
            grid.forEach(({ point }) => {
                const colorVec3 = Vec3(...point.color.toArray());
                const speed = colorVec3.sub(point.position);
                point.position = point.position.add(speed.scale(t));
            })
        }, duration),
        Anima.wait(duration)
    )

    // boilerplate for fps
    loop(({ time, dt }) => {
        camera.reverseShot(scene).to(canvas).paint();
        animation.loop(time, dt);
        logger.print(`FPS: ${(1 / dt).toFixed(2)}`);
    }).play();
}
