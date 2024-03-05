(canvas, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 640;
    const height = 480;
    canvas.resize(width, height);
    // util variables
    const T = 20;
    // Using Animation from tela.js
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
            logger.print(`FPS: ${Math.floor(1 / dt)}`);

            canvas
                .map((x, y) => {
                    let px = (x * time) / width;
                    let py = (y * time) / height;
                    return Color.ofRGB(px % 1, py % 1, 0);
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