import Color from "../Color/Color";
import { MAX_8BIT } from "../Utils/Constants";
import { clipLine } from "../Utils/Math";
import Box from "../Box/Box"
import { Vec2 } from "../Vector/Vector";

export default class Canvas {

  constructor(canvas) {
    this._canvas = canvas;
    this._width = canvas.width;
    this._height = canvas.height;
    this._ctx = this._canvas.getContext("2d", { willReadFrequently: true });
    this._imageData = this._ctx.getImageData(0, 0, this._width, this._height);
    this._image = this._imageData.data;
  }

  get width() {
    return this._canvas.width;
  }

  get height() {
    return this._canvas.height;
  }

  get DOM() {
    return this._canvas;
  }

  /**
    * color: Color 
    */
  fill(color) {
    return this.map(() => color);
  }

  /**
   * lambda: (x: Number, y: Number, c: color) => Color 
   */
  map(lambda) {
    const n = this._image.length;
    const w = this._width;
    const h = this._height;
    for (let k = 0; k < n; k += 4) {
      const i = Math.floor(k / (4 * w));
      const j = Math.floor((k / 4) % w);
      const x = j;
      const y = h - 1 - i;
      const color = lambda(x, y);
      if (!color) return;
      this._image[k] = color.red * MAX_8BIT;
      this._image[k + 1] = color.green * MAX_8BIT;
      this._image[k + 2] = color.blue * MAX_8BIT;
      this._image[k + 3] = MAX_8BIT;
    }
    return this.paint();
  }

  setPxl(x, y, color) {
    const w = this._width;
    const h = this._height;
    const j = x;
    const i = h - 1 - y;
    let index = 4 * (w * i + j);
    this._image[index] = color.red * MAX_8BIT;
    this._image[index + 1] = color.green * MAX_8BIT;
    this._image[index + 2] = color.blue * MAX_8BIT;
    this._image[index + 3] = MAX_8BIT;
    return this;
  }

  getPxl(x, y) {
    const w = this._width;
    const h = this._height;
    const j = x;
    const i = h - 1 - y;
    let index = 4 * (w * i + j);
    return Color.ofRGBRaw(this._image[index], this._image[index + 1], this._image[index + 2]);
  }

  drawLine(p1, p2, shader) {
    const w = this._width;
    const h = this._height;
    const line = clipLine(p1, p2, new Box(Vec2(0, 0), Vec2(w, h)));
    if (line.length <= 1) return;
    const [pi, pf] = line;
    const v = pf.sub(pi);
    const n = v.map(Math.abs).fold((e, x) => e + x);
    for (let k = 0; k < n; k++) {
      const s = k / n;
      const lineP = pi.add(v.scale(s)).map(Math.floor);
      const [x, y] = lineP.toArray();
      const j = x;
      const i = h - 1 - y;
      const index = 4 * (i * w + j);
      const color = shader(x, y);
      if (!color) continue;
      this._image[index] = color.red * MAX_8BIT;
      this._image[index + 1] = color.green * MAX_8BIT;
      this._image[index + 2] = color.blue * MAX_8BIT;
      this._image[index + 3] = 255;
    }
    return this;
  }


  drawTriangle(x1, x2, x3, shader) {
    return drawConvexPolygon(this, [x1, x2, x3], shader);
  }

  paint() {
    this._ctx.putImageData(this._imageData, 0, 0);
    return this;
  }

  onMouseDown(lambda) {
    this._canvas.addEventListener("mousedown", handleMouse(this, lambda), false);
    this._canvas.addEventListener("touchstart", handleMouse(this, lambda), false);
    return this;
  }

  onMouseUp(lambda) {
    this._canvas.addEventListener("mouseup", handleMouse(this, lambda), false);
    this._canvas.addEventListener("touchend", handleMouse(this, lambda), false);
    return this;
  }

  onMouseMove(lambda) {
    this._canvas.addEventListener("mousemove", handleMouse(this, lambda), false);
    this._canvas.addEventListener("touchmove", handleMouse(this, lambda), false);
    return this;
  }

  onMouseWheel(lambda) {
    this._canvas.addEventListener("wheel", lambda, false)
  }

  resize(width, height) {
    this._canvas.width = width;
    this._canvas.height = height;
    this._width = this._canvas.width;
    this._height = this._canvas.height;
    this._ctx = this._canvas.getContext("2d", { willReadFrequently: true });
    this._imageData = this._ctx.getImageData(0, 0, this._width, this._height);
    this._image = this._imageData.data;
  }

  startVideoRecorder() {
    let responseBlob;
    const canvasSnapshots = [];
    const stream = this._canvas.captureStream();
    const recorder = new MediaRecorder(stream);
    recorder.addEventListener("dataavailable", e => canvasSnapshots.push(e.data));
    recorder.start();
    recorder.onstop = () => (responseBlob = new Blob(canvasSnapshots, { type: 'video/webm' }));
    return {
      stop: () => new Promise((re) => {
        recorder.stop();
        setTimeout(() => re(responseBlob));
      })
    };
  }

  //========================================================================================
  /*                                                                                      *
   *                                         UTILS                                        *
   *                                                                                      */
  //========================================================================================


  grid2canvas(i, j) {
    const h = this.height;
    const x = j;
    const y = h - 1 - i;
    return [x, y]
  }

  canvas2grid(x, y) {
    const h = this.height;
    const j = x;
    const i = h - 1 - y;
    return [i, j];
  }

  //========================================================================================
  /*                                                                                      *
   *                                    Static Methods                                    *
   *                                                                                      */
  //========================================================================================


  static ofSize(width, height) {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
    return new Canvas(canvas);
  }

  static ofDOM(canvasDOM) {
    return new Canvas(canvasDOM);
  }

  static ofCanvas(canvas) {
    return new Canvas(canvas._canvas);
  }

  static ofUrl(url) {
    return new Promise((resolve) => {
      const img = document.createElement("img");
      img.src = url;
      img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(Canvas.ofDOM(canvas));
      };
    });
  }

  static ofImageUrl(url) {
    return new Promise((resolve) => {
      const img = new Image(); // DOM image
      img.src = url;
      img.onload = () => {
        const canvasAux = document.createElement("canvas");
        canvasAux.width = img.width;
        canvasAux.height = img.height;
        const contextAux = canvasAux.getContext("2d");
        contextAux.fillStyle = "rgba(0, 0, 0, 0)";
        contextAux.globalCompositeOperation = "source-over";
        contextAux.fillRect(0, 0, canvasAux.width, canvasAux.height);
        contextAux.drawImage(img, 0, 0);
        resolve(new Canvas(canvasAux));
      }
    });
  }
}


function drawConvexPolygon(canvas, positions, shader) {
  const { width, height } = canvas;
  const canvasBox = new Box(Vec2(), Vec2(width, height));
  let boundingBox = Box.EMPTY;
  positions.forEach((x) => {
    boundingBox = boundingBox.add(new Box(x, x));
  });
  const finalBox = canvasBox.intersection(boundingBox);
  if (finalBox.isEmpty) return canvas;
  const [xMin, yMin] = finalBox.min.toArray();
  const [xMax, yMax] = finalBox.max.toArray();

  for (let x = xMin; x < xMax; x++) {
    for (let y = yMin; y < yMax; y++) {
      if (isInsideConvex(Vec2(x, y), positions)) {
        const j = x;
        const i = height - 1 - y;
        const color = shader(x, y);
        if (!color) continue;
        const index = 4 * (i * width + j);
        canvas._image[index] = color.red * MAX_8BIT;
        canvas._image[index + 1] = color.green * MAX_8BIT;
        canvas._image[index + 2] = color.blue * MAX_8BIT;
        canvas._image[index + 3] = MAX_8BIT;
      }
    }
  }
  return canvas;
}




function isInsideConvex(x, positions) {
  const m = positions.length;
  const v = [];
  const vDotN = [];
  for (let i = 0; i < m; i++) {
    const p1 = positions[(i + 1) % m];
    const p0 = positions[i];
    v[i] = p1.sub(p0);
    const vi = v[i];
    const n = Vec2(-vi.y, vi.x);
    const r = x.sub(p0);
    vDotN[i] = r.dot(n);
  }
  let orientation = v[0].x * v[1].y - v[0].y * v[1].x >= 0 ? 1 : -1;
  for (let i = 0; i < m; i++) {
    const myDot = vDotN[i] * orientation;
    if (myDot < 0) return false;
  }
  return true;
}


function handleMouse(canvas, lambda) {
  return event => {
    const h = canvas.height;
    const w = canvas.width;
    const rect = canvas._canvas.getBoundingClientRect();
    // different coordinates from canvas DOM image data
    const mx = (event.clientX - rect.left) / rect.width, my = (event.clientY - rect.top) / rect.height;
    const x = Math.floor(mx * w);
    const y = Math.floor(h - 1 - my * h);
    return lambda(x, y);
  }
}