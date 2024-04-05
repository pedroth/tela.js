(canvas, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 640;
    const height = 480;
    canvas.resize(width, height);
    function palette(t) {
        let a = [0.5, 0.5, 0.5];
        let b = [0.5, 0.5, 0.5];
        let c = [1.0, 1.0, 1.0];
        let d = [0.263, 0.416, 0.557];
        return [a[0] + b[0] * Math.cos(6.28318 * (c[0] * t + d[0])), a[1] + b[1] * Math.cos(6.28318 * (c[1] * t + d[1])), a[2] + b[2] * Math.cos(6.28318 * (c[2] * t + d[2]))];
    }
    const play = async ({ time, oldT }) => {
        const newT = new Date().getTime();
        const dt = (newT - oldT) * 1e-3;
        logger.print(`FPS:${Math.floor(1 / dt)}`)
        await canvas
            .mapParallel(
                (x, y, { width, height, time }) => {
                    let u = (2 * x - width) / height
                    let v = (2 * y - height) / height;
                    const u0 = u;
                    const v0 = v;
                    let finalColor = [0, 0, 0]
                    for (let i = 0; i < 4; i++) {
                        u = (u * 1.5 - Math.floor(u * 1.5)) - 0.5;
                        v = (v * 1.5 - Math.floor(v * 1.5)) - 0.5;
                        const d0 = -Math.sqrt(u0 * u0 + v0 * v0);
                        let d = Math.sqrt(u * u + v * v) * Math.exp(d0);
                        const col = palette(d0 + i * 0.4 + time * 0.4);
                        d = Math.sin(d * 8 + time) / 8;
                        d = Math.abs(d);
                        d = Math.pow(0.01 / d, 1.2);

                        finalColor = [finalColor[0] + col[0] * d, finalColor[1] + col[1] * d, finalColor[2] + col[2] * d]
                    }
                    return Color.ofRGB(finalColor[0], finalColor[1], finalColor[2]);
                },
                [palette]
            )
            .run({ width, height, time });
        requestAnimationFrame(() => play({
            oldT: newT,
            time: time + dt,
        }));
    }
    requestAnimationFrame(() => play({ oldT: new Date().getTime(), time: 0 }))
}
