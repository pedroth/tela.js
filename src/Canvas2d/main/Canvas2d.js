import BBox from "../../BBox/main/BBox";
import Canvas, { CanvasBuilder } from "../../Canvas/main/Canvas";
import Matrix from "../../Matrix/main/Matrix";
const { vec2 } = Matrix;

export default class Canvas2d extends Canvas {
  constructor(canvas, camera) {
    super(canvas);
    this.camera = camera;
  }

  setCamera(bbox) {
    this.camera = bbox;
  }

  map(lambda = () => {}) {
    return super.map((c, i, j) => {
      const [x, y] = this.forwardCoord(i, j);
      return lambda(c, x, y);
    });
  }

  getPxl(x, y) {
    const [i, j] = this.inverseCoord(x, y);
    return super.getPxl(i, j);
  }

  setPxl(x, y, color) {
    const [i, j] = this.inverseCoord(x, y);
    return super.setPxl(i, j, color);
  }

  drawLine(start, end, shader) {
    const startPos = this.inverseCoord(...start);
    const endPos = this.inverseCoord(...end);
    return super.drawLine(startPos, endPos, shader);
  }

  drawTriangle(p0, p1, p2, shader) {
    const q0 = this.inverseCoord(...p0);
    const q1 = this.inverseCoord(...p1);
    const q2 = this.inverseCoord(...p2);
    return super.drawTriangle(q0, q1, q2, shader);
  }

  /**
   * Map from camera coord to canvas coord
   */
  inverseCoord(x, y) {
    const { min, max } = this.camera;
    const { width, height } = this.canvas;
    const [minX, minY] = min.data;
    const [maxX, maxY] = max.data;
    return [
      (-(y - maxY) * (height - 1)) / (maxY - minY),
      ((x - minX) * (width - 1)) / (maxX - minX),
    ].map(Math.floor);
  }

  /**
   * Map from canvas coord to camera coord
   */
  forwardCoord(i, j) {
    const { min, max } = this.camera;
    const { width, height } = this.canvas;
    const [minX, minY] = min.data;
    const [maxX, maxY] = max.data;
    return [
      minX + ((maxX - minX) * j) / (width - 1),
      maxY + ((minY - maxY) * i) / (height - 1),
    ];
  }

  static builder() {
    return new Canvas2dBuilder();
  }
}

export class Canvas2dBuilder extends CanvasBuilder {
  _camera = new BBox(vec2.of(-1, -1), vec2.of(1, 1));

  camera(bbox = this._camera) {
    this._camera = bbox;
    return this;
  }

  build() {
    const canvasBase = super.build();
    return new Canvas2d(canvasBase.canvas, this._camera);
  }
}
