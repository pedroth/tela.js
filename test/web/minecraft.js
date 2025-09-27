/* eslint-disable no-undef */
async (canvas, logger) => {
    const div = document.createElement("div");
    div.innerHTML = `
        <p>AWSD to move the camera</p>
    `;
    document.body.appendChild(div);

    // resize incoming canvas:Canvas object.
    const width = 640 / 2;
    const height = 480 / 2;
    canvas.resize(width, height);

    // scene
    const scene = new KScene();
    const camera = new Camera().orbit(3, 0, 0);
    camera.position = Vec3(0, 0, 10);

    // https://sketchfab.com/3d-models/minecraft-3d-map-obj-texture-bdcee18af83e49ac89a31063029ff85e
    const texture = await Canvas.ofUrl("/assets/minecraft.png");
    const minecraftObj = await fetch("/assets/minecraft.obj").then(x => x.text());
    const minecraftMesh = Mesh.readObj(minecraftObj, "minecraft")
        .mapColors(() => Color.ofRGB(0.25, 0.25, 0.25))
        .mapVertices(v => Vec3(v.x, -v.z, v.y))
        .addTexture(texture);
    scene.add(minecraftMesh);

    // mouse handling
    let mousedown = false;
    let mouse = Vec2();
    let camSpeed = Vec3();

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
        camera.orient(coords =>
            coords.add(
                Vec2(
                    -2 * Math.PI * (dx / canvas.width),
                    -2 * Math.PI * (dy / canvas.height)
                )
            )
        );
        mouse = newMouse;
    });

    canvas.onKeyDown((e) => {
        const magnitude = 10;
        if (e.code === "KeyW") camSpeed = Vec3(0, 0, magnitude);
        if (e.code === "KeyS") camSpeed = Vec3(0, 0, -magnitude);
    });

    canvas.onKeyUp(() => {
        camSpeed = Vec3();
    });

    loop(({ dt }) => {
        camera.position = camera.position.add(camera.toWorldCoord(camSpeed).scale(dt));
        camera
            .reverseShot(scene, {
                cullBackFaces: true,
                bilinearTextures: false,
                clipCameraPlane: true,
            })
            .to(canvas)
            .paint();
        logger.print(`FPS: ${(1 / dt).toFixed(2)}`);
    }).play();
}
