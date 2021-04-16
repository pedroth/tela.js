const { Canvas, ImageIO } = Nabla;

let i = 0;
let j = 0;
let t = 0;
const canvas = new Canvas(
  Canvas.createCanvas([window.innerWidth, window.innerHeight], "body")
);
const img = ImageIO.loadImage("../resources/R.png");
const update = function() {
  canvas.clearImage([0, 0, 0, 255]);
  canvas.drawPxl([i, j], [255, 0, 0, 255]);
  canvas.drawPxl([i + 1, j], [255, 0, 0, 255]);
  canvas.drawPxl([i - 1, j], [255, 0, 0, 255]);
  canvas.drawPxl([i, j - 1], [255, 0, 0, 255]);
  canvas.drawPxl([i, j + 1], [255, 0, 0, 255]);

  canvas.drawImage(img, [i + 10, j]);

  canvas.paintImage();

  t++;
  const sizePoints = canvas.getSize();
  i = t % sizePoints[0];
  j = Math.floor(t / sizePoints[0]);
  requestAnimationFrame(update);
};

requestAnimationFrame(update);
