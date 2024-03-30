import Color from "../Color/Color.js";
import { MAX_8BIT } from "../Utils/Constants.js";
import { clipLine, isInsideConvex, mod, clamp } from "../Utils/Math.js";
import Box from "../Box/Box.js"
import { Vec2 } from "../Vector/Vector.js";
import { memoize } from "../Utils/Utils.js";

export default class Canvas {

  constructor(canvas) {
    this._canvas = canvas;
    this._width = canvas.width;
    this._height = canvas.height;
    this._ctx = this._canvas.getContext("2d", { willReadFrequently: true });
    this._imageData = this._ctx.getImageData(0, 0, this._width, this._height);
    this._image = this._imageData.data; // by changing this, imageData is change magically
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
   * lambda: (x: Number, y: Number) => Color
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

  /**
    * color: Color
    */
  fill(color) {
    return this.map(() => color);
  }

  setPxl(x, y, color) {
    const w = this._width;
    const [i, j] = this.canvas2grid(x, y);
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
    let [i, j] = this.canvas2grid(x, y);
    i = mod(i, h);
    j = mod(j, w);
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

  mapParallel(lambda, dependencies = [], vars = {}) {
    return new Promise((resolve) => {
      const n = this._image.length;
      const w = this._width;
      const h = this._height;
      const N = navigator.hardwareConcurrency;
      const fun = ({ _start_, _end_, _width_, _height_, _worker_id_, _vars_ }) => {
        const image = Array(_end_ - _start_ + 1).fill();
        let index = 0;
        for (let k = _start_; k < _end_; k += 4) {
          const i = Math.floor(k / (4 * _width_));
          const j = Math.floor((k / 4) % _width_);
          const x = j;
          const y = _height_ - 1 - i;
          const color = lambda(x, y, { ..._vars_ });
          if (!color) return;
          image[index] = color.red;
          image[index + 1] = color.green;
          image[index + 2] = color.blue;
          image[index + 3] = 1;
          index += 4;
        }
        return { image, _start_, _end_, _worker_id_ };
      }
      const worker = createWorker(fun, lambda, dependencies);
      const workers = [...Array(N)]
        .map(() => worker);
      const allWorkersDone = [...Array(N)].fill(false);
      workers.forEach((worker, k) => {
        const ratio = Math.floor(n / N);
        worker.postMessage({
          _start_: k * ratio,
          _end_: Math.min(n, (k + 1) * ratio) - 1,
          _width_: w,
          _height_: h,
          _worker_id_: k,
          _vars_: vars
        });
        worker.onmessage = (event) => {
          const { image, _start_, _end_, _worker_id_ } = event.data;
          let index = 0;
          for (let i = _start_; i < _end_; i++) {
            this._image[i] = Math.floor(image[index] * MAX_8BIT);
            index++;
          }
          allWorkersDone[_worker_id_] = true;
          if (allWorkersDone.every(x => x)) {
            return resolve(this.paint());
          }
        };
      })
    });
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

  //========================================================================================
  /*                                                                                      *
   *                                      Canvas utils                                    *
   *                                                                                      */
  //========================================================================================


  grid2canvas(i, j) {
    const h = this.height;
    const x = j;
    const y = h - 1 - i;
    return [x, y]
  }

  canvas2grid(x, y) {
    const h = this._height;
    const j = Math.floor(x);
    const i = Math.floor(h - 1 - y);
    return [i, j];
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
        setTimeout(() => re([responseBlob, URL.createObjectURL(responseBlob)]));
      })
    };
  }

  exposure(time = Number.MAX_VALUE) {
    let it = 1;
    const ans = {};
    for (let key of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
      const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this), key);
      if (descriptor && typeof descriptor.value === 'function') {
        ans[key] = descriptor.value.bind(this);
      }
    }
    ans.width = this.width;
    ans.height = this.height;
    ans.map = (lambda) => {
      const n = this._image.length;
      const w = this._width;
      const h = this._height;
      for (let k = 0; k < n; k += 4) {
        const i = Math.floor(k / (4 * w));
        const j = Math.floor((k / 4) % w);
        const x = j;
        const y = h - 1 - i;
        const color = lambda(x, y);
        if (!color) continue;
        this._image[k] = this._image[k] + (color.red * MAX_8BIT - this._image[k]) / it;
        this._image[k + 1] = this._image[k + 1] + (color.green * MAX_8BIT - this._image[k + 1]) / it;
        this._image[k + 2] = this._image[k + 2] + (color.blue * MAX_8BIT - this._image[k + 2]) / it;
        this._image[k + 3] = MAX_8BIT;
      }
      if (it < time) it++
      return this.paint();
    }
    return ans;
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
}

//========================================================================================
/*                                                                                      *
 *                                         UTILS                                        *
 *                                                                                      */
//========================================================================================


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

  const isInsideFunc = isInsideConvex(positions);
  for (let x = xMin; x < xMax; x++) {
    for (let y = yMin; y < yMax; y++) {
      if (isInsideFunc(Vec2(x, y))) {
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

const createWorker = memoize((main, lambda, dependencies, worker_id) => {
  const workerFile = `
  ${clamp.toString()}
  ${Color.toString()}
  ${dependencies.map(d => d.toString()).join("\n")}
  const _ID_ = ${worker_id};
  const lambda = ${lambda.toString()};
  const __main__ = ${main.toString()};
  onmessage = e => {
      const input = e.data
      const output = __main__(input);
      self.postMessage(output);
  };
  `;
  return new Worker(URL.createObjectURL(new Blob([workerFile])));
});