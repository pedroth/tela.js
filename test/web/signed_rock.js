/* eslint-disable no-undef */
async (canvas, logger) => {
    // Inspired by https://youtu.be/6Qb6QtC6QMs?si=DRkw9tmLYMkKEzmE
    // resize incoming canvas:Canvas object.
    const width = 640 / 3;
    const height = 480 / 3;

    canvas.resize(width, height);

    // scene
    const camera = new Camera().orbit(10, 0, 0);
    const light = { pos: Vec3(100, 0, 0) };

    function hash(p) {
        const np = p.map(x => x + 1000);
        return frac(123 * Math.sin(np.x * 21.6) * Math.sin(np.y * 43.4) * Math.sin(np.z * 14.7));
    }

    function cnoise(p) {
        const ip = p.map(Math.floor);
        const fp = frac(p);
        const u = fp.map(x => x * x * (3 - 2 * x));
        const a = hash(ip);
        const b = hash(ip.add(Vec3(1, 0, 0)));
        const c = hash(ip.add(Vec3(0, 1, 0)));
        const d = hash(ip.add(Vec3(1, 1, 0)));
        const e = hash(ip.add(Vec3(0, 0, 1)));
        const f = hash(ip.add(Vec3(1, 0, 1)));
        const g = hash(ip.add(Vec3(0, 1, 1)));
        const h = hash(ip.add(Vec3(1, 1, 1)));
        const x1 = mix(a, b, u.x);
        const x2 = mix(c, d, u.x);
        const y1 = mix(x1, x2, u.y);
        const x3 = mix(e, f, u.x);
        const x4 = mix(g, h, u.x);
        const y2 = mix(x3, x4, u.y);
        return mix(y1, y2, u.z);
    }

    function mix(x, y, t) {
        return x * (1 - t) + y * t;
    }

    function fbm(p) {
        let a = 0.5;
        let f = 0;
        let pi = p.clone();
        for (let i = 0; i < 4; i++) {
            f += a * cnoise(pi)
            a *= 0.51
            pi = pi.scale(1.99).map(x => x + 0.1);
        }
        return f;
    }

    function frac(p) {
        if (typeof p === "number") return p - Math.floor(p);
        // assume p is a vector
        return p.map(x => x - Math.floor(x));
    }

    function softMax(x, y, epsilon = 1e-2) {
        return (x + y + Math.sqrt((x - y) * (x - y) + epsilon)) / 2
    }

    const hyperPlanes = [];
    for (let i = 0; i < 15; i++) {
        const r = Vec.RANDOM(3).map(x => 2 * x - 1).normalize().toArray();
        hyperPlanes.push({ a: r, n: r });
    }
    function halfPlaneSDF(p, a, n) {
        return (p.x - a[0]) * n[0] + (p.y - a[1]) * n[1] + (p.z - a[2]) * n[2];
    }
    function distanceFunction(p, hyperPlanesSerial) {
        if (hyperPlanesSerial.length === 0) return 0;
        let minD = halfPlaneSDF(p, hyperPlanesSerial[0].a, hyperPlanesSerial[0].n);
        for (let i = 1; i < hyperPlanesSerial.length; i++) {
            const { a, n } = hyperPlanesSerial[i];
            minD = softMax(minD, halfPlaneSDF(p, a, n));
        }
        return minD + fbm(p.scale(1 / 0.15)) * 0.07;
    }

    function normalFunction(p, hyperPlanesSerial) {
        const epsilon = 1e-6;
        const f = distanceFunction(p, hyperPlanesSerial);
        const n = Vec3(
            distanceFunction(p.add(Vec3(epsilon, 0, 0)), hyperPlanesSerial) - f,
            distanceFunction(p.add(Vec3(0, epsilon, 0)), hyperPlanesSerial) - f,
            distanceFunction(p.add(Vec3(0, 0, epsilon)), hyperPlanesSerial) - f,
        );
        return n.normalize();
    }

    const rayScene = async (ray, { lightPosSerial, hyperPlanesSerial, skyBoxPath, _memory_ }) => {
        if (!_memory_._skyBox && skyBoxPath) {
            _memory_._skyBox = await Canvas.ofUrl(skyBoxPath);
        }
        const maxIte = 20;
        const maxDist = 10;
        const epsilon = 0.1;

        const lightPos = Vec.fromArray(lightPosSerial);
        const { init } = ray;
        let p = init;
        let t = distanceFunction(p, hyperPlanesSerial);
        for (let i = 0; i < maxIte; i++) {
            p = ray.trace(t);
            const d = distanceFunction(p, hyperPlanesSerial);
            t += d;
            if (d < epsilon) {
                const shade = Math.max(
                    0,
                    normalFunction(p, hyperPlanesSerial).dot(lightPos.sub(p).normalize())
                );
                return Color.ofRGB(shade, 0, 0);
            }
            if (t > maxDist) {
                const blue = i / maxIte;
                if (_memory_._skyBox) {
                    const color = renderBackground(ray, _memory_._skyBox);
                    return Color.ofRGB(color.red, color.green, (color.blue + blue) * 0.5);
                }
                return Color.ofRGB(0, 0, blue);
            }
        }
        if (_memory_._skyBox) return renderBackground(ray, _memory_._skyBox);
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
        camera.orbit((coords) => coords.add(Vec3(deltaY * 0.01, 0, 0)));
    });

    loop(async ({ dt, time }) => {
        const t = time;
        light.pos = Vec3(Math.cos(t), Math.sin(t), 1).scale(2);
        (
            await camera
                .rayMapParallel(rayScene, [
                    hash,
                    frac,
                    cnoise,
                    mix,
                    fbm,
                    softMax,
                    halfPlaneSDF,
                    distanceFunction,
                    normalFunction,
                ])
                .to(canvas, { lightPosSerial: light.pos.toArray(), hyperPlanesSerial: hyperPlanes, skyBoxPath: "/assets/sky.jpg" })
        ).paint();
        logger.print(`Inigo Iq - Tela Rock | FPS: ${Math.floor(1 / dt)}`);
    }).play();
}
