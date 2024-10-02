/* eslint-disable no-undef */
async (canvas, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 640;
    const height = 480;
    canvas.resize(width, height);

    // scene
    const scene = new NaiveScene();
    const camera = new Camera().orbit(5, 0, 0);

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
        camera.orbit(sphereCoords =>
            sphereCoords.add(
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
        camera.orbit(sphereCoords => sphereCoords.add(Vec3(deltaY * 0.001, 0, 0)));
    });

    // scene
    const stanfordBunnyObj = await fetch("/assets/bunny.obj").then(x => x.text());
    let bunnyMesh = Mesh.readObj(stanfordBunnyObj, "bunny");
    const bunnyBox = bunnyMesh.getBoundingBox();
    const maxDiagInv = 2 / bunnyBox.diagonal.fold((e, x) => Math.max(e, x), Number.MIN_VALUE);
    bunnyMesh = bunnyMesh
        .mapVertices(v => v.sub(bunnyBox.center).scale(maxDiagInv))
        .mapVertices(v => Vec3(-v.y, v.x, v.z))
        .mapVertices(v => Vec3(v.z, v.y, -v.x))
        .mapColors(v =>
            Color.ofRGB(
                ...v.map(x => Math.max(0, Math.min(1, 0.5 * (x + 1)))).toArray()
            )
        );
    scene.addList(bunnyMesh.asSpheres(0.02));

    // boilerplate for fps
    loop(({ dt }) => {
        camera.reverseShot(scene).to(canvas).paint();
        logger.print(Math.floor(1 / dt));
    }).play();
}
