/* eslint-disable no-undef */
async (canvas, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 640;
    const height = 480;
    canvas.resize(width, height);
    // scene
    const scene = new NaiveScene();
    const camera = new Camera({ sphericalCoords: Vec3(5, 0, 0), focalPoint: Vec3(0.5, 0.5, 0.5) });
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
    const img = await Canvas.ofUrl("./assets/kakashi.jpg");
    const grid = [...Array(img.width * img.height)]
        .map((_, k) => {
            const i = Math.floor(k / img.width);
            const j = k % img.width;
            const x = j;
            const y = i;
            const initial = Vec3(0, x / img.width, y / img.height);
            return {
                init: initial,
                point: Point
                    .builder()
                    .name(`pxl_${k}`)
                    .radius(1e-5)
                    .position(initial)
                    .color(img.getPxl(x, y))
                    .build()
            }
        });
    scene.addList(grid.map(({ point }) => point));

    const stateMachine = (() => {
        let state = 0;
        const dt = 0.25;
        const period = 15;
        const halfPeriod = period / 2;
        return t => {
            let time = t % period;
            if (state === 0 && time < halfPeriod) {
                grid.forEach(({ init, point }) => {
                    const speed = init.sub(point.position);
                    point.position = point.position.add(speed.scale(dt));
                })
                return state;
            }
            if (state === 0 && time >= halfPeriod) {
                return state++;
            }
            if (state === 1 && time >= halfPeriod) {
                grid.forEach(({ point }) => {
                    const colorVec3 = Vec3(...point.color.toArray());
                    const speed = colorVec3.sub(point.position);
                    point.position = point.position.add(speed.scale(dt));
                })
                return state;
            }
            if (state === 1 && time < halfPeriod) {
                return state--;
            }
        }
    })();

    // boilerplate for fps
    Animation
        .builder()
        .initialState({ it: 1, oldTime: new Date().getTime(), time: 0 })
        .nextState(({ it, oldTime, time }) => {
            camera.reverseShot(scene).to(canvas);
            stateMachine(time)
            const dt = (new Date().getTime() - oldTime) * 1e-3;
            logger.print(Math.floor(1 / dt));
            return {
                it: it + 1,
                oldTime: new Date().getTime(),
                time: time + dt
            };
        })
        .while(() => true)
        .build()
        .play();
}
