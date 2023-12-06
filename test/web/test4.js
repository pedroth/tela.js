(canvas, fps) => {
    // resize incoming canvas:Canvas object.
    const width = 100;
    const height = 100;
    canvas.resize(width, height);
    // utils
    const T = 100;
    const amp = 10;
    const spread = 200;
    const friction = 0.1;
    const waveScalarSpeed = 10;
    const mod = (n, m) => ((n % m) + m) % m;
    const wave = [...new Array(height)].map((_, i) =>
        new Float64Array(width).map((_, j) => {
            const x = (j - width / 2) / width;
            const y = (i - height / 2) / height;
            return (
                amp * Math.exp(-spread * ((x - 0.25) * (x - 0.25) + y * y)) +
                amp * Math.exp(-spread * ((x + 0.25) * (x + 0.25) + y * y)) +
                amp * Math.exp(-spread * (x * x + (y - 0.25) * (y - 0.25)))
            );
        })
    );
    const waveSpeed = [...new Array(height)].map(
        () => new Float64Array(width)
    );
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
            fps(dt, it)

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
        .while(({ time }) => time <= T)
        .build()
        .play();
}
