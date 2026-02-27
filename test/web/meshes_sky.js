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
        { mesh: "/assets/wipeout.obj", texture: "/assets/wipeout.png" },
        { mesh: "/assets/bunny_orig.obj", texture: undefined },
        { mesh: "/assets/rocker_arm.obj", texture: undefined },
        { mesh: "/assets/teapot.obj", texture: undefined },
        { mesh: "/assets/torus.obj", texture: undefined },
        { mesh: "/assets/moses_min.obj", texture: undefined },
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
        exposedCanvas = canvas.exposure();
        camera.orbit(coords => coords.add(Vec3(deltaY * 0.001, 0, 0)));
    })
    // cornell box
    const floorTriangles = [
        Triangle
            .builder()
            .name("bottom-1")
            .colors(Color.RED, Color.RED, Color.RED)
            .positions(Vec3(), Vec3(3, 0, 0), Vec3(3, 3, 0))
            .build(),
        Triangle
            .builder()
            .name("bottom-2")
            .colors(Color.RED, Color.RED, Color.RED)
            .positions(Vec3(3, 3, 0), Vec3(0, 3, 0), Vec3())
            .build(),
    ];
    scene.add(...floorTriangles);

    async function loadMesh(index) {
        const obj = await fetch(meshes[index].mesh).then(x => x.text());
        let mesh = Mesh.readObj(obj, "mesh");
        const meshBox = mesh.getBoundingBox();
        const maxDiagInv = 2 / meshBox.diagonal.fold((e, x) => Math.max(e, x), Number.MIN_VALUE);
        mesh = mesh
            .mapVertices(v => v.sub(meshBox.center).scale(maxDiagInv))
            .mapVertices(v => v.scale(1))
            .mapVertices(v => Vec3(-v.y, v.x, v.z))
            .mapVertices(v => Vec3(v.z, v.y, -v.x))
            .mapVertices(v => Vec3(-v.x, -v.y, v.z))
            .mapVertices(v => v.add(Vec3(1.5, 1.5, 1.0)))
            .mapColors(() => Color.WHITE)
        if (meshes[index].texture) {
            mesh = mesh.addTexture(await Canvas.ofUrl(meshes[index].texture));
        }
        scene.clear();
        scene.add(...floorTriangles);
        scene.addList(mesh.asTriangles());
    }

    await loadMesh(0);

    select.addEventListener("change", async () => {
        await loadMesh(Number(select.value));
    });

    function renderSkyBox(ray) {
        const dir = ray.dir;
        const skyColorHorizon = Color.ofRGB(0.5, 0.7, 1.0); // Light blue near horizon
        const skyColorZenith = Color.ofRGB(0.1, 0.2, 0.4);   // Darker blue overhead
        const skyBlendFactor = Math.pow(Math.max(0, dir.z), 0.5);
        const skyColor = skyColorHorizon.scale(1 - skyBlendFactor).add(skyColorZenith.scale(skyBlendFactor));
        const sunDirection = Vec3(0.7, 0.3, 0.5).normalize();
        const sunDot = dir.dot(sunDirection);
        const sunSharpness = 200.0; // Controls how sharp the sun disk is
        const sunGlow = Math.pow(Math.max(0, sunDot), sunSharpness);
        const atmosphereGlow = Math.pow(Math.max(0, sunDot), 5.0); // Softer power for wider glow
        const sunColor = Color.ofRGB(1.0, 0.8, 0.5); // Warm yellow/orange
        const sunEffect = sunColor.scale(sunGlow * 2.0).add(sunColor.scale(atmosphereGlow * 0.5));
        return skyColor.add(sunEffect);
    }

    const lightDir = Vec3(0.7, 0.3, 0.5).normalize();
    loop(async ({ dt }) => {
        const image = await camera
            .parallelShot(
                scene,
                {
                    bounces: 10,
                    gamma: 0.5,
                    isBiased: false,
                    renderSkyBox,
                    lightDir,
                    lightSharpness: 200,
                })
            .to(exposedCanvas);
        image.paint();
        logger.print(`FPS: ${(1 / dt).toFixed(2)}`);
    }).play();
}
