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
    return super.map((i, j) => {
      const [x, y] = this.forwardCoord(i, j);
      return lambda(x, y);
    });
  }

  getPxl(x, y) {
    const [i, j] = this.inverseCoord(x, y);
    return super.getPxl(i, j);
  }

  setPxl(x, y, color) {}

  drawLine(start, end, shader) {
    return super.drawLine(startPos, endPos, shader);
  }

  drawTriangle(p0, p1, p2, shader) {
    return super.drawTriangle(p0, p1, p2, shader);
  }

  /**
   * Map from camera coord to canvas coord
   */
  inverseCoord(x, y) {}

  /**
   * Map from canvas coord to camera coord
   */
  forwardCoord(i, j) {}

  builder() {
    return new Canvas2dBuilder();
  }
}

export class Canvas2dBuilder extends CanvasBuilder {
  _camera = new BBox(vec2.of(-1, -1), vec2.of(1, 1));
  constructor() {}

  camera(bbox = this._camera) {
    this._camera = bbox;
    return this;
  }

  build() {
    const canvasBase = super.build();
    return new Canvas2d(canvasBase.canvas, this._camera);
  }
}
