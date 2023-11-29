(canvas, logger) => {
    const width = canvas.width;
    const height = canvas.height;
    const T = 20;
    let meanAverage = 0;
    Animator
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
                    let px = (x * time) / (width - 1);
                    let py = (y * time) / (height - 1);
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