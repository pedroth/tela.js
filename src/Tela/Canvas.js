import Color from "../Color/Color.js";
import { CHANNELS, MAX_8BIT } from "../Utils/Constants.js";
import Tela from "./Tela.js";

export default class Canvas extends Tela {

  constructor(canvas) {
    super(canvas.width, canvas.height);
    this.canvas = canvas;
    if (this.canvas.setAttribute) this.canvas?.setAttribute('tabindex', '1'); // for canvas to be focusable
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

  serialize() {
    return { type: Canvas.name, url: this.url }
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

  static async ofUrl(url) {
    const resp = await fetch(url);
    if (!resp.ok) { throw "Network Error"; }
    const blob = await resp.blob();
    const source = await createImageBitmap(blob);
    const canvas = new OffscreenCanvas(source.width, source.height, { willReadFrequently: true });
    const ctx = canvas.getContext("2d");
    ctx.drawImage(source, 0, 0)
    source.close();
    const myCanvas = Canvas.ofDOM(canvas);
    myCanvas.url = url;
    return myCanvas;
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