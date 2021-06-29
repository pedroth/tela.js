import Color from "../../Color/main/Color";
import Matrix from "../../Matrix/main/Matrix";
const { vec2 } = Matrix;
/*
 Canvas coordinates

 0                  W-1
 +-------------> y
 |
 |
 |       *
 |
 |
 v x

 H-1
 */

/*

The point xe_1 + ye_2 corresponds to a point in the middle of a pxl.

The canvas data is an array of length colors(C) * width(W) * height(H). Is a 3D-array.
The index is a number in [0, C * W * H - 1].
Having (x, y, z) where z is the color axis, the formula to index the array is :

f(x, y, z) = C * W * x + C * y + z.

Where x in [0, H - 1], y in [0, W - 1] and z in [0, C - 1].

Note that f(H - 1, W - 1, C - 1) = C * W * H - 1.
*/

export default class Canvas {
  /**
   *
   * @param {*} canvas: DOM element of type canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.image = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
    // width * height * 4 array of integers
    this.imgBuffer = this.image.data;
  }

  getCanvas() {
    return this.canvas;
  }

  getDom = this.getCanvas;

  //========================================================================================
  /*                                                                                      *
   *                                 side effects function                                *
   *                                                                                      */
  //========================================================================================

  /**
   * Update color of canvas
   * @param {*} color: Color
   */
  fill(color) {
    this.ctx.fillStyle = `rgba(${color.red}, ${color.green}, ${color.blue}, ${
      color.alpha / 255.0
    })`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.image = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    this.imgBuffer = this.image.data;
    return this;
  }

  /**
   *
   * @param {*} lambda: (Color,x:number,y:number) => Color
   */
  map(lambda = () => {}) {
    const n = this.imgBuffer.length;
    const { width: w } = this.canvas;
    for (let i = 0; i < n; i += 4) {
      const x = Math.floor(i / (4 * w));
      const y = Math.floor(i / 4) % w;
      const color = lambda(
        Color.ofRGBA(
          this.imgBuffer[i],
          this.imgBuffer[i + 1],
          this.imgBuffer[i + 2],
          this.imgBuffer[i + 3]
        ),
        x,
        y
      );
      this.imgBuffer[i] = color.red;
      this.imgBuffer[i + 1] = color.green;
      this.imgBuffer[i + 2] = color.blue;
      this.imgBuffer[i + 3] = color.alpha;
    }
    return this;
  }

  /**
   * Return pxl color at (i,j)
   * @param {*} i: integer \in [0,H-1]
   * @param {*} j: integer \in [0,W-1]
   * @returns color
   */
  getPxl(i, j) {
    const { width, height } = this.canvas;
    if ((i < 0 || i >= height) && (j < 0 || j >= width))
      return new CanvasException("pxl out of bounds");
    const w = width * 4;
    const index = i * w + 4 * j;
    return Color.ofRGBA(
      this.imgBuffer[index],
      this.imgBuffer[index + 1],
      this.imgBuffer[index + 2],
      this.imgBuffer[index + 3]
    );
  }

  /**
   * Set pxl color at (i,j)
   * @param {*} i: integer \in [0,H-1]
   * @param {*} j: integer \in [0,W-1]
   * @param {*} color
   */
  setPxl(i, j, color) {
    const { width, height } = this.canvas;
    if ((i < 0 || i >= height) && (j < 0 || j >= width)) return;
    const w = width * 4;
    const index = i * w + 4 * j;
    this.imgBuffer[index] = color.red;
    this.imgBuffer[index + 1] = color.green;
    this.imgBuffer[index + 2] = color.blue;
    this.imgBuffer[index + 3] = color.alpha;
    return this;
  }

  /**
   *
   * @param {*} start: 2-Array
   * @param {*} end: 2-Array
   * @param {}
   */
  drawLine(start, end, shader = (x, y) => Color.ofRGBA(0, 0, 0)) {
    let line = this._clipLine(start, end);
    const [p0, p1] = line;
    const v = p1.sub(p0);
    const n = v.reduce((e, x) => e + Math.abs(x));
    for (let i = 0; i < n; i++) {}
    return this;
  }

  paint() {
    this.ctx.putImageData(this.image, 0, 0);
  }

  //========================================================================================
  /*                                                                                      *
   *                                  Auxiliary functions                                  *
   *                                                                                      */
  //========================================================================================

  /**
   *
   * @param {*} start: 2-Array<Number>
   * @param {*} end: 2-Array<Number>
   * @returns 2-Array<vec2>
   */
  _clipLine(start, end) {
    // both points are inside
    // one of them is inside
    // both points are outside
    //    but intersect the boundary
  }

  //========================================================================================
  /*                                                                                      *
   *                                   Static functions                                   *
   *                                                                                      */
  //========================================================================================

  static builder() {
    return new CanvasBuilder();
  }
}

class CanvasBuilder {
  _canvas = document.createElement("canvas");
  _width = 500;
  _height = 500;
  constructor() {}

  width(width) {
    this._width = width;
    return this;
  }

  height(height) {
    this._height = height;
    return this;
  }

  build() {
    this._canvas.setAttribute("width", this._width);
    this._canvas.setAttribute("height", this._height);
    return new Canvas(this._canvas);
  }
}

export class CanvasException extends Error {}
