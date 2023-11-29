(canvas, logger) => {
    const width = canvas.width;
    const height = canvas.height;
    const time = 1;
    canvas
        .map((x, y) => {
            let px = (x * time) / (width - 1);
            let py = (y * time) / (height - 1);
            return Color.ofRGB(px % 1, py % 1, 0);
        })

}