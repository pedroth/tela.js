import { Color, Window, loop } from "../../src/index.node.js";

const width = 640;
const height = 480;
const window = new Window(width, height).onResizeWindow(() => window.paint());
window.setWindowSize(width, height);

const width_sim = 100;
const height_sim = 100;
// utils
const amp = 10;
const spread = 200;
const friction = 0.1;
const waveScalarSpeed = 10;
const mod = (n, m) => ((n % m) + m) % m;
const wave = [...new Array(height_sim)].map((_, i) =>
  new Float64Array(width_sim).map((_, j) => {
    const x = (j - width_sim / 2) / width_sim;
    const y = (i - height_sim / 2) / height_sim;
    return (
      amp * Math.exp(-spread * ((x - 0.25) * (x - 0.25) + y * y)) +
      amp * Math.exp(-spread * ((x + 0.25) * (x + 0.25) + y * y)) +
      amp * Math.exp(-spread * (x * x + (y - 0.25) * (y - 0.25)))
    );
  })
);
const waveSpeed = [...new Array(height_sim)].map(
  () => new Float64Array(width_sim)
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

  const xi = Math.floor((x / width) * width_sim);
  const yi = Math.floor((y / height) * height_sim);
  const i = mod(yi - height_sim + 1, height_sim);
  const j = mod(xi, width_sim);
  let steps = [-1, 0, 1];
  // steps = [-2, -1, 0, 1, 2]; // Uncomment this line for bigger paint brush
  const n = steps.length;
  const nn = n * n;
  for (let k = 0; k < nn; k++) {
    const u = Math.floor(k / n);
    const v = k % n;
    wave[mod(i + steps[u], height_sim)][mod(j + steps[v], width_sim)] = amp;
  }
});


// start animation
loop(({ dt }) => {
  window.setTitle(`FPS: ${Math.floor(1 / dt)}`);
  let maxWave = Number.MIN_VALUE;
  let minWave = Number.MAX_VALUE;
  let maxAbsSpeed = Number.MIN_VALUE;
  // update wave
  for (let i = 0; i < height_sim; i++) {
    for (let j = 0; j < width_sim; j++) {
      /**
       * Sympletic integration
       */
      // compute acceleration
      const laplacian =
        wave[i][mod(j + 1, width_sim)] +
        wave[i][mod(j - 1, width_sim)] +
        wave[mod(i + 1, height_sim)][j] +
        wave[mod(i - 1, height_sim)][j] -
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
    let xi = Math.floor(x / width * width_sim);
    let yi = Math.floor(y / height * height_sim);
    const redColor = (wave[yi][xi] - minWave) / (maxWave - minWave);
    const blueColor = 1 - (wave[yi][xi] - minWave) / (maxWave - minWave);
    const greenColor = Math.abs(waveSpeed[yi][xi]) / maxAbsSpeed;
    return Color.ofRGB(redColor, greenColor, blueColor);
  }).paint()
}).play();