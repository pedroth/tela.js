import Color from "../../Color/main/Color";
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

The image data is an array of length colors(C) * width(W) * height(H). Is a 3D-array.
The index is a number in [0, C * W * H - 1].
Having (x, y, z) where z is the color axis, the formula to index the array is :

f(x, y, z) = C * W * x + C * y + z.

Where x in [0, H - 1], y in [0, W - 1] and z in [0, C - 1].

Note that f(H - 1, W - 1, C - 1) = C * W * H - 1.
*/

class ImageBuffer {
  /**
   *
   * @param {Uint8Array} imageBuffer
   * @param {Number} width
   * @param {Number} height
   */
  constructor(imageBuffer, width, height) {
    if (4 * width * height !== imageBuffer.length) {
      throw new ImageBufferException(
        `Image buffer with width ${width} and height ${height}, must have length 4 * width * height, actually have ${imageBuffer.length}`
      );
    }
    this.data = imageBuffer;
    this.width = width;
    this.height = height;
  }

  /**
   * Return pxl color at (i,j)
   * @param {Number} i: integer \in [0,H-1]
   * @param {Number} j: integer \in [0,W-1]
   * @returns {Color} color
   */
  getPxl(i, j) {
    const { width, height } = this;
    if (i < 0 || i >= height || j < 0 || j >= width) {
      return undefined;
    }
    const index = 4 * (i * width + j);
    return Color.ofRGBARaw(
      this.data[index],
      this.data[index + 1],
      this.data[index + 2],
      this.data[index + 3]
    );
  }

  //========================================================================================
  /*                                                                                      *
   *                                 side effects function                                *
   *                                                                                      */
  //========================================================================================

  /**
   * Set pxl color at (i,j)
   * @param {Number} i: integer \in [0,H-1]
   * @param {Number} j: integer \in [0,W-1]
   * @param {Color} color
   */
  setPxl(i, j, color) {
    const { width, height } = this;
    if (i < 0 || i >= height || j < 0 || j >= width) return this;
    const index = 4 * (i * width + j);
    this.data[index] = color.red;
    this.data[index + 1] = color.green;
    this.data[index + 2] = color.blue;
    this.data[index + 3] = color.alpha;
    return this;
  }

  /**
   * Map function
   * @param {(Color,Number,Number) => Color} lambda
   */
  map(lambda = () => {}) {
    const n = this.data.length;
    const w = this.width;
    for (let i = 0; i < n; i += 4) {
      const x = Math.floor(i / (4 * w));
      const y = Math.floor(i / 4) % w;
      const color = lambda(
        Color.ofRGBARaw(
          this.data[i],
          this.data[i + 1],
          this.data[i + 2],
          this.data[i + 3]
        ),
        x,
        y
      );
      this.data[i] = color.red;
      this.data[i + 1] = color.green;
      this.data[i + 2] = color.blue;
      this.data[i + 3] = color.alpha;
    }
    return this;
  }

  /**
   * Update color of canvas
   * @param {Color} color
   */
  fill(color = Color.ofRGBA(255, 255, 255)) {
    return this.map(() => color);
  }

  /**
   *
   * @param {Array<Number>} start: 2-Array
   * @param {Array<Number>} end: 2-Array
   * @param {(Number, Number) => Color} shader
   * @param {Canvas}
   */
  drawLine(start, end, shader = (x, y) => Color.ofRGBA(0, 0, 0)) {
    // faster than using vec2
    const { width, _ } = this;
    const line = this._clipLine(start, end).map((x) => x.toArray());
    if (line.length === 0) return;
    const [p0, p1] = line;
    const v = [p1[0] - p0[0], p1[1] - p0[1]];
    const n = Math.abs(v[0]) + Math.abs(v[1]);
    for (let k = 0; k < n; k++) {
      const s = k / n;
      const x = [p0[0] + v[0] * s, p0[1] + v[1] * s].map(Math.floor);
      const [i, j] = x;
      const index = 4 * (i * width + j);
      const color = shader(i, j);
      this.data[index] = color.red;
      this.data[index + 1] = color.green;
      this.data[index + 2] = color.blue;
      this.data[index + 3] = color.alpha;
    }
    return this;
  }

  /**
   *
   * @param {Array<Number>} p0 : 2-array<number>
   * @param {Array<Number>} p1 : 2-array<number>
   * @param {Array<Number>} p2 : 2-array<number>
   * @param {(Number, Number) => Color} shader : (number, number) => Color
   * @returns
   */
  drawTriangle(p0, p1, p2, shader = (x, y) => Color.ofRGBA(0, 0, 0)) {
    return this._drawConvexPolygon([p0, p1, p2], shader);
  }

  //========================================================================================
  /*                                                                                      *
   *                                  Auxiliary functions                                  *
   *                                                                                      */
  //========================================================================================
  /**
   *
   * @param {*} arrayOfPoints : Array<2-Array<Number>>
   * @param {*} shader : (x,y) => color
   * @returns
   */
  _drawConvexPolygon(arrayOfPoints, shader) {
    const { width, height } = this;
    const canvasBox = new BBox(vec2.ZERO, vec2.of(height, width));
    let boundingBox = BBox.EMPTY;
    arrayOfPoints.forEach((x) => {
      boundingBox = boundingBox.add(BBox.ofPoint(...x));
    });
    const finalBox = canvasBox.inter(boundingBox);
    const [xMin, yMin] = finalBox.min.toArray();
    const [xMax, yMax] = finalBox.max.toArray();

    for (let i = xMin; i < xMax; i++) {
      for (let j = yMin; j < yMax; j++) {
        if (this._isInsideConvex([i, j], arrayOfPoints)) {
          const color = shader(i, j);
          const index = 4 * (i * width + j);
          this.data[index] = color.red;
          this.data[index + 1] = color.green;
          this.data[index + 2] = color.blue;
          this.data[index + 3] = color.alpha;
        }
      }
    }
    return this;
  }

  /**
   *
   * @param {*} x: 2-Array<Number>
   * @param {*} points: Array<2-Array<Number>>
   * @returns
   */
  _isInsideConvex(x, points) {
    const m = points.length;
    const v = [];
    const vDotN = [];
    for (let i = 0; i < m; i++) {
      const p1 = points[(i + 1) % m];
      const p0 = points[i];
      v[i] = [p1[0] - p0[0], p1[1] - p0[1]];
      const vi = v[i];
      const n = [-vi[1], vi[0]];
      const r = [x[0] - p0[0], x[1] - p0[1]];
      vDotN[i] = r[0] * n[0] + r[1] * n[1];
    }
    let orientation = v[0][0] * v[1][1] - v[0][1] * v[1][0] >= 0 ? 1 : -1;
    for (let i = 0; i < m; i++) {
      const myDot = vDotN[i] * orientation;
      if (myDot < 0) return false;
    }
    return true;
  }

  /**
   *
   * @param {*} start: 2-Array<Number>
   * @param {*} end: 2-Array<Number>
   * @returns 2-Array<2-Array<Number>>
   */
  _clipLine(start, end) {
    const { width, height } = this;
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
      return [inPoint, ...this._getLineCanvasIntersection(inPoint, outPoint)];
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
    const { width, height } = this;
    const v = end.sub(start);
    // point and direction of boundary
    const boundary = [
      [vec2.ZERO, vec2.of(height, 0)],
      [vec2.of(height, 0), vec2.of(0, width)],
      [vec2.of(height, width), vec2.of(-height, 0)],
      [vec2.of(0, width), vec2.of(0, -width)],
    ];
    const intersectionSolutions = [];
    boundary.forEach(([s, d]) => {
      if (d.get(0) === 0) {
        const solution = this._solveLowTriMatrix(v, -d.get(1), s.sub(start));
        solution !== undefined && intersectionSolutions.push(solution);
      } else {
        const solution = this._solveUpTriMatrix(v, -d.get(0), s.sub(start));
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
    const av1 = a * v1;
    if (av1 === 0 || v1 === 0) return undefined;
    const f1 = f.get(0);
    const f2 = f.get(1);
    return vec2.of(f1 / v1, (f2 * v1 - v2 * f1) / av1);
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
   *                                 static functions                                     *
   *                                                                                      */
  //========================================================================================

  static builder() {
    return new ImageBufferBuilder();
  }
}

export default ImageBuffer;

export class ImageBufferBuilder {
  _width = 500;
  _height = 500;
  constructor() {}

  width(width = this._width) {
    this._width = width;
    return this;
  }

  height(height = this._height) {
    this._height = height;
    return this;
  }

  build() {
    return new ImageBuffer(
      new Uint8Array(this._width * this._height * 4),
      this._width,
      this._height
    );
  }
}

export class ImageBufferException extends Error {}
