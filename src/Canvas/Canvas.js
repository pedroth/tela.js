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
    return this._image.map(() => color);
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
      this._image[k] = color.red * 255;
      this._image[k + 1] = color.green * 255;
      this._image[k + 2] = color.blue * 255;
      this._image[k + 3] = 255;
    }
    return this.paint();
  }

  paint() {
    this._ctx.putImageData(this._imageData, 0, 0);
    return this;
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

  static ofImage(image) {
    const w = image.width;
    const h = image.height;
    return Canvas.ofSize(w, h)
      .map((x, y) => {
        return image.get(x, y);
      })
  }
}