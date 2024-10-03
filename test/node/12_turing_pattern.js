import { Image, Stream, IO, measureTime, Color } from "../../src/index.node.js";
const { saveImageStreamToVideo } = IO;

const width = 640;
const height = 480;
const FPS = 25;
let dt = 1 / FPS;
const maxT = 90;
const mod = (n, m) => ((n % m) + m) % m;
const canvas = Image.ofSize(width, height);

// params
const n = 100;
const spread = 200;
const amp = 1;
const dU = 1.02;
const dV = 0.4;
const F = 0.046;
const K = 0.062;

const U = [...new Array(n)].map(() => new Float64Array(n).map(() => 1));
const V = [...new Array(n)].map((_, i) =>
  new Float64Array(n).map((_, j) => {
    const x = (j - n / 2) / n;
    const y = (i - n / 2) / n;
    return (
      amp * Math.exp(-spread * ((x - 0.25) * (x - 0.25) + y * y)) +
      amp * Math.exp(-spread * ((x + 0.25) * (x + 0.25) + y * y)) +
      amp * Math.exp(-spread * (x * x + (y - 0.25) * (y - 0.25)))
    );
  })
);

const shader = (img) => {
  let maxU = Number.MIN_VALUE;
  let minU = Number.MAX_VALUE;
  let maxV = Number.MIN_VALUE;
  let minV = Number.MAX_VALUE;

  // update wave
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      // Sympletic integration
      // compute acceleration
      let uLaplacian =
        (U[i][mod(j + 1, n)] +
          U[i][mod(j - 1, n)] +
          U[mod(i + 1, n)][j] +
          U[mod(i - 1, n)][j]) /
          4 -
        U[i][j];

      let vLaplacian =
        (V[i][mod(j + 1, n)] +
          V[i][mod(j - 1, n)] +
          V[mod(i + 1, n)][j] +
          V[mod(i - 1, n)][j]) /
          4 -
        V[i][j];

      let ddt = 0.9;
      // update U
      const speedU = dU * uLaplacian - U[i][j] * (V[i][j] * V[i][j]) + F * (1 - U[i][j]);
      U[i][j] = U[i][j] + ddt * speedU;

      // update V
      const speedV = dV * vLaplacian + U[i][j] * (V[i][j] * V[i][j]) - (K + F) * V[i][j];
      V[i][j] = V[i][j] + ddt * speedV;

      // get max min values of wave
      maxU = Math.max(maxU, U[i][j]);
      minU = Math.min(minU, U[i][j]);
      maxV = Math.max(maxV, V[i][j]);
      minV = Math.min(minV, V[i][j]);
    }
  }

  return img.map((x, y) => {
    let xi = Math.floor((x / width) * n);
    let yi = Math.floor((y / height) * n);
    const redColor = (U[yi][xi] - minU) / (maxU - minU);
    const blueColor = (V[yi][xi] - minV) / (maxV - minV);
    return Color.ofRGB(redColor, 0, blueColor);
  });
};

const imageStream = new Stream(
  { time: 0, i: 0, image: canvas },
  ({ time, i, image }) => {
    const newImage = shader(image);
    console.log(`progress: ${Math.floor((time / maxT) * 100)}%`);
    return {
      time: time + dt,
      i: i + 1,
      image: newImage,
    };
  }
);

console.log(
  "Video created in: ",
  await measureTime(async () => {
    await saveImageStreamToVideo("./turing.mp4", imageStream, { fps: FPS }).while(
      ({ time }) => time < maxT
    );
  })
);
