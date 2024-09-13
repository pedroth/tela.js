(canvas, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 640;
    const height = 480;
    canvas.resize(width, height);
    // utils
    const size = Vec2(width, height);
    function complexMul(z, w) { return [z[0] * w[0] - z[1] * w[1], z[0] * w[1] + z[1] * w[0]]; }
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
    })
    canvas.onMouseWheel(({ deltaY }) => {
        const scale = Math.sign(deltaY) * 1e-1;
        box = box.scale(1 + scale);
    })
    
    async function update() {
        await canvas.mapParallel((x, y, { width, height, min, max }) => {
            const ite = 200;
            const diagonal = [max[0] - min[0], max[1] - min[1]];
            let p = [x / width, y / height];
            p = p.map(z => 2 * z - 1);
            p = [p[0] * (width / height) - 0.5, p[1]];
            p = [
                min[0] + diagonal[0] * (p[0] + 1) * 0.5,
                min[1] + diagonal[1] * (p[1] + 1) * 0.5
            ]
            let z = [0, 0];
            for (let i = 0; i < ite; i++) {
                z = complexMul(z, z);
                z = [z[0] + p[0], z[1] + p[1]];
            }
            const l = Math.sqrt(z[0] * z[0] + z[1] * z[1]);
            const ll = Math.min(1, Math.max(0, l));
            return Color.ofRGB(1 - ll, ll, 0);
        }, [complexMul])
            .run({
                width,
                height,
                min: box.min.toArray(),
                max: box.max.toArray()
            })
    }
    loop(async () => {
        await update();
    }).play();
}
