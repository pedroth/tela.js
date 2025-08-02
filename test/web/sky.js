/* eslint-disable no-undef */
async (canvas, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 240;
    const height = 160;
    canvas.resize(width, height);
    let exposedCanvas = canvas.exposure();
    // scene
    const scene = new NaiveScene();
    const camera = new Camera({ lookAt: Vec3(1.5, 1.5, 1.5) }).orbit(3, 0, 0);
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
    scene.add(
        Sphere
            .builder()
            .radius(0.25)
            .name("sphere")
            .color(Color.ofRGB(1, 0, 1))
            .material(Metallic(0.25))
            .position(Vec3(1.5, 0.5, 1.5))
            .build(),
        Sphere
            .builder()
            .radius(0.25)
            .name("metal-sphere")
            .color(Color.WHITE)
            .material(Metallic())
            .position(Vec3(1.5, 2.5, 1.5))
            .build(),
        Sphere
            .builder()
            .radius(0.5)
            .name("glass-sphere")
            .color(Color.ofRGB(1, 1, 1))
            .material(DiElectric(1.3))
            .position(Vec3(1.0, 1.5, 1.0))
            .build(),
        Triangle
            .builder()
            .name("alpha-tri")
            .colors(Color.ofRGB(1, 1, 0), Color.ofRGB(1, 1, 0), Color.ofRGB(1, 1, 0))
            .material(Metallic())
            .positions(Vec3(1, 0, 0), Vec3(0, 1, 0), Vec3(0, 0, 1))
            .build(),
        Triangle
            .builder()
            .name("alpha-tri-2")
            .colors(Color.ofRGB(1, 1, 1), Color.ofRGB(1, 1, 1), Color.ofRGB(1, 1, 1))
            .material(DiElectric(2))
            .positions(Vec3(3, 1, 1), Vec3(3, 2, 1), Vec3(3, 1.5, 2))
            .build(),
        Sphere
            .builder()
            .radius(0.25)
            .name("alpha-sphere")
            .color(Color.ofRGB(0, 1, 1))
            .position(Vec3(3, 1.5, 2))
            .material(Alpha(0.25))
            .build()
    )

    // Image from https://steamcommunity.com/sharedfiles/filedetails/?id=3009862235
    const sky = await Canvas.ofUrl("/assets/sky.jpg")
    function renderSkyBox(ray) {
        return renderBackground(ray, sky);
    }

    // boilerplate for fps
    loop(({ dt }) => {
        camera.sceneShot(scene, { isBiased: false, renderSkyBox }).to(exposedCanvas).paint();
        logger.print(`FPS: ${(1 / dt).toFixed(2)}`);
    }).play();
}
