/* eslint-disable no-undef */
async (canvas, logger) => {
    const meshes = [
        { mesh: "/assets/spot.obj", texture: "/assets/spot.png" },
        { mesh: "/assets/megaman.obj", texture: "/assets/megaman.png" },
        { mesh: "/assets/spyro.obj", texture: "/assets/spyro.png" },
        { mesh: "/assets/earth.obj", texture: "/assets/earth.jpg" },
        { mesh: "/assets/blub.obj", texture: "/assets/blub.png" },
        { mesh: "/assets/bob.obj", texture: "/assets/bob.png" },
        { mesh: "/assets/dragon.obj", texture: "/assets/dragon.jpg" },
        { mesh: "/assets/ogre.obj", texture: "/assets/ogre.png" },
        { mesh: "/assets/oil.obj", texture: "/assets/oil.png" },
        { mesh: "/assets/riku.obj", texture: "/assets/riku.png" },
        { mesh: "/assets/wipeout.obj", texture: "/assets/wipeout.png" },
        { mesh: "/assets/statue.obj", texture: "/assets/statue.jpg" },
        { mesh: "/assets/dog.obj", texture: "/assets/dog.jpg" },
        { mesh: "/assets/burger.obj", texture: "/assets/burger.jpg" }, // slow
        { mesh: "/assets/JesusMary.obj", texture: "/assets/JesusMary.jpg" }, // slow
    ];

    // DOM: mesh selector
    const div = document.createElement("div");
    div.style.cssText = "padding: 8px;";
    const label = document.createElement("label");
    label.textContent = "Mesh: ";
    const select = document.createElement("select");
    meshes.forEach((m, i) => {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = m.mesh.split("/").pop();
        select.appendChild(option);
    });
    label.appendChild(select);
    div.appendChild(label);
    document.body.appendChild(div);

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

    async function loadMesh(index) {
        const obj = await fetch(meshes[index].mesh).then(x => x.text());
        const textureImage = await Canvas.ofUrl(meshes[index].texture);
        let mesh = Mesh.readObj(obj, "mesh");
        const meshBox = mesh.getBoundingBox();
        const maxDiagInv = 2 / meshBox.diagonal.fold((e, x) => Math.max(e, x), Number.MIN_VALUE);
        mesh = mesh
            .addTexture(textureImage)
            .mapVertices(v => v.sub(meshBox.center).scale(maxDiagInv))
            .mapVertices(v => Vec3(-v.y, v.x, v.z))
            .mapVertices(v => Vec3(v.z, v.y, -v.x))
            .mapColors(() => Color.ofRGB(0.25, 0.25, 0.25));

        scene.clear();
        scene.addList(mesh.asTriangles());
    }

    await loadMesh(0);

    select.addEventListener("change", async () => {
        await loadMesh(Number(select.value));
    });

    // boilerplate for fps
    loop(({ dt }) => {
        camera.reverseShot(scene).to(canvas).paint();
        logger.print(Math.floor(1 / dt));
    }).play();
}
