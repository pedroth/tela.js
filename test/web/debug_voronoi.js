/* eslint-disable no-undef */
async (canvas) => {
    // resize incoming canvas:Canvas object.
    const width = 640 / 2;
    const height = 480 / 2;
    const size = Vec2(width, height);
    canvas.resize(width, height);
    // mouse
    let mousedown = false;
    let mouse = Vec2();
    let verticalBarX = width / 2;
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
        verticalBarX = newMouse.x;
        mouse = newMouse;
    })
    // scene
    const scene = new Scene();
    const nscene = new NaiveScene();
    // scene
    const n = 3;
    const grid = [...Array(n * n)]
        .map((_, k) => {
            const i = Math.floor(k / n);
            const j = k % n;
            const x = j;
            const y = i;
            const initial = Vec2(x / n, y / n);
            return Point
                .builder()
                .name(`pxl_${k}`)
                .radius(1e-2)
                .position(initial.add(Vec.RANDOM(2)).map(x => 2 * x - 1))
                .color(Color.random())
                .build()
        });
    scene.addList(grid);
    nscene.addList(grid);
    const cameraSize = 2;
    Animation
        .builder()
        .nextState(() => {
            canvas.map((x, y) => {
                const p = Vec2(x, y)
                    .div(size)
                    .map(x => cameraSize * (2 * x - 1));
                if (x < verticalBarX) {
                    const elem = nscene.getElemNear(p);
                    return elem.color;
                }
                if (x === verticalBarX) return Color.BLACK;
                const elem = scene.getElemNear(p);
                return elem.color;
            })
            nscene.getElements()
                .forEach(p => {
                    const intCoords = p.position
                        .map(x => (x / cameraSize + 1) / 2)
                        .mul(size)
                        .map(Math.floor);
                    canvas.setPxl(intCoords.x, intCoords.y, Color.BLACK);
                })
            canvas.paint();
        })
        .while(() => true)
        .build()
        .play();
}
