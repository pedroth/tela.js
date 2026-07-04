/* eslint-disable no-undef */
async (canvas) => {
    const svgFiles = ["cross.svg", "euler.svg", "stokes.svg", "expand.svg", "share.svg", "x.svg"];

    // DOM: svg selector
    const div = document.createElement("div");
    div.style.cssText = "padding: 8px;";
    const label = document.createElement("label");
    label.textContent = "SVG: ";
    const select = document.createElement("select");
    svgFiles.forEach((name, i) => {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = name;
        select.appendChild(option);
    });
    select.value = 1;
    label.appendChild(select);
    div.appendChild(label);
    document.body.appendChild(div);

    // resize incoming canvas:Canvas object.
    const width = 640;
    const height = 480;
    canvas.resize(width, height);

    // scene
    const scene = new NaiveScene();
    let size = Vec2(width, height);
    let box = new Box(new Vec2(), new Vec2(1, 1));
    const camera = new Camera2D(box);

    // mouse handling
    let mouse = Vec2();
    let mousedown = false;
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
        const v = Vec2(dx, dy).scale(-1).div(size).mul(box.diagonal);
        box = box.move(v);
        mouse = newMouse;
        camera.box = box;
    })
    canvas.onMouseWheel(({ deltaY }) => {
        const scale = Math.sign(deltaY) * 1e-1;
        box = box.scale(1 + scale);
        camera.box = box;
    })

    async function loadSVG(index) {
        scene.clear();
        const svg = parseSVG(await fetch(`/assets/${svgFiles[index]}`).then((x) => x.text()));
        const paths = svg.normalize().paths.flatMap((p) => p);

        const lines = [];
        for (let i = 0; i < paths.length; i++) {
            const path = paths[i];
            for (let j = 0; j < path.length - 1; j++) {
                const k = (j + 1) % path.length;
                lines.push(
                    Line
                        .builder()
                        .name(`line-${i}-${j}`)
                        .radius(0)
                        .positions(path[j], path[k])
                        .colors(Color.ORANGE, Color.RED)
                        .build()
                );
            }
        }
        scene.addList(lines);

        function triangle(ps, c) {
            return Triangle.builder().positions(...ps).radius(0).colors(c, c, c).build();
        }
        const triangles = triangulate(paths);
        triangles.forEach(tri => {
            // scene.add(triangle(tri, Color.GREEN));
            scene.add(triangle(tri, Color.random()));
        })
    }

    // play
    loop(({ dt }) => {
        canvas.fill(Color.BLACK)
        camera
            .raster(scene)
            .to(canvas)
            .paint();
        // set title of tab with fps
        logger.print(`Tela svg, FPS: ${(1 / dt).toFixed(2)}`);
    }).play();

    await loadSVG(Number(select.value));

    select.addEventListener("change", async () => {
        await loadSVG(Number(select.value));
    });
}