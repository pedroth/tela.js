
/* eslint-disable no-undef */
async (canvas, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 640;
    const height = 480;
    canvas.resize(width, height);
    // scene
    const scene = new Scene();
    const nscene = new NaiveScene();
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
    // nscene.addList(mesh.asPoints(0.05));
    // scene.rebuild();

    const n = 5;
    const grid = [...Array(n * n)]
        .map((_, k) => {
            const i = Math.floor(k / n);
            const j = k % n;
            const x = j;
            const y = i;
            const initial = Vec3(0, x / n, y / n);
            return Sphere
                .builder()
                .name(`pxl_${k}`)
                .radius(1e-2)
                .position(initial.add(Vec.RANDOM(3)).map(x => 2 * x - 1))
                .color(Color.GRAY)
                .build()
        });
    scene.addList(grid);
    nscene.addList(grid);

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

    function debugDist(p) {
        return () => {
            const debugScene = new NaiveScene();
            debugScene.add(
                Sphere
                    .builder()
                    .name("start")
                    .position(p)
                    .color(Color.BLUE)
                    .radius(0.05)
                    .build()
            )
            debugScene.addList(sphere(p, scene.distanceToPoint(p), Color.ofRGB(1, 1, 0)));
            debugScene.add(line(p, scene.getElementNear(p).position, Color.ofRGB(0, 1, 1)))
            debugScene.addList(sphere(p, nscene.distanceToPoint(p), Color.GREEN));
            debugScene.add(line(p, nscene.getElementNear(p).position, Color.RED))
            camera.reverseShot(debugScene, { clearScreen: false }).to(canvas);
        }
    }

    loop(({ time, dt }) => {
        camera.reverseShot(scene).to(canvas);
        scene.debug({ camera, canvas })
        let t = time % 10;
        debugDist(Vec3(0, -1 + 0.25 * t, 0))()
        logger.print(Math.floor(1 / dt));
    }).play();
}
