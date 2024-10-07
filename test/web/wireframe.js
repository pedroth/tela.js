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
    const obj = await fetch("/assets/spot.obj").then(x => x.text());
    // const obj = await fetch("/assets/megaman.obj").then(x => x.text());
    // const obj = await fetch("/assets/spyro.obj").then(x => x.text());
    const textureImage = await Canvas.ofUrl("/assets/spot.png");
    // const textureImage = await Canvas.ofUrl("/assets/megaman.png");
    // const textureImage = await Canvas.ofUrl("/assets/spyro.png");
    let mesh = Mesh.readObj(obj, "mesh");
    const meshBox = mesh.getBoundingBox();
    const maxDiagInv = 2 / meshBox.diagonal.fold((e, x) => Math.max(e, x), Number.MIN_VALUE);
    mesh = mesh
        .addTexture(textureImage)
        .mapVertices(v => v.sub(meshBox.center).scale(maxDiagInv))
        .mapVertices(v => Vec3(-v.y, v.x, v.z))
        .mapVertices(v => Vec3(v.z, v.y, -v.x))
        .mapColors(() => Color.ofRGB(0.25, 0.25, 0.25));

    scene.addList(mesh.asTriangles());
    scene.addList(
        mesh
            .mapVertices(v => v.scale(1.03))
            .mapColors(() => Color.ofRGB(0, 0.5, 0.7))
            .setName("lines")
            .asLines()
    );

    // boilerplate for fps
    loop(({ dt }) => {
        camera.reverseShot(scene).to(canvas).paint();
        logger.print(Math.floor(1 / dt));
    }).play();
}
