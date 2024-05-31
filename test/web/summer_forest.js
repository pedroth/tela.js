/* eslint-disable no-undef */
async (canvas, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 640;
    const height = 480;
    canvas.resize(width, height);
    // scene
    const scene = new KScene()
    const camera = new Camera();
    camera.look()
    .at(Vec3(8496,1431, 2429))
    .from(Vec3())
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
        camera.orbit(coords => coords.add(
            Vec3(
                0,
                -2 * Math.PI * (dx / canvas.width),
                -2 * Math.PI * (dy / canvas.height)
            )
        ));
        mouse = newMouse;
    })

    canvas.onKeyDown((e) => {
        const magnitude = 1;
        if (e.code === "KeyW") camSpeed.add(Vec3(0, 0, magnitude));
        if (e.code === "KeyS") camSpeed.add(Vec3(0, 0, -magnitude));
    })

    // scene
    
    Animation
        .loop(({ dt }) => {
            camera.position = camera.position.add(camera.toWorldCoord(camSpeed).scale(dt));
            camera.reverseShot(
                scene,
                {
                    cullBackFaces: true,
                    bilinearTextures: false,
                    clipCameraPlane: true
                }
            )
                .to(canvas);
            logger.print(Math.floor(1 / dt));
        })
        .play();
}
