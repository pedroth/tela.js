(canvas, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 640;
    const height = 480;
    canvas.resize(width, height);
    // utils
    const T = 20;
    const step = (threshold) => (x) => x < threshold ? 0 : 1;
    const mod = (x) => (n) => ((x % n) + n) % n;

    // record video
    const recorder = canvas.startVideoRecorder();
    setTimeout(async () => {
        const [blob, url] = await recorder.stop();
        const a = document.createElement('a');
        a.download = 'Rotating Shader.webm';
        a.href = url;
        a.textContent = 'download the video';
        document.body.appendChild(a);
    }, T * 1000)

    // setting animation
    const animation = loop(({ time, dt }) => {
        logger.print(`FPS: ${Math.floor(1 / dt)}`);
        canvas
            .map((x, y) => {
                let u = -3 + 6 * (x / width);
                let v = -3 + 6 * (y / height);
                const grid = 1;
                u *= grid;
                v *= grid;
                const t = 0.5 * time;
                const u_t = Math.cos(t) * u + Math.sin(t) * v;
                const v_t = -Math.sin(t) * u + Math.cos(t) * v;
                const color =
                    (1 - step(0.95)(mod(u_t)(1))) * (1 - step(0.95)(mod(v_t)(1)));
                return Color.ofRGB(color, color, color);
            }).paint();
        if (time > T) animation.stop();
    }).play()
}
