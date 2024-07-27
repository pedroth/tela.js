import Color from "../Color/Color.js";
import { MAX_8BIT } from "../Utils/Constants.js";
import { memoize } from "../Utils/Utils.js";
import Tela, { CHANNELS } from "./Tela.js";

export default class Canvas extends Tela {

  constructor(canvas) {
    super(canvas.width, canvas.height);
    this.canvas = canvas;
    this.canvas.setAttribute('tabindex', '1'); // for canvas to be focusable
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
    this.imageData = this.ctx.getImageData(0, 0, this.width, this.height);
  }

  get DOM() {
    return this.canvas;
  }

  paint() {
    const data = this.imageData.data;
    for (let i = 0; i < data.length; i++) {
      data[i] = this.image[i] * MAX_8BIT;
    }
    this.ctx.putImageData(this.imageData, 0, 0);
    return this;
  }

  mapParallel = memoize((lambda, dependencies = []) => {
    const N = navigator.hardwareConcurrency;
    const w = this.width;
    const h = this.height;
    const fun = ({ _start_row, _end_row, _width_, _height_, _worker_id_, _vars_ }) => {
      const image = new Float32Array(CHANNELS * _width_ * (_end_row - _start_row));
      const startIndex = CHANNELS * _width_ * _start_row;
      const endIndex = CHANNELS * _width_ * _end_row;
      let index = 0;
      for (let k = startIndex; k < endIndex; k += CHANNELS) {
        const i = Math.floor(k / (CHANNELS * _width_));
        const j = Math.floor((k / CHANNELS) % _width_);
        const x = j;
        const y = _height_ - 1 - i;
        const color = lambda(x, y, { ..._vars_ });
        if (!color) return;
        image[index] = color.red;
        image[index + 1] = color.green;
        image[index + 2] = color.blue;
        image[index + 3] = color.alpha;
        index += CHANNELS;
      }
      return { image, _start_row, _end_row, _worker_id_ };
    }
    const workers = [...Array(N)].map(() => createWorker(fun, lambda, dependencies));
    return {
      run: (vars = {}) => {
        // works better than Promise.all solution
        return new Promise((resolve) => {
          const allWorkersDone = [...Array(N)].fill(false);
          workers.forEach((worker, k) => {
            worker.onmessage = (event) => {
              const { image, _start_row, _end_row, _worker_id_ } = event.data;
              let index = 0;
              const startIndex = CHANNELS * w * _start_row;
              const endIndex = CHANNELS * w * _end_row;
              for (let i = startIndex; i < endIndex; i++) {
                this.image[i] = image[index];
                index++;
              }
              allWorkersDone[_worker_id_] = true;
              if (allWorkersDone.every(x => x)) {
                return resolve(this.paint());
              }
            };
            const ratio = Math.floor(h / N);
            worker.postMessage({
              _start_row: k * ratio,
              _end_row: Math.min(h - 1, (k + 1) * ratio),
              _width_: w,
              _height_: h,
              _worker_id_: k,
              _vars_: vars
            });
          })
        })
      }
    }
  });

  onMouseDown(lambda) {
    this.canvas.addEventListener("mousedown", handleMouse(this, lambda), false);
    this.canvas.addEventListener("touchstart", handleMouse(this, lambda), false);
    return this;
  }

  onMouseUp(lambda) {
    this.canvas.addEventListener("mouseup", handleMouse(this, lambda), false);
    this.canvas.addEventListener("touchend", handleMouse(this, lambda), false);
    return this;
  }

  onMouseMove(lambda) {
    this.canvas.addEventListener("mousemove", handleMouse(this, lambda), false);
    this.canvas.addEventListener("touchmove", handleMouse(this, lambda), false);
    return this;
  }

  onMouseWheel(lambda) {
    this.canvas.addEventListener("wheel", lambda, false);
    return this;
  }

  onKeyDown(lambda) {
    this.canvas.addEventListener("keydown", (e) => {
      lambda(e);
    })
    return this;
  }

  onKeyUp(lambda) {
    this.canvas.addEventListener("keyup", (e) => {
      lambda(e);
    })
    return this;
  }

  resize(width, height) {
    super.resize(width, height);
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
    this.imageData = this.ctx.getImageData(0, 0, this.width, this.height);
    return this;
  }

  startVideoRecorder() {
    let responseBlob;
    const canvasSnapshots = [];
    const stream = this.canvas.captureStream();
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
    const canvas = new Canvas(canvasDOM);
    const data = canvas.imageData.data;
    for (let i = 0; i < data.length; i += CHANNELS) {
      canvas.setPxlData(
        i,
        Color.ofRGBRaw(
          data[i],
          data[i + 1],
          data[i + 2],
          data[i + 3],
        )
      )
    }
    return canvas;
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
 *                                   Private functions                                  *
 *                                                                                      */
//========================================================================================

function handleMouse(canvas, lambda) {
  return event => {
    const h = canvas.height;
    const w = canvas.width;
    const rect = canvas.canvas.getBoundingClientRect();
    // different coordinates from canvas DOM image data
    const mx = (event.clientX - rect.left) / rect.width, my = (event.clientY - rect.top) / rect.height;
    const x = Math.floor(mx * w);
    const y = Math.floor(h - 1 - my * h);
    return lambda(x, y, event);
  }
}

const createWorker = (main, lambda, dependencies) => {
  const workerFile = `
  const CHANNELS = ${CHANNELS};
  ${Color.toString()}
  ${dependencies.map(d => d.toString()).join("\n")}
  const lambda = ${lambda.toString()};
  const __main__ = ${main.toString()};
  onmessage = e => {
      const input = e.data
      const output = __main__(input);
      self.postMessage(output);
  };
  `;
  return new Worker(URL.createObjectURL(new Blob([workerFile])));
};