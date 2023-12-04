(canvas, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 640;
    const height = 480;
    canvas.resize(width, height);
    // utils
    const T = 20;
    let meanAverage = 0;
    const step = (threshold) => (x) => x < threshold ? 0 : 1;
    const mod = (x) => (n) => ((x % n) + n) % n;
    
    Animation
        .builder()
        .initialState({
            it: 1,
            time: 0,
            oldT: new Date().getTime(),
        })
        .nextState(({
            it,
            time,
            oldT,
        }) => {
            const newT = new Date().getTime();
            const dt = (newT - oldT) * 1e-3;
            meanAverage = meanAverage + (dt - meanAverage) / it;
            logger.print("FPS: " + (1 / meanAverage));
            canvas
                .map((x, y) => {
                    let u = x / (width - 1);
                    let v = y / (height - 1);
                    const grid = 10;
                    u *= grid;
                    v *= grid;
                    const t = 0.1 * time;
                    const u_t = Math.cos(t) * u + Math.sin(t) * v;
                    const v_t = -Math.sin(t) * u + Math.cos(t) * v;
                    const color =
                        (1 - step(0.95)(mod(u_t)(1))) * (1 - step(0.95)(mod(v_t)(1)));
                    return Color.ofRGB(color, color, color);
                })
            return {
                it: it + 1,
                oldT: newT,
                time: time + dt,
            };
        })
        .while(({ time }) => time <= T)
        .build()
        .play();
}
