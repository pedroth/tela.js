/* eslint-disable no-undef */
async (canvas, fps, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 640;
    const height = 480;
    canvas.resize(width, height);
    // scene
    const scene = new NaiveScene()
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
    // const spotObj = await fetch("/assets/spot.obj").then(x => x.text());
    const texture = await Canvas.ofUrl("/assets/spot.png");
    // const spotMesh = Mesh.readObj(spotObj)
    //     .addTexture(texture)
    //     .mapVertices(v => Vec3(-v.y, v.x, v.z))
    //     .mapVertices(v => Vec3(v.z, v.y, -v.x))
    //     .mapColors(v =>
    //         Color.ofRGB(...v.map(x => Math.max(0, Math.min(1, 0.5 * (x + 1)))).toArray())
    //     )
    // scene.addList(spotMesh.asTriangles("spot"));
    scene.add(
        Triangle
            .builder()
            .name("simple-lower")
            .positions(
                Vec3(0, -1, -1),
                Vec3(0, 1, -1),
                Vec3(0, 1, 1)
            )
            .texCoords(
                Vec2(),
                Vec2(1, 0),
                Vec2(1, 1)
            )
            .colors(
                Color.BLACK,
                Color.BLACK,
                Color.BLACK
            )
            .texture(texture)
            .build(),
        Triangle
            .builder()
            .name("simple-lower")
            .positions(
                Vec3(0, 1, 1),
                Vec3(0, -1, 1),
                Vec3(0, -1, -1)
            )
            .texCoords(
                Vec2(1, 1),
                Vec2(0, 1),
                Vec2(),
            )
            .colors(
                Color.BLACK,
                Color.BLACK,
                Color.BLACK
            )
            .texture(texture)
            .build()
    )

    Animation
        .builder()
        .initialState({ it: 1, oldTime: new Date().getTime() })
        .nextState(({ it, oldTime }) => {
            camera.reverseShot(scene).to(canvas);
            const dt = (new Date().getTime() - oldTime) * 1e-3;
            logger.print(Math.floor(1 / dt));
            return {
                it: it + 1,
                oldTime: new Date().getTime()
            };
        })
        .while(() => true)
        .build()
        .play();
}
