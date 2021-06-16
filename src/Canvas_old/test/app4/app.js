const { Canvas2D_old: Canvas2D, Canvas_old: Canvas, ImageIO } = Tela;
const canvas = new Canvas2D(
  Canvas.createCanvas([window.innerWidth, window.innerHeight], "body"),
  [
    [-1, 1],
    [-1, 1],
  ]
);
let oldTime = new Date().getTime();

const texture = ImageIO.loadImage("../resources/R.png");
let t = 0;
const quad = [
  [-0.25, -0.25],
  [0.45, -0.25],
  [0.25, 0.45],
  [-0.25, 0.25],
];
const textIsReady = ImageIO.generateImageReadyPredicate(texture);
const textShader = Canvas.quadTextureShader(texture, [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
]);
const defaultShader = Canvas.simpleShader([255, 0, 255, 255]);

const update = function () {
  const dt = 1e-3 * (new Date().getTime() - oldTime);
  oldTime = new Date().getTime();

  canvas.clearImage([0, 0, 0, 255]);

  canvas.drawString([-0.95, 0.9], "FPS : " + 1 / dt, function (ctx) {
    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
  });

  const cos = Math.cos(3 * t);
  const coscos = 0.5 * cos * cos;

  const transformQuad = [];
  for (let i = 0; i < quad.length; i++) {
    transformQuad.push([coscos * quad[i][0], coscos * quad[i][1]]);
  }

  canvas.drawQuad(
    transformQuad[0],
    transformQuad[1],
    transformQuad[2],
    transformQuad[3],
    textIsReady() ? textShader : defaultShader
  );
  t += dt;
  canvas.paintImage();
  requestAnimationFrame(update);
};

requestAnimationFrame(update);
