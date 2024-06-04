
/* eslint-disable no-undef */
async (canvas, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 640;
    const height = 480;
    canvas.resize(width, height);
    // scene
    const scene = new Scene();
    const camera = new Camera().orbit(5, 0, 0);
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
    // const obj = await fetch("/assets/spot.obj").then(x => x.text());
    // let mesh = Mesh.readObj(obj, "mesh");
    // mesh = mesh
    //     .mapVertices(v => Vec3(-v.y, v.x, v.z))
    //     .mapVertices(v => Vec3(v.z, v.y, -v.x))
    //     .mapColors(v => Color.ofRGB(...v.map(x => (x+1)/2).toArray()))
    // scene.addList(mesh.asPoints(0.05));
    // scene.rebuild();
    const n = 10;
    const grid = [...Array(n * n)]
        .map((_, k) => {
            const i = Math.floor(k / n);
            const j = k % n;
            const x = j;
            const y = i;
            const initial = Vec3(0, x / n, y / n);
            return Point
                .builder()
                .name(`pxl_${k}`)
                .radius(1e-2)
                .position(initial.add(Vec.RANDOM(3)).map(x => 2 * x - 1))
                .color(Color.GRAY)
                .build()
        });
    scene.addList(grid);

    function line(init, end, color) {
        const name = `line_${Math.floor(Math.random() * 1000)}`;
        return Line
            .builder()
            .name(name)
            .positions(init, end)
            .colors(color, color)
            .build();
    }

    function sphere(p, radius, color) {
        const samples = 20;
        const tau = 2 * Math.PI;
        const longitude = [...Array(samples)]
            .map((_, i) => {
                const t = i / (samples - 1);
                return p.add(
                    Vec3(0, 1, 0)
                        .scale(radius * Math.cos(tau * t))
                        .add(Vec3(0, 0, 1).scale(radius * Math.sin(tau * t)))
                );
            });
        longitude.push(longitude[0]);
        const latitude = [...Array(samples)]
            .map((_, i) => {
                const t = i / (samples - 1);
                return p.add(
                    Vec3(1, 0, 0)
                        .scale(radius * Math.cos(tau * t))
                        .add(Vec3(0, 1, 0).scale(radius * Math.sin(tau * t)))
                );
            });
        latitude.push(latitude[0]);
        return [
            ...Path.builder().name(`longitude_${Math.floor(Math.random() * 1000)}`).positions(longitude).colors([...Array(samples + 1)].map(() => color)).build().asLines(),
            ...Path.builder().name(`latitude_${Math.floor(Math.random() * 1000)}`).positions(latitude).colors([...Array(samples + 1)].map(() => color)).build().asLines()
        ];
    }

    function debugRay(ray) {
        return () => {
            const debugScene = new NaiveScene();
            const maxIte = 100;
            const epsilon = 1e-3;
            const { init } = ray;
            let p = init;
            let t = scene.distanceToPoint(p);
            const maxDist = t;
            debugScene.add(
                Point
                    .builder()
                    .name("init")
                    .position(p)
                    .color(Color.BLUE)
                    .radius(0.05)
                    .build()
            );
            debugScene.addList(sphere(p, t, Color.GREEN));
            debugScene.add(line(init, ray.trace(t), Color.RED));
            for (let i = 0; i < maxIte; i++) {
                debugScene.add(
                    Point
                        .builder()
                        .name("init" + i)
                        .position(p)
                        .color(Color.ofRGB(0, 0, i / 5))
                        .radius(0.05)
                        .build()
                );
                p = ray.trace(t);
                const d = scene.distanceToPoint(p);
                debugScene.addList(sphere(p, d, Color.ofRGB(0, 1 - i / 10, 0)));
                // debugScene.add(line(p, ray.trace(d), Color.ofRGB(i / 5, 0, 0)));
                t += d;
                if (d < epsilon) {
                    debugScene.add(
                        Point
                            .builder()
                            .name("hit")
                            .position(p)
                            .color(Color.BLUE)
                            .radius(0.05)
                            .build()
                    );
                    break;
                }
                if (d > maxDist) break;
            }
            camera.reverseShot(debugScene, { clearScreen: false }).to(canvas);
        }
    }

    // boilerplate for fps
    Animation
        .builder()
        .initialState({ it: 1, time: 0, oldTime: new Date().getTime() })
        .nextState(({ it, time, oldTime }) => {
            camera.reverseShot(scene).to(canvas);
            scene.debug({ camera, canvas })
            const freq = 0.05;
            let t = time % 10;
            debugRay(Ray(Vec3(0, -5, 2), Vec3(0, Math.cos(freq * t), -Math.sin(freq * t))))();
            const dt = (new Date().getTime() - oldTime) * 1e-3;
            logger.print(Math.floor(1 / dt));
            return {
                it: it + 1,
                time: time + dt,
                oldTime: new Date().getTime()
            };
        })
        .while(() => true)
        .build()
        .play();
}
