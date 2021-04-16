import Canvas from "./Canvas.js";

//Note that we can switch from heritage to composition, think about that

// cameraSpace : 2-dim array with two 2-dim arrays that are intervals [a,b] | a < b
var Canvas2D = function (canvas, cameraSpace) {
  Canvas.call(this, canvas);
  if (
    cameraSpace.length != 2 ||
    (cameraSpace[0].length != 2 && cameraSpace[1].length != 2)
  ) {
    throw "camera space must be 2-dim array with 2-dim arrays representing an interval";
  }
  this.cameraSpace = cameraSpace;
};

Canvas2D.prototype = Object.create(Canvas.prototype);
Canvas2D.prototype.constructor = Canvas2D;

/* x : 2-dim array in camera space coordinates
 * returns : 2-dim array in integer coordinates
 */
Canvas2D.prototype.integerTransform = function (x) {
  var xint =
    (-(this.canvas.height - 1) /
      (this.cameraSpace[1][1] - this.cameraSpace[1][0])) *
    (x[1] - this.cameraSpace[1][1]);
  var yint =
    ((this.canvas.width - 1) /
      (this.cameraSpace[0][1] - this.cameraSpace[0][0])) *
    (x[0] - this.cameraSpace[0][0]);
  return [xint, yint];
};

/* x : 2-dim array in integer coordinates
 * returns : 2-dim array in camera space coordinates
 */
Canvas2D.prototype.inverseTransform = function (x) {
  var xt =
    this.cameraSpace[0][0] +
    ((this.cameraSpace[0][1] - this.cameraSpace[0][0]) /
      (this.canvas.width - 1)) *
      x[1];
  var yt =
    this.cameraSpace[1][1] -
    ((this.cameraSpace[1][1] - this.cameraSpace[1][0]) /
      (this.canvas.height - 1)) *
      x[0];
  return [xt, yt];
};

/* x1     :   2-dim array
 * x2     :   2-dim array
 * shader :   is a function that receives a 2-dim array and returns a rgba 4-dim array
 */
Canvas2D.prototype.drawLine = function (x1, x2, shader) {
  const y1 = this.integerTransform(x1);
  const y2 = this.integerTransform(x2);
  Canvas.prototype.drawLine.call(this, y1, y2, shader);
};

/* x1     :   2-dim array
 * x2     :   2-dim array
 * x3     :   2-dim array
 * shader :   is a function that receives a 2-dim array and returns a rgba 4-dim array
 */
Canvas2D.prototype.drawTriangle = function (x1, x2, x3, shader) {
  const y1 = this.integerTransform(x1);
  const y2 = this.integerTransform(x2);
  const y3 = this.integerTransform(x3);
  Canvas.prototype.drawTriangle.call(this, y1, y2, y3, shader);
};

/* x1     :   2-dim array
 * x2     :   2-dim array
 * x3     :   2-dim array
 * x4     :   2-dim array
 * shader :   is a function that receives a 2-dim array and returns a rgba 4-dim array
 */
Canvas2D.prototype.drawQuad = function (x1, x2, x3, x4, shader) {
  const y1 = this.integerTransform(x1);
  const y2 = this.integerTransform(x2);
  const y3 = this.integerTransform(x3);
  const y4 = this.integerTransform(x4);
  Canvas.prototype.drawQuad.call(this, y1, y2, y3, y4, shader);
};

Canvas2D.prototype.drawCircle = function (x, r, shader) {
  // it assumes squared canvas, for now ...
  const y = this.integerTransform(x);
  const z = this.integerTransform([r, 0])[1] - this.integerTransform([0, 0])[1];
  Canvas.prototype.drawCircle.call(this, y, z, shader);
};

Canvas2D.prototype.drawImage = function (img, x) {
  Canvas.prototype.drawImage.call(this, img, this.integerTransform(x));
};

Canvas2D.prototype.drawString = function (x, string, contextShader) {
  const y = this.integerTransform(x);
  Canvas.prototype.drawString.call(this, y, string, contextShader);
};

// camera : 2-dim array with two 2-dim arrays that are intervals [a,b] | a < b
Canvas2D.prototype.setCamera = function (camera) {
  if (camera.length != 2 || (camera[0].length != 2 && camera[1].length != 2)) {
    throw "camera space must be 2-dim array with 2-dim arrays representing an interval";
  }
  this.cameraSpace = camera;
};

export default Canvas2D;
