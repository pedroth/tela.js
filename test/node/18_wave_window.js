import { Color, Window, loop } from "../../src/index.node.js";

const width = 640;
const height = 480;
const window = new Window(width, height).onResizeWindow(() => window.paint());
window.setWindowSize(width, height);

const GRID_SIZE = 100;
// utils
const amp = 10;
const spread = 200;
const friction = 0.1;
const waveScalarSpeed = 10;
const mod = (n, m) => ((n % m) + m) % m;
const wave = [...new Array(GRID_SIZE)].map((_, i) =>
  new Float64Array(GRID_SIZE).map((_, j) => {
    const x = (j - GRID_SIZE / 2) / GRID_SIZE;
    const y = (i - GRID_SIZE / 2) / GRID_SIZE;
    return (
      amp * Math.exp(-spread * ((x - 0.25) * (x - 0.25) + y * y)) +
      amp * Math.exp(-spread * ((x + 0.25) * (x + 0.25) + y * y)) +
      amp * Math.exp(-spread * (x * x + (y - 0.25) * (y - 0.25)))
    );
  })
);
const waveSpeed = [...new Array(GRID_SIZE)].map(
  () => new Float64Array(GRID_SIZE)
);

let mousedown = false;
window.onMouseDown(() => {
  mousedown = true;
});

window.onMouseUp(() => {
  mousedown = false;
});

window.onMouseMove((x, y) => {
  if (!mousedown) return;

  const xi = Math.floor((x / width) * GRID_SIZE);
  const yi = Math.floor((y / height) * GRID_SIZE);
  const i = mod(yi - GRID_SIZE + 1, GRID_SIZE);
  const j = mod(xi, GRID_SIZE);
  let steps = [-1, 0, 1];
  // steps = [-2, -1, 0, 1, 2]; // Uncomment this line for bigger paint brush
  const n = steps.length;
  const nn = n * n;
  for (let k = 0; k < nn; k++) {
    const u = Math.floor(k / n);
    const v = k % n;
    wave[mod(i + steps[u], GRID_SIZE)][mod(j + steps[v], GRID_SIZE)] = amp;
  }
});


// start animation
loop(({ dt }) => {
  window.setTitle(`FPS: ${Math.floor(1 / dt)}`);
  let maxWave = Number.MIN_VALUE;
  let minWave = Number.MAX_VALUE;
  let maxAbsSpeed = Number.MIN_VALUE;
  // update wave
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      /**
       * Sympletic integration
       */
      // compute acceleration
      const laplacian =
        wave[i][mod(j + 1, GRID_SIZE)] +
        wave[i][mod(j - 1, GRID_SIZE)] +
        wave[mod(i + 1, GRID_SIZE)][j] +
        wave[mod(i - 1, GRID_SIZE)][j] -
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

  window.map((x, y) => {
    let xi = Math.floor((x / width) * GRID_SIZE);
    let yi = Math.floor((y / height) * GRID_SIZE);
    const range = (maxWave - minWave);
    const t = range === 0 ? 0 : (wave[yi][xi] - minWave) / range;
    const redColor = t;
    const blueColor = 1 - t;
    const greenColor = Math.abs(waveSpeed[yi][xi]) / maxAbsSpeed;
    return Color.ofRGB(redColor, greenColor, blueColor);
  }).paint()
}).play();