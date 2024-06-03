/* eslint-disable no-undef */
async (canvas, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 640;
    const height = 480;
    canvas.resize(width, height);
    // scene
    const scene = new KScene()
    const camera = new Camera({ lookAt: Vec3(8496, 1431, 2429) }).orbit(3, 0, 0);
    // From https://www.models-resource.com/playstation/spyro2riptosrage/
    const texture = await Canvas.ofUrl("/assets/summer_forest.png");
    const earthObj = await fetch("/assets/summer_forest.obj").then(x => x.text());
    const earthMesh = Mesh.readObj(earthObj, "earth")
        .mapColors(() => Color.ofRGB(0.25, 0.25, 0.25))
        .addTexture(texture)
    scene.add(earthMesh);


    // mouse handling
    let mousedown = false;
    let mouse = Vec2();
    let camSpeed = Vec3();
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
        camera.orient(coords => coords.add(
            Vec2(
                -2 * Math.PI * (dx / canvas.width),
                -2 * Math.PI * (dy / canvas.height)
            )
        ));
        mouse = newMouse;
    })

    canvas.onKeyDown((e) => {
        const magnitude = 50;
        if (e.code === "KeyW") camSpeed = Vec3(0, 0, magnitude);
        if (e.code === "KeyS") camSpeed = Vec3(0, 0, -magnitude);
    })

    canvas.onKeyUp(() => {
        camSpeed = Vec3();
    })

    Animation
        .loop(({ dt }) => {
            camera.position = camera.position.add(camera.toWorldCoord(camSpeed).scale(dt));
            camera.reverseShot(
                scene,
                {
                    cullBackFaces: false,
                    bilinearTextures: false,
                    clipCameraPlane: true
                }
            )
                .to(canvas);
            logger.print(Math.floor(1 / dt));
        })
        .play();

    const audio = new Audio("/assets/summer_forest.mp3");
    audio.loop = true;
    audio.play();
}
