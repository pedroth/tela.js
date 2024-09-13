/* eslint-disable no-undef */
async (canvas, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 640 / 3;
    const height = 480 / 3;
    canvas.resize(width, height);
    // scene
    const scene = new KScene();
    const camera = new Camera();
    const obj = await fetch("/assets/bunny.obj").then(x => x.text());
    let mesh = Mesh.readObj(obj, "mesh");
    mesh = mesh
        .mapVertices(v => Vec3(-v.y, v.x, v.z))
        .mapVertices(v => Vec3(v.z, v.y, -v.x))
    scene.addList(mesh.asSpheres(0.05));
    scene.rebuild();

    const rayScene = (ray, {scene}) => {
        const maxIte = 100;
        const maxDist = 10;
        const epsilon = 1e-3;
        const { init } = ray;
        let p = init;
        let t = scene.distanceOnRay(ray);
        for (let i = 0; i < maxIte; i++) {
            p = ray.trace(t);
            const d = scene.distanceOnRay(Ray(p, ray.dir));
            t += d;
            if (d < epsilon) {
                const normal = scene.normalToPoint(p).map(x => (x + 1) / 2);
                return Color.ofRGB(normal.x, normal.y, normal.z);
            }
            if (d > maxDist) return Color.ofRGB(0, 0, 10 * (i / maxIte));
        }
        return Color.BLACK;
    }


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

    loop(async ({ dt }) => {
        await camera.rayMapParallel(rayScene).to(canvas, {scene});
        logger.print(`FPS: ${Math.floor(1 / dt)}`);
    }).play();
}
