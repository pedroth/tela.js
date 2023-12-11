async (canvas, fps, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 640;
    const height = 480;
    canvas.resize(width, height);
    // scene
    const scene = new Scene()
    const camera = new Camera();
    // mouse handling
    let mousedown = false;
    let mouse = Vec2();
    canvas.onMouseDown(() => {
        mousedown = true;
    })
    canvas.onMouseUp(() => {
        mousedown = false;
    })
    canvas.onMouseMove((x, y) => {
        const newMouse = Vec2(x, y);
        if (!mousedown || newMouse.equals(mouse)) {
            return;
        }
        const [dx, dy] = newMouse.sub(mouse).toArray();
        camera.param = camera.param.add(
            Vec3(
                0,
                -2 * Math.PI * (dx / canvas.width),
                2 * Math.PI * (dy / canvas.height)
            )
        );
        mouse = newMouse;
        camera.orbit();
        camera.sceneShot(scene).to(canvas);
    })
    canvas.onMouseWheel(({ deltaY }) => {
        camera.param = camera.param.add(Vec3(deltaY * 0.001, 0, 0));
        camera.orbit();
        camera.sceneShot(scene).to(canvas);
    })
    // scene
    const stanfordBunnyObj = await fetch("/assets/bunny.obj").then(x => x.text());
    scene.addObj(stanfordBunnyObj);
    camera.sceneShot(scene).to(canvas);

    // boilerplate for fps
    Animation
        .builder()
        .initialState({ it: 1, oldTime: new Date().getTime() })
        .nextState(({ it, oldTime }) => {
            const dt = (new Date().getTime() - oldTime) * 1e-3;
            fps(dt, it)
            return {
                it: it + 1,
                oldTime: new Date().getTime()
            };
        })
        .while(() => true)
        .build()
        .play();
}
