(canvas, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 640;
    const height = 480;
    canvas.resize(width, height);
    // variable to play with
    const alpha = 1;
    // using canvas map
    canvas
        .map((x, y) => {
            let px = (x * alpha) / (width - 1);
            let py = (y * alpha) / (height - 1);
            return Color.ofRGB(px, py, 0);
        })

}