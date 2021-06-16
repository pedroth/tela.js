const { Canvas2D, Canvas } = Tela;

const f = Canvas.simpleShader([0, 255, 0, 255]);
const g = Canvas.simpleShader([0, 0, 255, 255]);
const r = Canvas.simpleShader([255, 0, 0, 255]);

function giveMeLine(a, u) {
  const points = [];
  points.push([a[0] + u[0], a[1] + u[1]]);
  points.push([a[0] - u[0], a[1] - u[1]]);
  return points;
}

function randomVector(a, b) {
  return [a + (b - a) * Math.random(), a + (b - a) * Math.random()];
}

const canvas = new Canvas2D(
  Canvas.createCanvas([window.innerWidth, window.innerHeight], "body"),
  [
    [-1, 1],
    [-1, 1],
  ]
);

let isFirstIte = true;
const a = [-1, 1];
const v = [0.1, 0.1];
const n = [1, -1];
const speed = 0.01;
const points = giveMeLine(a, v);

const colorInterShader = function (x, line, canvas, t) {
  const c1 = [0, 0, 0, 255];
  const c2 = [255, 255, 255, 255];
  const gradient = [c2[0] - c1[0], c2[1] - c1[1], c2[2] - c1[2], c2[3] - c1[3]];
  canvas.drawPxl(x, [
    c1[0] + gradient[0] * t,
    c1[1] + gradient[1] * t,
    c1[2] + gradient[2] * t,
    c1[3] + gradient[3] * t,
  ]);
};

const update = function () {
  if (isFirstIte) {
    const samples = 100;
    for (let i = 0; i < samples; i++) {
      const first = randomVector(-1, 1);
      const second = randomVector(-1, 1);
      canvas.drawLine(first, second, f);
    }

    for (let i = 0; i < samples; i++) {
      const first = randomVector(-3, 3);
      const second = randomVector(-3, 3);
      canvas.drawLine(first, second, g);
    }

    canvas.drawLine([0, 0], [2, 2], r);
    canvas.drawLine(
      [0, 0],
      [-2, -2],
      Canvas.interpolateLineShader(colorInterShader)
    );
    canvas.paintImage();
    isFirstIte = false;
  } else {
    canvas.drawLine(
      points[0],
      points[1],
      Canvas.interpolateLineShader(colorInterShader)
    );

    points[0] = [points[0][0] + speed * n[0], points[0][1] + speed * n[1]];
    points[1] = [points[1][0] + speed * n[0], points[1][1] + speed * n[1]];

    canvas.paintImage();
  }
  requestAnimationFrame(update);
};

requestAnimationFrame(update);
