const { Canvas_old: Canvas, ImageIO } = Tela;

const f = Canvas.simpleShader([0, 255, 0, 255]);
const g = Canvas.simpleShader([0, 0, 255, 255]);
const r = Canvas.simpleShader([255, 0, 0, 255]);

function invertVector(init, v, t) {
  const ans = [];
  ans[0] = init[0] + v[0] * (1 - t) + v[0] * t;
  ans[1] = init[1] + v[1] * (1 - t) - v[1] * t;
  return ans;
}

function giveMeLine(a, u) {
  const points = [];
  points.push([a[0] + u[0], a[1] + u[1]]);
  points.push([a[0] - u[0], a[1] - u[1]]);
  return points;
}

function randomVector(a, b) {
  return [a + (b - a) * Math.random(), a + (b - a) * Math.random()];
}

const triangleShader = Canvas.colorShader([
  [255, 0, 0, 255],
  [0, 255, 0, 255],
  [0, 0, 255, 255],
]);
const canvas = new Canvas(
  Canvas.createCanvas([window.innerWidth, window.innerHeight], "body")
);
const samples = 25;
let avgTime = 0;
let ite = samples;
const size = canvas.getSize();
const animeTriangle = [
  randomVector(0, size[0]),
  randomVector(0, size[0]),
  randomVector(0, size[0]),
];
const average = [0, 0];
const diff = [];
for (let k = 0; k < animeTriangle.length; k++) {
  average[0] += animeTriangle[k][0];
  average[1] += animeTriangle[k][1];
}
average[0] /= 3;
average[1] /= 3;
for (let k = 0; k < animeTriangle.length; k++) {
  diff[k] = [
    animeTriangle[k][0] - average[0],
    animeTriangle[k][1] - average[1],
  ];
}
const animeCircle = randomVector(0, size[0]);

let t = 0;

update = function () {
  if (ite > 0) {
    canvas.drawLine(
      [0, Math.floor(size[0] / 10)],
      [size[1], Math.floor(size[0] / 10)],
      r
    );
    canvas.drawLine(
      [Math.floor(size[1] / 10), 0],
      [Math.floor(size[1] / 10), size[0]],
      g
    );
    canvas.drawLine([0, 0], [size[0] - 1, size[1] - 1], f);

    const first = randomVector(0, size[0]);
    const second = randomVector(0, size[0]);
    const third = randomVector(0, size[0]);
    const time = new Date().getTime();
    canvas.drawTriangle(first, second, third, g);

    avgTime += (new Date().getTime() - time) / 1000;
    canvas.paintImage();
    ite--;
    if (ite == 0) console.log(avgTime / samples);
  } else {
    canvas.clearImage([250, 250, 250, 255]);
    const sin = Math.sin(t / (2 * Math.PI * 10));
    const sinsin = sin * sin;
    canvas.drawTriangle(
      invertVector(average, diff[0], sinsin),
      invertVector(average, diff[1], sinsin),
      invertVector(average, diff[2], sinsin),
      triangleShader
    );

    canvas.drawCircle(animeCircle, sinsin * size[0] * 0.25, g);

    t++;
    canvas.paintImage();
  }
  requestAnimationFrame(update);
};

requestAnimationFrame(update);
