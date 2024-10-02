(canvas, logger) => {
    // Resize incoming canvas:Canvas object.
    const width = 100;
    const height = 100;
    canvas.resize(width, height);

    // Utils
    const amp = 1;
    const dU = 1.02;
    const dV = 0.4;
    const F = 0.046;
    const K = 0.062;
    const mod = (n, m) => ((n % m) + m) % m;
    const U = [...new Array(height)].map(() => new Float64Array(width).fill(1));
    const V = [...new Array(height)].map(() => new Float64Array(width));

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
            V[mod(i + steps[u], height)][mod(j + steps[v], width)] = amp;
        }
    });

    // Start animation
    loop(({ dt }) => {
        logger.print(`FPS: ${Math.floor(1 / dt)}`);
        dt = 0.8;

        let maxU = Number.MIN_VALUE;
        let minU = Number.MAX_VALUE;
        let maxV = Number.MIN_VALUE;
        let minV = Number.MAX_VALUE;

        // Update wave
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                // Sympletic integration
                // Compute acceleration
                let uLaplacian =
                    (U[i][mod(j + 1, width)] +
                        U[i][mod(j - 1, width)] +
                        U[mod(i + 1, height)][j] +
                        U[mod(i - 1, height)][j]) /
                        4 -
                    U[i][j];

                let vLaplacian =
                    (V[i][mod(j + 1, width)] +
                        V[i][mod(j - 1, width)] +
                        V[mod(i + 1, height)][j] +
                        V[mod(i - 1, height)][j]) /
                        4 -
                    V[i][j];

                // Update U
                U[i][j] += dt * (dU * uLaplacian - U[i][j] * V[i][j] * V[i][j] + F * (1 - U[i][j]));

                // Update V
                V[i][j] += dt * (dV * vLaplacian + U[i][j] * V[i][j] * V[i][j] - (K + F) * V[i][j]);

                // Get max min values of wave
                maxU = Math.max(maxU, U[i][j]);
                minU = Math.min(minU, U[i][j]);
                maxV = Math.max(maxV, V[i][j]);
                minV = Math.min(minV, V[i][j]);
            }
        }

        canvas.map((x, y) => {
            let redColor = (U[y][x] - minU) / (maxU - minU);
            let blueColor = (V[y][x] - minV) / (maxV - minV);
            redColor = isNaN(redColor) ? 1 : redColor;
            blueColor = isNaN(blueColor) ? 1 : blueColor;
            return Color.ofRGB(redColor, 0, blueColor);
        }).paint();
    }).play();
}
