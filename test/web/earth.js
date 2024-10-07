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

    // scene
    // From https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73751/world.topo.bathy.200407.3x5400x2700.jpg
    const texture = await Canvas.ofUrl("/assets/earth.jpg");
    const earthObj = await fetch("/assets/earth.obj").then(x => x.text());
    const earthMesh = Mesh.readObj(earthObj, "earth")
        .mapColors(() => Color.ofRGB(0.25, 0.25, 0.25))
        .addTexture(texture);

    scene.addList(earthMesh.asTriangles());

    loop(({ dt }) => {
        camera.reverseShot(
            scene,
            {
                cullBackFaces: true,
                bilinearTextures: false,
                clipCameraPlane: false
            }
        ).to(canvas).paint();
        logger.print(Math.floor(1 / dt));
    }).play();
}
