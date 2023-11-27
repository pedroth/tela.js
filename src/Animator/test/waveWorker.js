const isGithub = location.host === "pedroth.github.io";
const BASE_URL = isGithub ? "/tela.js" : ""

await import(BASE_URL + "/dist/index.js");
const {Animator} = Tela;
const mod = (n, m) => ((n % m) + m) % m;

const waveSimulation = ({
  T,
  dt,
  width,
  height,
  amp,
  friction,
  waveScalarSpeed,
}) => {
  const wavesSnapshots = [];
  const middleIndex = [Math.floor(height / 2), Math.floor(width / 2)];
  const waveInitialCond = [...new Array(height)].map((_, i) =>
    new Float64Array(width).map((_, j) => {
      const x = (j - width / 2) / width;
      const y = (i - height / 2) / height;
      return amp * Math.exp(-100 * (x * x + y * y));
    })
  );
  const waveSpeedInitialCond = [...new Array(height)].map(
    () => new Float64Array(width)
  );

  Animator.builder()
    .initialState({
      time: 0,
      wave: waveInitialCond,
      waveSpeed: waveSpeedInitialCond,
    })
    .nextState(({ time, wave, waveSpeed }) => {
      // get max min values of wave
      let maxWave = Number.MIN_VALUE;
      let minWave = Number.MAX_VALUE;
      let maxAbsSpeed = Number.MIN_VALUE;
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          maxWave = maxWave <= wave[i][j] ? wave[i][j] : maxWave;
          minWave = minWave > wave[i][j] ? wave[i][j] : minWave;
          const absSpeed = Math.abs(waveSpeed[i][j]);
          maxAbsSpeed = maxAbsSpeed <= absSpeed ? absSpeed : maxAbsSpeed;
        }
      }
      wavesSnapshots.push({
        time,
        wave,
        waveSpeed,
        maxWave,
        minWave,
        maxAbsSpeed,
      });
      console.debug(`completed animation ${time / T}`);
      // simulate wave
      const newTime = time + dt;
      const newWave = [...new Array(height)].map(() => new Float64Array(width));
      const newWaveSpeed = [...new Array(height)].map(
        () => new Float64Array(width)
      );
      /**
       * Sympletic integration
       */
      const dx = 1;
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          const laplacian =
            wave[i][mod(j + 1, width)] +
            wave[i][mod(j - 1, width)] +
            wave[mod(i + 1, height)][j] +
            wave[mod(i - 1, height)][j] -
            4 * wave[i][j];
          const acceleration =
            waveScalarSpeed * laplacian - friction * waveSpeed[i][j];
          // update speed
          newWaveSpeed[i][j] = waveSpeed[i][j] + dt * acceleration;
          // update position
          newWave[i][j] = wave[i][j] + dt * newWaveSpeed[i][j];
        }
      }
      return { time: newTime, wave: newWave, waveSpeed: newWaveSpeed };
    })
    .while(({ time }) => time < T)
    .build()
    .run();
  return wavesSnapshots;
};

onmessage = (msg) => {
  console.log(`Worker: Message received from main script`, msg.data);
  postMessage({ waveSnapshots: waveSimulation(msg.data) });
};
