
/* eslint-disable no-undef */
async (canvas, fps, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 640;
    const height = 480;
    canvas.resize(width, height);
    // scene
    const scene = new NaiveScene()
    const camera = new Camera({ sphericalCoords: Vec3(20, 0, Math.PI / 6) });
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
    const stanfordBunnyObj = await fetch("/assets/bunny.obj").then(x => x.text());
    let bunnyMesh = Mesh.readObj(stanfordBunnyObj, "bunny");
    const bunnyBox = bunnyMesh.getBoundingBox();
    bunnyMesh = bunnyMesh
        .mapVertices(v =>
            v.sub(bunnyBox.min).div(bunnyBox.diagonal).scale(2).sub(Vec3(1, 1, 1))
        )
        .mapVertices(v => Vec3(-v.y, v.x, v.z))
        .mapVertices(v => Vec3(v.z, v.y, -v.x))
        .mapVertices(v => v.add(Vec3(0, 0, 5)))
        .mapColors(v =>
            Color.ofRGB(...v.map(x => Math.max(0, Math.min(1, 0.5 * (x + 1)))).toArray())
        )
    const bunnyPoints = bunnyMesh.asPoints(0.02);
    const bunnySpeeds = [...Array(bunnyPoints.length)].map(() => Vec3());
    scene.addList(bunnyPoints);
    // physics
    const g = -9.8;
    const bunnyPhysics = dt => {
        for (let i = 0; i < bunnyPoints.length; i++) {
            const acceleration = Vec3(0, 0, g);
            bunnySpeeds[i] = bunnyPoints[i].position.z <= 0 ?
                Vec3().map(() => 10 * (2 * Math.random() - 1)) :
                bunnySpeeds[i].add(acceleration.scale(dt));
            bunnyPoints[i].position = bunnyPoints[i].position.add(bunnySpeeds[i].scale(dt));
        }
    }

    // boilerplate for fps
    Animation
        .builder()
        .initialState({ it: 1, oldTime: new Date().getTime() })
        .nextState(({ it, oldTime }) => {
            camera.reverseShot(scene).to(canvas);
            const dt = (new Date().getTime() - oldTime) * 1e-3;
            logger.print(`FPS: ${Math.floor(1 / dt)}`);
            bunnyPhysics(dt);
            return {
                it: it + 1,
                oldTime: new Date().getTime()
            };
        })
        .while(() => true)
        .build()
        .play();
}
