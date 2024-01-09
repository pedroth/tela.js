(canvas) => {
    // resize incoming canvas:Canvas object.
    const width = 640;
    const height = 480;
    canvas.resize(width, height);
    // using canvas map
    canvas
        .map((x, y) => {
            let px = x / width;
            let py = y / height;
            return Color.ofRGB(px, py, 0);
        })

}