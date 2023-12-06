var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};

// src/Utils/Utils.jsjs
class Stream {
  constructor(initialState, updateStateFunction) {
    this._head = initialState;
    this._tail = updateStateFunction;
  }
  get head() {
    return this._head;
  }
  get tail() {
    return new Stream(this._tail(this._head), this._tail);
  }
}

// src/Utils/Utils.jsjsilder.
class Animation {
  constructor(state, next, doWhile) {
    this.animation = new Stream(state, next);
    this.while = doWhile;
    this.requestAnimeId = null;
  }
  play(stream = this.animation) {
    this.requestAnimeId = requestAnimationFrame(() => {
      if (!this.while(stream.head))
        return this.stop();
      this.play(stream.tail);
    });
    Animation.globalAnimationIds.push(this.requestAnimeId);
    return this;
  }
  stop() {
    cancelAnimationFrame(this.requestAnimeId);
    return this;
  }
  static globalAnimationIds = [];
  static builder() {
    return new AnimationBuilder;
  }
}

class AnimationBuilder {
  constructor() {
    this._state = null;
    this._next = null;
    this._end = null;
  }
  initialState(state) {
    this._state = state;
    return this;
  }
  nextState(next) {
    this._next = next;
    return this;
  }
  while(end) {
    this._end = end;
    return this;
  }
  build() {
    const someAreEmpty = [this._state, this._next, this._end].some((x) => x === null || x === undefined);
    if (someAreEmpty)
      throw new Error("Animation properties are missing");
    return new Animation(this._state, this._next, this._end);
  }
}

// src/Utils/Utils.jsjs
var handleMouse = function(canvas, lambda) {
  return (event) => {
    const h = canvas.height;
    const w = canvas.width;
    const rect = canvas._canvas.getBoundingClientRect();
    const mx = (event.clientX - rect.left) / rect.width, my = (event.clientY - rect.top) / rect.height;
    const x = Math.floor(mx * w);
    const y = Math.floor(h - 1 - my * h);
    return lambda(x, y);
  };
};

class Canvas {
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
  fill(color) {
    return this._image.map(() => color);
  }
  map(lambda) {
    const n = this._image.length;
    const w = this._width;
    const h = this._height;
    for (let k = 0;k < n; k += 4) {
      const i = Math.floor(k / (4 * w));
      const j = Math.floor(k / 4 % w);
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
    recorder.addEventListener("dataavailable", (e) => canvasSnapshots.push(e.data));
    recorder.start();
    recorder.onstop = () => responseBlob = new Blob(canvasSnapshots, { type: "video/webm" });
    return {
      stop: () => new Promise((re) => {
        recorder.stop();
        setTimeout(() => re(responseBlob));
      })
    };
  }
  static ofSize(width, height) {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("width", width);
    canvas.setAttribute("height", height);
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
    return Canvas.ofSize(w, h).map((x, y) => {
      return image.get(x, y);
    });
  }
}

// src/Utils/Utils.js
var MAX_8BIT = 255;

class Color {
  constructor(rbg) {
    this.rgb = rbg;
  }
  getRGB() {
    return this.rgb;
  }
  get red() {
    return this.rgb[0];
  }
  get green() {
    return this.rgb[1];
  }
  get blue() {
    return this.rgb[2];
  }
  equals(color) {
    return this.rgb[0] === color.rgb[0] && this.rgb[1] === color.rgb[1] && this.rgb[2] === color.rgb[2];
  }
  static ofRGB(red = 0, green = 0, blue = 0) {
    const rgb = new Float64Array(3);
    rgb[0] = red;
    rgb[1] = green;
    rgb[2] = blue;
    return new Color(rgb);
  }
  static ofRGBRaw(red = 0, green = 0, blue = 0) {
    const rgb = new Float64Array(3);
    rgb[0] = red / MAX_8BIT;
    rgb[1] = green / MAX_8BIT;
    rgb[2] = blue / MAX_8BIT;
    return new Color(rgb);
  }
  static random() {
    const r = () => Math.random();
    return Color.ofRGB(r(), r(), r());
  }
  static RED = Color.ofRGB(1, 0, 0);
  static GREEN = Color.ofRGB(0, 1, 0);
  static BLUE = Color.ofRGB(0, 0, 1);
  static BLACK = Color.ofRGB(0, 0, 0);
  static WHITE = Color.ofRGB(1, 1, 1);
}

// src/Utils/Utils.jsjsilder.js
var isElement = function(o) {
  return typeof HTMLElement === "object" ? o instanceof HTMLElement : o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string";
};
var isPromise = function(o) {
  return o instanceof Promise;
};
var SVG_URL = "http://www.w3.org/2000/svg";
var SVG_TAGS = [
  "svg",
  "g",
  "circle",
  "ellipse",
  "line",
  "path",
  "polygon",
  "polyline",
  "rect"
];

class DomBuilder {
  constructor(element) {
    this.element = element;
  }
  attr(name, value) {
    this.element.setAttribute(name, value);
    return this;
  }
  style(styleStr) {
    this.element.setAttribute("style", styleStr);
    return this;
  }
  appendChild(...elements) {
    elements.forEach((e) => {
      if (isElement(e)) {
        this.element.appendChild(e);
      } else if (isPromise(e)) {
        e.then((actualElem) => this.appendChild(actualElem));
      } else {
        this.element.appendChild(e.build());
      }
    });
    return this;
  }
  inner(value) {
    if (isPromise(value)) {
      value.then((v) => this.element.innerHTML = v);
    } else {
      this.element.innerHTML = value;
    }
    return this;
  }
  removeChildren() {
    while (this.element.firstChild) {
      this.element.removeChild(this.element.lastChild);
    }
    return this;
  }
  html(value) {
    return this.inner(value);
  }
  event(eventName, lambda) {
    this.element.addEventListener(eventName, lambda);
    return this;
  }
  build() {
    return this.element;
  }
  addClass(className) {
    if (!className || className === "")
      return this;
    this.element.classList.add(...className.split(" "));
    return this;
  }
  removeClass(className) {
    this.element.classList.remove(className);
    return this;
  }
  static of(elem) {
    if (isElement(elem)) {
      return new DomBuilder(elem);
    }
    const isSvg = SVG_TAGS.includes(elem);
    const element = isSvg ? document.createElementNS(SVG_URL, elem) : document.createElement(elem);
    return new DomBuilder(element);
  }
  static ofId(id) {
    return new DomBuilder(document.getElementById(id));
  }
}
var DomBuilder_default = DomBuilder;

// src/Utils/Utils.js
class Image {
  constructor(width, height) {
    this._width = width;
    this._height = height;
    this._image = new Array(this._width * this._height).fill(() => Color.ofRGB());
  }
  get width() {
    return this._width;
  }
  get height() {
    return this._height;
  }
  fill(color) {
    return this._image.map(() => color);
  }
  map(lambda) {
    const n = this._image.length;
    const w = this._width;
    const h = this._height;
    for (let k = 0;k < n; k++) {
      const i = Math.floor(k / w);
      const j = k % w;
      const x = j;
      const y = h - 1 - i;
      this._image[k] = lambda(x, y);
    }
    return this;
  }
  toArray() {
    const w = this._width;
    const h = this._height;
    const imageData = new Uint8Array(this._width * this._height * 4);
    for (let i = 0;i < h; i++) {
      for (let j = 0;j < w; j++) {
        let index = w * i + j;
        const color = this._image[index];
        index <<= 2;
        imageData[index] = color.red * 255;
        imageData[index + 1] = color.green * 255;
        imageData[index + 2] = color.blue * 255;
        imageData[index + 3] = 255;
      }
    }
    return imageData;
  }
  static ofSize(width, height) {
    return new Image(width, height);
  }
  static ofDOM(canvasDOM) {
    const ctx = canvasDOM.getContext("2d", { willReadFrequently: true });
    const w = canvasDOM.width;
    const h = canvasDOM.height;
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const image = Image.ofSize(w, h);
    for (let i = 0;i < data.length; i += 4) {
      const color = Color.ofRGB(data[i] / 255, data[i + 1] / 255, data[i + 2] / 255);
      image._image[Math.floor(i / 4)] = color;
    }
  }
  static ofCanvas(canvas) {
    const w = canvas.width;
    const h = canvas.height;
    return Image.ofSize(w, h).map((x, y) => {
      return canvas.get(x, y);
    });
  }
}

// src/Utils/Utils.js
var exports_Utils = {};
__export(exports_Utils, {
  or: () => {
    {
      return or;
    }
  },
  measureTime: () => {
    {
      return measureTime;
    }
  },
  compose: () => {
    {
      return compose;
    }
  }
});
function measureTime(lambda) {
  const t = performance.now();
  lambda();
  return 0.001 * (performance.now() - t);
}
function compose(f, g) {
  return (x) => f(g(x));
}
function or(...lambdas) {
  for (let i = 0;i < lambdas.length; i++) {
    try {
      return lambdas[i]();
    } catch (err) {
      continue;
    }
  }
}
export {
  exports_Utils as Utils,
  Stream,
  Image,
  DomBuilder_default as DOM,
  Color,
  Canvas,
  Animation
};
