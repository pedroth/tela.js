/* eslint-disable no-undef */
async (canvas, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 240;
    const height = 160;
    canvas.resize(width, height);
    let exposedCanvas = canvas.exposure();
    // scene
    const scene = new KScene();
    const camera = new Camera({ lookAt: Vec3(1.5, 1.5, 1.0) }).orbit(3, 0, 0);
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
        exposedCanvas = canvas.exposure();

    })
    canvas.onMouseWheel(({ deltaY }) => {
        camera.orbit(coords => coords.add(Vec3(deltaY * 0.001, 0, 0)));
        exposedCanvas = canvas.exposure();
    })
    // cornell box
    scene.add(
        Triangle
            .builder()
            .name("bottom-1")
            .colors(Color.WHITE, Color.WHITE, Color.WHITE)
            .positions(Vec3(), Vec3(3, 0, 0), Vec3(3, 3, 0))
            .build(),
        Triangle
            .builder()
            .name("bottom-2")
            .colors(Color.WHITE, Color.WHITE, Color.WHITE)
            .positions(Vec3(3, 3, 0), Vec3(0, 3, 0), Vec3())
            .build(),
    )

    // some objects
    const obj = await fetch("/assets/teapot.obj").then(x => x.text());
    let mesh = Mesh.readObj(obj, "mesh");
    const meshBox = mesh.getBoundingBox();
    const maxDiagInv = 2 / meshBox.diagonal.fold((e, x) => Math.max(e, x), Number.MIN_VALUE);
    mesh = mesh
        .mapVertices(v => v.sub(meshBox.center).scale(maxDiagInv))
        .mapVertices(v => v.scale(1))
        .mapVertices(v => Vec3(-v.y, v.x, v.z))
        .mapVertices(v => Vec3(v.z, v.y, -v.x))
        .mapVertices(v => v.add(Vec3(1.5, 1.5, 1.0)))
        .mapColors(() => Color.WHITE)
        .mapMaterials(() => DiElectric(1.333))
    scene.addList(mesh.asTriangles());

    loop(async ({ dt }) => {
        const image = await camera
            .parallelShot(
                scene,
                {
                    bounces: 10,
                    gamma: 0.5,
                    isBiased: false,
                    skyBoxPath: "/assets/sky.jpg"
                })
            .to(exposedCanvas);
        image.paint();
        logger.print(`FPS: ${(1 / dt).toFixed(2)}`);
    }).play();
}
