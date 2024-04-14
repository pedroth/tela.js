(canvas, logger) => {
    // resize incoming canvas:Canvas object.
    console.log(">>>")

    const width = 100;
    const height = 100;
    canvas.resize(width, height);
    // utils
    const amp = 1;
    const dU = 1.02;
    const dV = 0.4;
    const F = 0.046;
    const K = 0.062;
    const mod = (n, m) => ((n % m) + m) % m;
    const U = [...new Array(height)].map(
        () => new Float64Array(width).map(() => 1)
    );
    const V = [...new Array(height)].map(
        () => new Float64Array(width)
    );

    let mousedown = false;
    canvas.onMouseDown(() => {
        mousedown = true;
    })
    canvas.onMouseUp(() => {
        mousedown = false;
    })
    canvas.onMouseMove((x, y) => {
        if (!mousedown) return;
        const i = mod(y - height + 1, height);
        const j = mod(x, width);
        let steps = [-1, 0, 1];
        //steps = [-2,-1,0,1,2]; // uncomment this line for bigger paint brush
        const n = steps.length;
        const nn = n * n;
        for (let k = 0; k < nn; k++) {
            const u = Math.floor(k / n)
            const v = k % n
            V[mod(i + steps[u], height)][mod(j + steps[v], width)] = amp;
        }
    })

    // start animation
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
            let dt = (newT - oldT) * 1e-3;
            logger.print(`FPS: ${Math.floor(1 / dt)}`);
            dt = 0.9;

            let maxU = Number.MIN_VALUE;
            let minU = Number.MAX_VALUE;
            let maxV = Number.MIN_VALUE;
            let minV = Number.MAX_VALUE;
            // update wave
            for (let i = 0; i < height; i++) {
                for (let j = 0; j < width; j++) {
                    /**
                     * Sympletic integration
                     */
                    // compute acceleration
                    let uLaplacian =
                        (
                            U[i][mod(j + 1, width)] +
                            U[i][mod(j - 1, width)] +
                            U[mod(i + 1, height)][j] +
                            U[mod(i - 1, height)][j]
                        ) / 4 - U[i][j];

                    let vLaplacian =
                        (
                            V[i][mod(j + 1, width)] +
                            V[i][mod(j - 1, width)] +
                            V[mod(i + 1, height)][j] +
                            V[mod(i - 1, height)][j]
                        ) / 4 - V[i][j];

                    // update U
                    U[i][j] = U[i][j] + dt * (dU * uLaplacian - U[i][j] * (V[i][j] * V[i][j]) + F * (1 - U[i][j]));

                    // update V
                    V[i][j] = V[i][j] + dt * (dV * vLaplacian + U[i][j] * (V[i][j] * V[i][j]) - (K + F) * V[i][j]);

                    // get max min values of wave
                    maxU = maxU <= U[i][j] ? U[i][j] : maxU;
                    minU = minU > U[i][j] ? U[i][j] : minU;
                    maxV = maxV <= V[i][j] ? V[i][j] : maxV;
                    minV = minV > V[i][j] ? V[i][j] : minV;
                }
            }
            canvas.map((x, y) => {
                let xi = x;
                let yi = y;
                const redColor = (U[yi][xi] - minU) / (maxU - minU);
                const blueColor = (V[yi][xi] - minV) / (maxV - minV);
                return Color.ofRGB(redColor, 0, blueColor).scale(1);
            })
            return {
                it: it + 1,
                oldT: newT,
                time: time + dt,
            };
        })
        .while(({ time }) => true)
        .build()
        .play();
}
