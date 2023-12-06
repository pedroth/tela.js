(canvas, logger) => {
    // resize incoming canvas:Canvas object.
    const width = 100;
    const height = 100;
    canvas.resize(width, height);

    // utils
    let meanAverage = 0;
    const T = 100;
    const amp = 10;
    const spread = 200;
    const friction = 1;
    const waveScalarSpeed = 50;
    const mod = (n, m) => ((n % m) + m) % m;
    const wave = [...new Array(height)].map(
        () => new Float64Array(width)
    );
    const waveSpeed = [...new Array(height)].map(
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
        let steps = [-1,0,1];
        //steps = [-2,-1,0,1,2]; // uncomment this line for bigger paint brush
        const n = steps.length;
        const nn = n * n;
        for(let k = 0; k < nn; k++) {
            const u = Math.floor(k / n)
            const v = k % n
            wave[mod(i + steps[u], height)][mod(j + steps[v], width)] = amp;
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
            const dt = (newT - oldT) * 1e-3;
            meanAverage = meanAverage + (dt - meanAverage) / it;
            logger.print("FPS: " + (1 / meanAverage));

            let maxWave = Number.MIN_VALUE;
            let minWave = Number.MAX_VALUE;
            let maxAbsSpeed = Number.MIN_VALUE;

            // update wave
            for (let i = 0; i < height; i++) {
                for (let j = 0; j < width; j++) {
                    /**
                     * Sympletic integration
                     */
                    // compute acceleration
                    const laplacian =
                        wave[i][mod(j + 1, width)] +
                        wave[i][mod(j - 1, width)] +
                        wave[mod(i + 1, height)][j] +
                        wave[mod(i - 1, height)][j] -
                        4 * wave[i][j];
                    const acceleration = waveScalarSpeed * laplacian - friction * waveSpeed[i][j];

                    //update speed
                    waveSpeed[i][j] = waveSpeed[i][j] + dt * acceleration;

                    // update position
                    wave[i][j] = wave[i][j] + dt * waveSpeed[i][j];

                    // get max min values of wave
                    maxWave = maxWave <= wave[i][j] ? wave[i][j] : maxWave;
                    minWave = minWave > wave[i][j] ? wave[i][j] : minWave;
                    const absSpeed = Math.abs(waveSpeed[i][j]);
                    maxAbsSpeed = maxAbsSpeed <= absSpeed ? absSpeed : maxAbsSpeed;
                }
            }

            canvas.map((x, y) => {
                let xi = x;
                let yi = y;
                const redColor = (wave[yi][xi] - minWave) / (maxWave - minWave);
                const blueColor = 1 - (wave[yi][xi] - minWave) / (maxWave - minWave);
                const greenColor = Math.abs(waveSpeed[yi][xi]) / maxAbsSpeed;
                return Color.ofRGB(redColor, greenColor, blueColor);
            })
            return {
                it: it + 1,
                oldT: newT,
                time: time + dt,
            };
        })
        .while(() => true)
        .build()
        .play();
}
