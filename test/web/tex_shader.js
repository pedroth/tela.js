/* eslint-disable no-undef */
async (canvas) => {
    // resize incoming canvas:Canvas object.
    const width = 640;
    const height = 480;
    canvas.resize(width, height);
    const texture = await Canvas.ofUrl("/assets/earth.jpg");
    // utils
    const size = Vec2(width, height);
    let box = new Box(Vec2(), Vec2(1, 1));
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
        const v = Vec2(dx, dy).scale(-1).div(size).mul(box.diagonal);
        box = box.move(v);
        mouse = newMouse;
        update();
    })
    canvas.onMouseWheel(({ deltaY }) => {
        const scale = Math.sign(deltaY) * 1e-1;
        box = box.scale(1 + scale);
        update();
    })

    function update() {
        canvas.map((x, y) => {
            let p = Vec2(x, y).div(size);
            p = p.map(z => 2 * z - 1);
            p = box.min.add(
                box.diagonal.mul(
                    p.add(Vec2(1, 1)).scale(1 / 2)
                )
            )
            return texture.getPxl(p.x * texture.width, p.y * texture.height);
        })
    }
    update();
}