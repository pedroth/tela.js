
/* eslint-disable no-undef */
async (canvas, fps, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 640/4;
    const height = 480/4;
    canvas.resize(width, height);
    // scene
    const scene = new Scene()
    const camera = new Camera({ sphericalCoords: Vec3(5, 0, 0) });
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
        camera.sphericalCoords = camera.sphericalCoords.add(
            Vec3(
                0,
                -2 * Math.PI * (dx / canvas.width),
                -2 * Math.PI * (dy / canvas.height)
            )
        );
        mouse = newMouse;
        camera.orbit();
    })
    canvas.onMouseWheel(({ deltaY }) => {
        camera.sphericalCoords = camera.sphericalCoords.add(Vec3(deltaY * 0.001, 0, 0));
        camera.orbit();
    })
    // scene
    // scene
    //     .add(
    //         Point
    //             .builder()
    //             .position(Vec3(0, -1, 0))
    //             .name("test6-1")
    //             .radius(0.1)
    //             .build()
    //         ,
    //         Point
    //             .builder()
    //             .position(Vec3(0, 1, 0))
    //             .name("test6-2")
    //             .radius(0.1)
    //             .build()
    //         ,
    //         Point
    //             .builder()
    //             .position(Vec3(0, 0, -1))
    //             .name("test6-3")
    //             .radius(0.1)
    //             .build()
    //         ,
    //         Point
    //             .builder()
    //             .position(Vec3(0, 0, 1))
    //             .name("test6-4")
    //             .radius(0.1)
    //             .build()
    //         ,
    //         Point
    //             .builder()
    //             .position(Vec3(-1, 0, 0))
    //             .name("test6-5")
    //             .radius(0.1)
    //             .build()
    //         ,
    //         Point
    //             .builder()
    //             .position(Vec3(1, 0, 0))
    //             .name("test6-6")
    //             .radius(0.1)
    //             .build()
    //     )
    const obj = await fetch("/assets/spot.obj").then(x => x.text());
    let mesh = Mesh.readObj(obj, "mesh");
    mesh = mesh
        .mapVertices(v => Vec3(-v.y, v.x, v.z))
        .mapVertices(v => Vec3(v.z, v.y, -v.x))
    scene.add(...mesh.asPoints(0.05));

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
            const maxDist = 10;
            const epsilon = 1e-3;
            const { init } = ray;
            let p = init;
            let t = scene.distanceToPoint(p);
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
                // debugScene.addList(sphere(p, t, Color.ofRGB(0, i / 5, 0)));
                // debugScene.add(line(p, ray.trace(d), Color.ofRGB(i / 5, 0, 0)));
                t += 0.1*d;
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

    function debugDist(p) {
        return () => {
            const debugScene = new NaiveScene();
            debugScene.add(
                Point
                    .builder()
                    .name("start")
                    .position(p)
                    .color(Color.BLUE)
                    .radius(0.05)
                    .build()
            )
            debugScene.addList(sphere(p, scene.distanceToPoint(p), Color.GREEN));
            camera.reverseShot(debugScene, { clearScreen: false }).to(canvas);
        }
    }

    // boilerplate for fps
    Animation
        .builder()
        .initialState({ it: 1, time: 0, oldTime: new Date().getTime() })
        .nextState(({ it, time, oldTime }) => {
            camera.sceneShot(scene).to(canvas);
            const freq = 0.05;
            let t = time % 10;
            debugRay(Ray(Vec3(0, -5, 2), Vec3(0, Math.cos(freq * t), -Math.sin(freq * t))))();
            // if(time % 1 < 0.5) debugDist(Vec3().map(() => 2 * Math.random() - 1))()
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
