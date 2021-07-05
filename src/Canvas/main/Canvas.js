import Color from "../../Color/main/Color";
import Matrix from "../../Matrix/main/Matrix";
import BBox from "../../BBox/main/BBox";
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
    const index = 4 * (i * width + j);
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
    if ((i < 0 || i >= height) && (j < 0 || j >= width)) return this;
    const index = 4 * (i * width + j);
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
    const { width, height } = this.canvas;
    const line = this._clipLine(start, end);
    const [p0, p1] = line;
    const v = p1.sub(p0);
    const n = v.reduce((e, x) => e + Math.abs(x));
    for (let k = 0; k < n; k++) {
      const x = p0.add(v.scale(k / n)).map(Math.floor);
      const [i, j] = x.data;
      const index = 4 * (i * width + j);
      const color = shader(i, j);
      this.imgBuffer[index] = color.red;
      this.imgBuffer[index + 1] = color.green;
      this.imgBuffer[index + 2] = color.blue;
      this.imgBuffer[index + 3] = color.alpha;
    }
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
    const { width, height } = this.canvas;
    const bbox = new BBox(vec2.ZERO, vec2.of(height, width));
    const pointStack = [start, end].map((x) => vec2.of(...x));
    const inStack = [];
    const outStack = [];
    for (let i = 0; i < pointStack.length; i++) {
      const p = pointStack[i];
      if (bbox.collidesWith(p)) {
        inStack.push(p);
      } else {
        outStack.push(p);
      }
    }
    // both points are inside
    if (inStack.length >= 2) {
      return inStack;
    }
    // one of them is inside
    if (inStack.length === 1) {
      const [inPoint] = inStack;
      const [outPoint] = outStack;
      return this._getLineCanvasIntersection(inPoint, outPoint);
    }
    // both points are outside,need to intersect the boundary
    return this._getLineCanvasIntersection(...outStack);
  }

  /**
   *
   * @param {*} start: vec2(matrix)
   * @param {*} end: vec2(matrix)
   */
  _getLineCanvasIntersection(start, end) {
    const { width, height } = this.canvas;
    const v = end.sub(start);
    // point and direction of boundary
    const boundary = [
      [vec2.ZERO, vec2.of(height, 0)],
      [vec2.of(height, 0), vec2.of(0, width)],
      [vec2.of(height, 0).add(vec2.of(0, width)), vec2.of(-height, 0)],
      [vec2.of(0, width), vec2.of(0, -width)],
    ];
    const intersectionSolutions = [];
    boundary.forEach(([s, d]) => {
      if (d.get(0) === 0) {
        const solution = this._solveLowTriMatrix(v, d.get(1), s.sub(start));
        solution !== undefined && intersectionSolutions.push(solution);
      } else {
        const solution = this._solveUpTriMatrix(v, d.get(0), s.sub(start));
        solution !== undefined && intersectionSolutions.push(solution);
      }
    });
    const validIntersections = [];
    intersectionSolutions.forEach((solution) => {
      const [x, y] = [solution.get(0), solution.get(1)];
      if (0 <= x && x <= 1 && 0 <= y && y <= 1) {
        validIntersections.push(solution);
      }
    });
    if (validIntersections.length === 0) return [];
    return validIntersections.map((solution) => {
      const t = solution.get(0);
      return start.add(v.scale(t));
    });
  }

  /**
   *
   * @param {*} v: vec2
   * @param {*} a: number
   * @param {*} f: vec2
   * @returns vec2
   */
  _solveLowTriMatrix(v, a, f) {
    const v1 = v.get(0);
    const v2 = v.get(1);
    const v12 = v1 * v2;
    if (v12 === 0 || v1 === 0) return undefined;
    const f1 = f.get(0);
    const f2 = f.get(1);
    return vec2.of(f1 / v1, (f2 * v1 - a * f1) / v12);
  }

  /**
   *
   * @param {*} v: vec2
   * @param {*} a: number
   * @param {*} f: vec2
   * @returns vec2
   */
  _solveUpTriMatrix(v, a, f) {
    const v1 = v.get(0);
    const v2 = v.get(1);
    const av2 = a * v2;
    if (av2 === 0 || v2 === 0) return undefined;
    const f1 = f.get(0);
    const f2 = f.get(1);
    return vec2.of(f2 / v2, (f1 * v2 - v1 * f2) / av2);
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
