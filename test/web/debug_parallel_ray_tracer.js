
/* eslint-disable no-undef */
async (canvas, logger) => {
    const meshes = [
        { mesh: "/assets/spot.obj", texture: "/assets/spot.png" },
        { mesh: "/assets/megaman.obj", texture: "/assets/megaman.png" },
        { mesh: "/assets/spyro.obj", texture: "/assets/spyro.png" },
        { mesh: "/assets/earth.obj", texture: "/assets/earth.jpg" },
        { mesh: "/assets/blub.obj", texture: "/assets/blub.png" },
        { mesh: "/assets/bob.obj", texture: "/assets/bob.png" },
        { mesh: "/assets/oil.obj", texture: "/assets/oil.png" },
        { mesh: "/assets/riku.obj", texture: "/assets/riku.png" },
        { mesh: "/assets/bunny_orig.obj", texture: undefined },
        { mesh: "/assets/rocker_arm.obj", texture: undefined },
        { mesh: "/assets/teapot.obj", texture: undefined },
        { mesh: "/assets/torus.obj", texture: undefined },
        { mesh: "/assets/dragonHD.obj", texture: undefined },
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
    select.value = 0;
    label.appendChild(select);
    div.appendChild(label);
    document.body.appendChild(div);

    const width = 640 / 2;
    const height = 480 / 2;
    canvas.resize(width, height);
    let exposedCanvas = canvas.exposure();
    // scene
    const scene = new KScene();
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
    const cornellBoxTriangles = [
        Triangle
            .builder()
            .name("left-1")
            .colors(Color.RED, Color.RED, Color.RED)
            .positions(Vec3(3, 0, 3), Vec3(3, 0, 0), Vec3())
            .build(),
        Triangle
            .builder()
            .name("left-2")
            .colors(Color.RED, Color.RED, Color.RED)
            .positions(Vec3(), Vec3(0, 0, 3), Vec3(3, 0, 3))
            .build(),
        Triangle
            .builder()
            .name("right-1")
            .colors(Color.GREEN, Color.GREEN, Color.GREEN)
            .positions(Vec3(0, 3, 0), Vec3(3, 3, 0), Vec3(3, 3, 3))
            .build(),
        Triangle
            .builder()
            .name("right-2")
            .colors(Color.GREEN, Color.GREEN, Color.GREEN)
            .positions(Vec3(3, 3, 3), Vec3(0, 3, 3), Vec3(0, 3, 0))
            .build(),
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
        Triangle
            .builder()
            .name("top-1")
            .colors(Color.WHITE, Color.WHITE, Color.WHITE)
            .positions(Vec3(3, 3, 3), Vec3(3, 0, 3), Vec3(0, 0, 3))
            .build(),
        Triangle
            .builder()
            .name("top-2")
            .colors(Color.WHITE, Color.WHITE, Color.WHITE)
            .positions(Vec3(0, 0, 3), Vec3(0, 3, 3), Vec3(3, 3, 3))
            .build(),
        Triangle
            .builder()
            .name("back-1")
            .colors(Color.WHITE, Color.WHITE, Color.WHITE)
            .positions(Vec3(), Vec3(0, 3, 0), Vec3(0, 3, 3))
            .build(),
        Triangle
            .builder()
            .name("back-2")
            .colors(Color.WHITE, Color.WHITE, Color.WHITE)
            .positions(Vec3(0, 3, 3), Vec3(0, 0, 3), Vec3())
            .build(),
        Triangle
            .builder()
            .name("light-1")
            .colors(Color.WHITE, Color.WHITE, Color.WHITE)
            .positions(Vec3(1, 1, 2.9), Vec3(2, 1, 2.9), Vec3(2, 2, 2.9))
            .emissive(true)
            .build(),
        Triangle
            .builder()
            .name("light-2")
            .colors(Color.WHITE, Color.WHITE, Color.WHITE)
            .positions(Vec3(2, 2, 2.9), Vec3(1, 2, 2.9), Vec3(1, 1, 2.9))
            .emissive(true)
            .build(),
    ];
    scene.add(...cornellBoxTriangles);

    async function loadMesh(index) {
        const obj = await fetch(meshes[index].mesh).then(x => x.text());
        let mesh = Mesh.readObj(obj, "mesh");
        const meshBox = mesh.getBoundingBox();
        const maxDiagInv = 2 / meshBox.diagonal.fold((e, x) => Math.max(e, x), Number.MIN_VALUE);
        mesh = mesh
            .mapVertices(v => v.sub(meshBox.center).scale(maxDiagInv))
            .mapVertices(v => v.scale(1))
            .mapVertices(v => Vec3(-v.z, -v.x, v.y))
            .mapVertices(v => v.add(Vec3(1.5, 1.5, 1.0)))
            .mapColors(() => Color.WHITE)
            .mapMaterials(() => Metallic(1.33333))
        if (meshes[index].texture) {
            mesh = mesh.addTexture(await Canvas.ofUrl(meshes[index].texture));
        }
        scene.clear();
        scene.add(...cornellBoxTriangles);
        scene.addList(mesh.asTriangles());
    }

    await loadMesh(0);

    select.addEventListener("change", async () => {
        exposedCanvas = canvas.exposure();
        await loadMesh(Number(select.value));
    });

    // boilerplate for fps
    const lightDir = Vec3(1, 0, 1).normalize();
    const lightSharpness = 200;
    loop(async ({ dt }) => {
        (await
            camera.parallelShot(
                scene,
                {
                    isBiased: false,
                    useCache: true, 
                    useMetro: true,
                    skyBoxPath: "/assets/sky.jpg",
                    lightDir,
                    lightSharpness
                }
            ).to(exposedCanvas)
        ).paint();
        logger.print(`PRay, FPS: ${(1 / dt).toFixed(2)}`);
    }).play();
}
