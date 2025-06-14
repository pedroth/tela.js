/* eslint-disable no-undef */
async (canvas, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 640 / 3;
    const height = 480 / 3;
    canvas.resize(width, height);

    // scene
    const scene = new KScene();
    const camera = new Camera();
    const obj = await fetch("/assets/bunny.obj").then((x) => x.text());
    let mesh = Mesh.readObj(obj, "mesh");
    const box = mesh.getBoundingBox();
    const scaleInv = 2 / box.diagonal.fold((e, x) => Math.max(e, x), Number.MIN_VALUE);
    mesh = mesh
        .mapVertices((v) => v.sub(box.center).scale(scaleInv))
        .mapVertices((v) => Vec3(-v.y, v.x, v.z))
        .mapVertices((v) => Vec3(v.z, v.y, -v.x))
    scene.addList(mesh.asSpheres(0.05));
    scene.rebuild();

    function torusSdf(r, R) {
        return p => {
            const q = Vec2(p.x, p.y).length() - r;
            return Vec2(q, p.z).length() - R;
        }
    }

    function smin(a, b, k = 32) {
        const res = Math.exp(-k * a) + Math.exp(-k * b);
        return -Math.log(res) / k;
    }

    function normalFunction(F, p) {
        const epsilon = 1e-3;
        const f = F(p);
        const n = Vec3(
            F(p.add(Vec3(epsilon, 0, 0))) - f,
            F(p.add(Vec3(0, epsilon, 0))) - f,
            F(p.add(Vec3(0, 0, epsilon))) - f,
        );
        return n.normalize();
    }

    const rayScene = (ray, { scene, time }) => {
        const maxIte = 100;
        const maxDist = 10;
        const epsilon = 1e-3;
        const { init } = ray;
        let p = init;
        let t = 0;
        const torusDist = torusSdf(0.75, 0.25);
        for (let i = 0; i < maxIte; i++) {
            p = ray.trace(t);
            const tau = ((Math.sin(2 * Math.PI * 0.25 * (time - 1)) + 1) / 2);
            const torusD = torusDist(p);
            const sceneDist = scene.distanceOnRay(Ray(p, ray.dir), smin);
            const d = tau * torusD + (1 - tau) * sceneDist;
            t += d;
            if (d < epsilon) {
                const normal = normalFunction(torusDist, p).scale(tau).add(scene.normalToPoint(p).scale(1 - tau)).normalize();
                return Color.ofRGB(...normal.map(x => (x + 1) / 2).toArray());
            }
            if (d > maxDist) return Color.ofRGB(0, 0, 10 * (i / maxIte));
        }
        return Color.BLACK;
    };


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
        camera.orbit((coords) =>
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
        camera.orbit((coords) => coords.add(Vec3(deltaY * 0.001, 0, 0)));
    });

    loop(async ({ dt, time }) => {
        (await camera.rayMapParallel(rayScene, [smin, torusSdf, normalFunction]).to(canvas, { scene, time })).paint();
        logger.print(`FPS: ${Math.floor(1 / dt)}`);
    }).play();
}


