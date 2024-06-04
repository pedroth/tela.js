(canvas, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 640/2;
    const height = 480/2;
    canvas.resize(width, height);
    // utils
    const size = Vec2(width, height);
    const complexMul = (z, w) => Vec2(z.x * w.x - z.y * w.y, z.x * w.y + z.y * w.x);
    let box = new Box(Vec2(-1, -1), Vec2(1, 1));
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
        box = box.scale(1+scale);
        update();
    })

    function update() {
        const ite = 100;
        canvas.map((x, y) => {
            let p = Vec2(x, y).div(size);
            p = p.map(z => 2 * z - 1);
            p = Vec2(p.x * (size.x / size.y) - 0.5, p.y);
            p = box.min.add(
                box.diagonal.mul(
                    p.add(Vec2(1, 1)).scale(1 / 2)
                )
            )
            let z = Vec2();
            for (let i = 0; i < ite; i++) {
                z = complexMul(z, z).add(p);
            }
            const l = z.length();
            const ll = Math.min(1, Math.max(0, l));
            return Color.ofRGB(1 - ll, ll, 0);
        })
    }
    update();
}
