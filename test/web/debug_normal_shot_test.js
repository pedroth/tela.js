/* eslint-disable no-undef */
async (canvas) => {
    // resize incoming canvas:Canvas object.
    const width = 640;
    const height = 480;
    canvas.resize(width, height);
    // scene
    const scene = new KScene()
    const camera = new Camera().orbit(5,0,0);
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
    })
    canvas.onMouseWheel(({ deltaY }) => {
        camera.orbit(coords => coords.add(Vec3(deltaY * 0.001, 0, 0)));
    })
    // scene
    const obj = await fetch("/assets/spot.obj").then(x => x.text());
    let mesh = Mesh.readObj(obj, "spot");
    mesh = mesh
        .mapVertices(v => Vec3(-v.y, v.x, v.z))
        .mapVertices(v => Vec3(v.z, v.y, -v.x))
        .mapColors(v =>
            Color.ofRGB(...v.map(x => Math.max(0, Math.min(1, 0.5 * (x + 1)))).toArray())
        )
    scene.addList(mesh.asSpheres(0.05));
    scene.rebuild();

    const render = (ray, {scene}) => {
        const hit = scene.interceptWithRay(ray);
        if (hit) {
            const [, point, element] = hit;
            const normal = element.normalToPoint(point);
            return Color.ofRGB(
                (normal.get(0) + 1) / 2,
                (normal.get(1) + 1) / 2,
                (normal.get(2) + 1) / 2
            )
        }
        return Color.BLACK;
    }

    loop(async ({ dt }) => {
        (await camera.rayMapParallel(render).to(canvas, {scene})).paint(); // parallel
        // camera.normalShot(scene).to(canvas); // single core
        logger.print(`UD, FPS: ${(1 / dt).toFixed(2)}`);
    }).play()
}

