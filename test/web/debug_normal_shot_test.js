/* eslint-disable no-undef */
async (canvas) => {
    // resize incoming canvas:Canvas object.
    const width = 640;
    const height = 480;
    canvas.resize(width, height);
    // scene
    const scene = new BScene()
    const camera = new Camera({ sphericalCoords: Vec3(5, 0, 0) });
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
    const obj = await fetch("/assets/spot.obj").then(x => x.text());
    let mesh = Mesh.readObj(obj, "spot");
    mesh = mesh
        .mapVertices(v => Vec3(-v.y, v.x, v.z))
        .mapVertices(v => Vec3(v.z, v.y, -v.x))
        .mapColors(v =>
            Color.ofRGB(...v.map(x => Math.max(0, Math.min(1, 0.5 * (x + 1)))).toArray())
        )
    scene.addList(mesh.asPoints(0.05));
    scene.rebuild();

    // boilerplate for fps
    const play = (options = {}) => {
        const { oldT = new Date().getTime(), time = 0 } = options;
        const newT = new Date().getTime();
        const dt = (newT - oldT) * 1e-3;
        camera.normalShot(scene).to(canvas);
        // testDistance();
        logger.print(`FPS: ${(Math.floor(1 / dt))}`);
        requestAnimationFrame(() => play({ oldT: newT, time: time + dt }))
    }
    play();
}
