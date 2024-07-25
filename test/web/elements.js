/* eslint-disable no-undef */
async (canvas, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 640;
    const height = 480;
    canvas.resize(width, height);
    // scene
    const scene = new Scene()
    const camera = new Camera().orbit(5, 0, 0);
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
    scene
        .add(
            Sphere
                .builder()
                .position(Vec3(0, -1.5, 0))
                .name("point")
                .radius(0.1)
                .build()
            ,
            Line
                .builder()
                .positions(Vec3(0, 0, -1), Vec3(0, 0, 1))
                .name("line")
                .radius(0.1)
                .build()
            ,
            Triangle
                .builder()
                .positions(Vec3(0, 1, -1), Vec3(0, 2, -1), Vec3(0, 1.5, 1))
                .name("triangle")
                .build()
            ,
        )

    // boilerplate for fps
    Animation
        .loop(({ dt }) => {
            camera.normalShot(scene).to(canvas);
            logger.print(Math.floor(1 / dt));
        })
        .play();
}
