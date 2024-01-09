/* eslint-disable no-undef */
async (canvas, fps, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 640/2;
    const height = 480/2;
    canvas.resize(width, height);
    // scene
    const scene = new Scene();
    const camera = new Camera();
    scene
    .add(
        Point
            .builder()
            .position(Vec3(0, -1, 0))
            .name("test6-1")
            .radius(0.1)
            .build()
        ,
        Point
            .builder()
            .position(Vec3(0, 1, 0))
            .name("test6-2")
            .radius(0.1)
            .build()
        ,
        Point
            .builder()
            .position(Vec3(0, 0, -1))
            .name("test6-3")
            .radius(0.1)
            .build()
        ,
        Point
            .builder()
            .position(Vec3(0, 0, 1))
            .name("test6-4")
            .radius(0.1)
            .build()
        ,
        Point
            .builder()
            .position(Vec3(-1, 0, 0))
            .name("test6-5")
            .radius(0.1)
            .build()
        ,
        Point
            .builder()
            .position(Vec3(1, 0, 0))
            .name("test6-6")
            .radius(0.1)
            .build()
    )
    // const stanfordBunnyObj = await fetch("/assets/bunny.obj").then(x => x.text());
    // let bunnyMesh = Mesh.readObj(stanfordBunnyObj);
    // const bunnyBox = bunnyMesh.getBoundingBox();
    // bunnyMesh = bunnyMesh
    //     .mapVertices(v =>
    //         v.sub(bunnyBox.min).div(bunnyBox.diagonal).scale(2).sub(Vec3(1, 1, 1))
    //     )
    //     .mapVertices(v => Vec3(-v.y, v.x, v.z))
    //     .mapVertices(v => Vec3(v.z, v.y, -v.x))
    //     .mapColors(v =>
    //         Color.ofRGB(...v.map(x => Math.max(0, Math.min(1, 0.5 * (x + 1)))).toArray())
    //     )
    // scene.add(...bunnyMesh.asPoints("bunny", 0.05));

    const rayScene = (ray) => {
        const maxIte = 100;
        const maxDist = 10;
        const epsilon = 1e-3;
        const { init } = ray;
        let p = init;
        let t = scene.distanceToPoint(p);
        for (let i = 0; i < maxIte; i++) {
            p = ray.trace(t);
            const d = scene.distanceToPoint(p);
            t += d;
            if (d < epsilon) {
                const normal = scene.estimateNormal(p).map(x => (x+1)/2);
                return Color.ofRGB(normal.x, normal.y, normal.z);
            }
            if (d > maxDist) return Color.ofRGB(0, 0, i / maxIte);
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

    Animation
        .builder()
        .initialState({ it: 1, time: 0, oldTime: new Date().getTime() })
        .nextState(({ it, time, oldTime }) => {
            const dt = (new Date().getTime() - oldTime) * 1e-3;
            oldTime = new Date().getTime()
            const t = time;
            camera.rayShot(rayScene).to(canvas);
            logger.print(`FPS: ${Math.floor(1 / dt)}`);
            return {
                it: it + 1,
                time: time + dt,
                oldTime
            };
        })
        .while(() => true)
        .build()
        .play();
}
