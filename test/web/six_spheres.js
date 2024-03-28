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
    scene
        .add(
            Point
                .builder()
                .position(Vec3(0, -1, 0))
                .name("test6-1")
                .radius(0.1)
                .build()
            ,
            Point
                .builder()
                .position(Vec3(0, 1, 0))
                .name("test6-2")
                .radius(0.1)
                .build()
            ,
            Point
                .builder()
                .position(Vec3(0, 0, -1))
                .name("test6-3")
                .radius(0.1)
                .build()
            ,
            Point
                .builder()
                .position(Vec3(0, 0, 1))
                .name("test6-4")
                .radius(0.1)
                .build()
            ,
            Point
                .builder()
                .position(Vec3(-1, 0, 0))
                .name("test6-5")
                .radius(0.1)
                .build()
            ,
            Point
                .builder()
                .position(Vec3(1, 0, 0))
                .name("test6-6")
                .radius(0.1)
                .build()
        )

    // boilerplate for fps
    Animation
        .builder()
        .initialState({ it: 1, oldTime: new Date().getTime() })
        .nextState(({ it, oldTime }) => {
            camera.normalShot(scene).to(canvas);
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
