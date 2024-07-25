/* eslint-disable no-undef */
async (canvas, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 640;
    const height = 480;
    canvas.resize(width, height);
    // scene
    const scene = new NaiveScene()
    const camera = new Camera();
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
    const n = 5;
    const grid = [...Array(n * n)]
        .map((_, k) => {
            const i = Math.floor(k / n);
            const j = k % n;
            const x = j;
            const y = i;
            const initial = Vec3(0, x / n, y / n);
            return Sphere
                .builder()
                .name(`pxl_${k}`)
                .radius(1e-1)
                .position(initial.add(Vec.RANDOM(3)).map(x => 2 * x - 1))
                .color(Color.GRAY)
                .build()
        });
    scene.addList(grid);

    // boilerplate for fps
    Animation
        .loop(({ dt }) => {
            logger.print(Math.floor(1 / dt));
            camera.normalShot(scene).to(canvas);
        })
        .play();
}
