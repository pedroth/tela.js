(canvas, logger) => {
    // Resize incoming canvas:Canvas object.
    const width = 100;
    const height = 100;
    canvas.resize(width, height);

    // Utils
    const amp = 10;
    const friction = 1;
    const waveScalarSpeed = 50;
    const mod = (n, m) => ((n % m) + m) % m;
    const wave = [...new Array(height)].map(() => new Float64Array(width));
    const waveSpeed = [...new Array(height)].map(() => new Float64Array(width));

    let mousedown = false;
    canvas.onMouseDown(() => {
        mousedown = true;
    });

    canvas.onMouseUp(() => {
        mousedown = false;
    });

    canvas.onMouseMove((x, y) => {
        if (!mousedown) return;
        const i = mod(y - height + 1, height);
        const j = mod(x, width);
        let steps = [-1, 0, 1];
        // steps = [-2, -1, 0, 1, 2]; // Uncomment this line for bigger paint brush
        const n = steps.length;
        const nn = n * n;
        for (let k = 0; k < nn; k++) {
            const u = Math.floor(k / n);
            const v = k % n;
            wave[mod(i + steps[u], height)][mod(j + steps[v], width)] = amp;
        }
    });

    // Start animation
    loop(({ dt }) => {
        logger.print(`FPS: ${Math.floor(1 / dt)}`);

        let maxWave = Number.MIN_VALUE;
        let minWave = Number.MAX_VALUE;
        let maxAbsSpeed = Number.MIN_VALUE;

        // Update wave
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                // Sympletic integration
                // Compute acceleration
                const laplacian =
                    wave[i][mod(j + 1, width)] +
                    wave[i][mod(j - 1, width)] +
                    wave[mod(i + 1, height)][j] +
                    wave[mod(i - 1, height)][j] -
                    4 * wave[i][j];
                const acceleration = waveScalarSpeed * laplacian - friction * waveSpeed[i][j];

                // Update speed
                waveSpeed[i][j] += dt * acceleration;

                // Update position
                wave[i][j] += dt * waveSpeed[i][j];

                // Get max min values of wave
                maxWave = Math.max(maxWave, wave[i][j]);
                minWave = Math.min(minWave, wave[i][j]);
                const absSpeed = Math.abs(waveSpeed[i][j]);
                maxAbsSpeed = Math.max(maxAbsSpeed, absSpeed);
            }
        }

        canvas
            .map((x, y) => {
                const redColor = (wave[y][x] - minWave) / (maxWave - minWave);
                const blueColor = 1 - redColor;
                const greenColor = Math.abs(waveSpeed[y][x]) / maxAbsSpeed;
                return Color.ofRGB(redColor, greenColor, blueColor);
            })
            .paint();
    }).play();
}
