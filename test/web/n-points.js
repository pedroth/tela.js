/* eslint-disable no-undef */
async (canvas, fps, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 640 / 2;
    const height = 480 / 2;
    canvas.resize(width, height);
    // scene
    const scene = new KScene()
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
    // scene
    const n = 5;
    const grid = [...Array(n * n)]
        .map((_, k) => {
            const i = Math.floor(k / n);
            const j = k % n;
            const x = j;
            const y = i;
            const initial = Vec3(0, x / n, y / n);
            return Point
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
        .builder()
        .initialState({ it: 1, oldTime: new Date().getTime() })
        .nextState(({ it, oldTime }) => {
            camera.sceneShot(scene).to(canvas);
            const dt = (new Date().getTime() - oldTime) * 1e-3;
            logger.print(Math.floor(1 / dt));
            return {
                it: it + 1,
                oldTime: new Date().getTime()
            };
        })
        .while(() => true)
        .build()
        .play();
}