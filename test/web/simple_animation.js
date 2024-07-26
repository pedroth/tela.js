(canvas, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 640;
    const height = 480;
    canvas.resize(width, height);
    // util variables
    const T = 20;
    // Using loop from tela.js
    const animation = loop(({ time, dt }) => {
        logger.print(`FPS: ${Math.floor(1 / dt)}`);
        canvas
            .map((x, y) => {
                let px = (x * time) / width;
                let py = (y * time) / height;
                return Color.ofRGB(px % 1, py % 1, 0);
            })
        if (time > T) animation.stop();
    }).play();
}