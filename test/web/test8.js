async (canvas, fps, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 640;
    const height = 480;
    canvas.resize(width, height);
    // scene
    const camera = new Camera();
    const light = { pos: Vec3(2, 0, 0) };
    const rayScene = ({ start, dir }) => {
        let p = start;
        let t = box.distanceToPoint(p);
        const maxT = t;
        for (let i = 0; i < 20; i++) {
            p = start.add(dir.scale(t));
            const d = box.distanceToPoint(p);
            t += d;
            if (d < 0.01) {
                const shade = Math.max(0, box.estimateNormal(p).dot(light.pos.sub(p).normalize()))
                return Color.ofRGB(shade, 0, 0);
            }
            if (d > maxT) break;
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
        camera.param = camera.param.add(
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
        camera.param = camera.param.add(Vec3(deltaY * 0.001, 0, 0));
        camera.orbit();
    })

    const box = new Box(Vec.ONES(3).scale(-0.5), Vec.ONES(3).scale(0.5));
    Animation
        .builder()
        .initialState({ it: 1, time: 0, oldTime: new Date().getTime() })
        .nextState(({ it, time, oldTime }) => {
            const dt = (new Date().getTime() - oldTime) * 1e-3;
            const t = 2 * Math.PI * time * 3;
            light.pos = Vec3(Math.cos(t), Math.sin(t), 1).scale(2);
            camera.rayShot(rayScene).to(canvas);
            logger.print(`FPS: ${1 / dt}`);
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
