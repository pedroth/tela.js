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

// src/Ray/Ray.jsads.js
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

// src/Ray/Ray.jsads.jsilder.
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

// src/Ray/Ray.jsads.js
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
    return this.map((i) => color);
  }
  map(lambda) {
    const n2 = this._image.length;
    const w = this._width;
    const h = this._height;
    for (let k = 0;k < n2; k += 4) {
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
  setPxl(x, y, color) {
    const w = this._width;
    const h = this._height;
    const i = h - 1 - y;
    const j = x;
    let index = 4 * (w * i + j);
    this._image[index] = color.red * 255;
    this._image[index + 1] = color.green * 255;
    this._image[index + 2] = color.blue * 255;
    this._image[index + 3] = 255;
    return this;
  }
  drawLine(p1, p2, shader) {
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
    this._canvas.addEventListener("wheel", lambda, false);
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

// src/Ray/Ray.jsads.
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
  add(color) {
    return Color.ofRGB(this.rgb[0] + color.red, this.rgb[1] + color.green, this.rgb[2] + color.blue);
  }
  scale(r) {
    const ans = this.rgb.map((c) => Math.min(1, Math.max(0, c * r)));
    return new Color(ans);
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

// src/Ray/Ray.jsads.jsilder.js
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

// src/Ray/Ray.jsads.
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
    const n2 = this._image.length;
    const w = this._width;
    const h = this._height;
    for (let k = 0;k < n2; k++) {
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

// src/Ray/Ray.jsads.js
var _sanitize_input = function(arrayIn, arrayOut) {
  for (let i = 0;i < arrayIn.length; i++) {
    const z = arrayIn[i];
    const zIsNumber = z !== null && z !== undefined && typeof z === "number";
    arrayOut[i] = zIsNumber ? z : 0;
  }
  return arrayOut;
};
var sameSizeOrError = function(a, b) {
  if (a.n === b.n) {
    return true;
  }
  throw new VectorException("Vector must have same size");
};
var ARRAY_TYPES = {
  Float32Array,
  Float64Array
};

class Vec {
  constructor(array) {
    this._vec = array;
    this._n = this._vec.length;
  }
  get n() {
    return this._n;
  }
  get dim() {
    return this._n;
  }
  size = () => this._n;
  shape = () => [this._n];
  clone() {
    return new Vec(COPY_VEC(this._vec));
  }
  get(i) {
    return this._vec[i];
  }
  toArray() {
    return COPY_VEC(this._vec);
  }
  toString() {
    return "[" + this._vec.join(", ") + "]";
  }
  serialize() {
    return this._vec.join(", ");
  }
  add(u) {
    return this.op(u, (a, b) => a + b);
  }
  sub(u) {
    return this.op(u, (a, b) => a - b);
  }
  mul(u) {
    return this.op(u, (a, b) => a * b);
  }
  div(u) {
    return this.op(u, (a, b) => a / b);
  }
  dot(u) {
    let acc = 0;
    for (let i = 0;i < this._n; i++) {
      acc += this._vec[i] * u._vec[i];
    }
    return acc;
  }
  squareLength() {
    return this.dot(this);
  }
  length() {
    return Math.sqrt(this.dot(this));
  }
  normalize() {
    return this.scale(1 / this.length());
  }
  scale(r) {
    return this.map((z) => z * r);
  }
  map(lambda) {
    const ans = BUILD_VEC(this._n);
    for (let i = 0;i < this._n; i++) {
      ans[i] = lambda(this._vec[i], i);
    }
    return new Vec(ans);
  }
  op(u, operation) {
    sameSizeOrError(this, u);
    const ans = BUILD_VEC(this._n);
    for (let i = 0;i < this._n; i++) {
      ans[i] = operation(this._vec[i], u._vec[i]);
    }
    return new Vec(ans);
  }
  reduce(fold, init = 0) {
    let acc = init;
    for (let i = 0;i < this._n; i++) {
      acc = fold(acc, this._vec[i], i);
    }
    return acc;
  }
  fold = this.reduce;
  foldLeft = this.fold;
  equals(u, precision = 0.00001) {
    if (!(u instanceof Vec))
      return false;
    return this.sub(u).length() < precision;
  }
  take(n2 = 0, m = this._vec.length) {
    return new Vec(this._vec.slice(n2, m));
  }
  findIndex(predicate) {
    for (let i = 0;i < this._n; i++) {
      if (predicate(this._vec[i]))
        return i;
    }
    return -1;
  }
  static fromArray(array) {
    if (array.length === 2)
      return Vector2.fromArray(array);
    if (array.length === 3)
      return Vector3.fromArray(array);
    return new Vec(_sanitize_input(array, BUILD_VEC(array.length)));
  }
  static of(...values) {
    if (values.length === 2)
      return Vector2.of(...values);
    if (values.length === 3)
      return Vector3.of(...values);
    return new Vec(_sanitize_input(values, BUILD_VEC(values.length)));
  }
  static ZERO = (n2) => n2 === 3 ? new Vector3 : n2 === 2 ? new Vector2 : new Vec(BUILD_VEC(n2));
  static ONES = (n2) => {
    if (n2 === 2)
      return Vector2.ONES;
    if (n2 === 3)
      return Vector3.ONES;
    return Vec.ZERO(n2).map(() => 1);
  };
  static e = (n2) => (i) => {
    if (n2 === 2)
      return Vector2.e(i);
    if (n2 === 3)
      return Vector3.e(i);
    const vec = BUILD_VEC(n2);
    if (i >= 0 && i < n2) {
      vec[i] = 1;
    }
    return new Vec(vec);
  };
  static RANDOM = (n2) => {
    if (n2 === 2)
      return Vector2.RANDOM();
    if (n2 === 3)
      return Vector3.RANDOM();
    const v = BUILD_VEC(n2);
    for (let i = 0;i < n2; i++) {
      v[i] = Math.random();
    }
    return new Vec(v);
  };
}
var BUILD_VEC = (n2) => new ARRAY_TYPES.Float64Array(n2);
var COPY_VEC = (array) => ARRAY_TYPES.Float64Array.from(array);

class VectorException extends Error {
}
var Vec3 = (x = 0, y = 0, z = 0) => new Vector3(x, y, z);
var Vec2 = (x = 0, y = 0) => new Vector2(x, y);

class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  get n() {
    return 3;
  }
  get dim() {
    return 3;
  }
  size = () => 3;
  shape = () => [3];
  clone() {
    return new Vector3(this.x, this.y, this.z);
  }
  get(i) {
    return [this.x, this.y, this.z][i];
  }
  toArray() {
    return [this.x, this.y, this.z];
  }
  toString() {
    return "[" + this.toArray().join(", ") + "]";
  }
  serialize() {
    return this.toArray().join(", ");
  }
  add(u) {
    return this.op(u, (a, b) => a + b);
  }
  sub(u) {
    return this.op(u, (a, b) => a - b);
  }
  mul(u) {
    return this.op(u, (a, b) => a * b);
  }
  div(u) {
    return this.op(u, (a, b) => a / b);
  }
  dot(u) {
    return this.x * u.x + this.y * u.y + this.z * u.z;
  }
  squareLength() {
    return this.dot(this);
  }
  length() {
    return Math.sqrt(this.dot(this));
  }
  normalize() {
    return this.scale(1 / this.length());
  }
  scale(r) {
    return this.map((z) => z * r);
  }
  map(lambda) {
    return new Vector3(lambda(this.x, 0), lambda(this.y, 1), lambda(this.z, 2));
  }
  op(u, operation) {
    return new Vector3(operation(this.x, u.x), operation(this.y, u.y), operation(this.z, u.z));
  }
  reduce(fold, init = 0) {
    let acc = init;
    acc = fold(acc, this.x);
    acc = fold(acc, this.y);
    acc = fold(acc, this.z);
    return acc;
  }
  fold = this.reduce;
  foldLeft = this.fold;
  equals(u, precision = 0.00001) {
    if (!(u instanceof Vector3))
      return false;
    return this.sub(u).length() < precision;
  }
  take(n2 = 0, m = 3) {
    const array = [this.x, this.y, this.z].slice(n2, m);
    if (array.length === 2)
      return Vector2.fromArray(array);
    if (array.length === 3)
      return Vector3.fromArray(array);
    return Vec.fromArray(array);
  }
  findIndex(predicate) {
    if (predicate(this.x))
      return 0;
    if (predicate(this.y))
      return 1;
    if (predicate(this.z))
      return 2;
    return -1;
  }
  static fromArray(array) {
    return new Vector3(...array);
  }
  static of(...values) {
    return new Vector3(...values);
  }
  static e = (i) => {
    if (i === 0)
      return new Vector3(1, 0, 0);
    if (i === 1)
      return new Vector3(0, 1, 0);
    if (i === 2)
      return new Vector3(0, 0, 1);
    return new Vec3;
  };
  static RANDOM = () => {
    return new Vector3(Math.random(), Math.random(), Math.random());
  };
  static ONES = new Vector3(1, 1, 1);
}

class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  get n() {
    return 2;
  }
  get dim() {
    return 2;
  }
  size = () => 2;
  shape = () => [2];
  clone() {
    return new Vector2(this.x, this.y);
  }
  get(i) {
    return [this.x, this.y][i];
  }
  toArray() {
    return [this.x, this.y];
  }
  toString() {
    return "[" + this.toArray().join(", ") + "]";
  }
  serialize() {
    return this.toArray().join(", ");
  }
  add(u) {
    return this.op(u, (a, b) => a + b);
  }
  sub(u) {
    return this.op(u, (a, b) => a - b);
  }
  mul(u) {
    return this.op(u, (a, b) => a * b);
  }
  div(u) {
    return this.op(u, (a, b) => a / b);
  }
  dot(u) {
    return this.x * u.x + this.y * u.y;
  }
  squareLength() {
    return this.dot(this);
  }
  length() {
    return Math.sqrt(this.dot(this));
  }
  normalize() {
    return this.scale(1 / this.length());
  }
  scale(r) {
    return this.map((z) => z * r);
  }
  map(lambda) {
    return new Vector2(lambda(this.x, 0), lambda(this.y, 1));
  }
  op(u, operation) {
    return new Vector2(operation(this.x, u.x), operation(this.y, u.y));
  }
  reduce(fold, init = 0) {
    let acc = init;
    acc = fold(acc, this.x);
    acc = fold(acc, this.y);
    return acc;
  }
  fold = this.reduce;
  foldLeft = this.fold;
  equals(u, precision = 0.00001) {
    if (!(u instanceof Vector2))
      return false;
    return this.sub(u).length() < precision;
  }
  take(n2 = 0, m = 2) {
    const array = [this.x, this.y].slice(n2, m);
    if (array.length === 2)
      return Vector2.fromArray(array);
    return Vec.fromArray(array);
  }
  findIndex(predicate) {
    if (predicate(this.x))
      return 0;
    if (predicate(this.y))
      return 1;
    return -1;
  }
  static fromArray(array) {
    return new Vector2(...array);
  }
  static of(...values) {
    return new Vector2(...values);
  }
  static e = (i) => {
    if (i === 0)
      return new Vector2(1, 0);
    if (i === 1)
      return new Vector2(0, 1);
    return new Vector2;
  };
  static RANDOM = () => {
    return new Vector2(Math.random(), Math.random());
  };
  static ONES = new Vector2(1, 1);
}

// src/Ray/Ray.js
function Ray(init, dir) {
  const ans = {};
  ans.init = init;
  ans.dir = dir;
  ans.trace = (t) => init.add(dir.scale(t));
  return ans;
}

// src/Ray/Ray.jsads.js
class Camera {
  constructor(props = {
    sphericalCoords: Vec3(2, 0, 0),
    focalPoint: Vec3(0, 0, 0),
    distanceToPlane: 1
  }) {
    const { sphericalCoords, focalPoint, distanceToPlane } = props;
    this.sphericalCoords = sphericalCoords || Vec3(2, 0, 0);
    this.focalPoint = focalPoint || Vec3(0, 0, 0);
    this.distanceToPlane = distanceToPlane || 1;
    this.orbit();
  }
  orbit() {
    const [rho, theta, phi] = this.sphericalCoords.toArray();
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    const cosP = Math.cos(phi);
    const sinP = Math.sin(phi);
    this.basis = [];
    this.basis[2] = Vec3(-cosP * cosT, -cosP * sinT, -sinP);
    this.basis[1] = Vec3(-sinP * cosT, -sinP * sinT, cosP);
    this.basis[0] = Vec3(-sinT, cosT, 0);
    const sphereCoordinates = Vec3(rho * cosP * cosT, rho * cosP * sinT, rho * sinP);
    this.eye = sphereCoordinates.add(this.focalPoint);
    return this;
  }
  rayShot(lambdaWithRays) {
    return {
      to: (canvas) => {
        const w = canvas.width;
        const h = canvas.height;
        return canvas.map((x, y) => {
          const dirInLocal = [
            2 * (x / w) - 1,
            2 * (y / h) - 1,
            1
          ];
          const dir = this.basis[0].scale(dirInLocal[0]).add(this.basis[1].scale(dirInLocal[1])).add(this.basis[2].scale(dirInLocal[2])).normalize();
          return lambdaWithRays(Ray(this.eye, dir));
        });
      }
    };
  }
  sceneShot(scene) {
    const lambda = (ray) => {
      return scene.interceptWith(ray).map(([pos, normal]) => {
        return Color.ofRGB((normal.get(0) + 1) / 2, (normal.get(1) + 1) / 2, (normal.get(2) + 1) / 2);
      }).orElse(() => {
        return Color.BLACK;
      });
    };
    return this.rayShot(lambda);
  }
  reverseShot(scene) {
    return {
      to: (canvas) => {
        canvas.fill(Color.BLACK);
        const w = canvas.width;
        const h = canvas.height;
        const zBuffer = new Float64Array(w * h).fill(Number.MAX_VALUE);
        scene.getElements().forEach((point) => {
          let pointInCamCoord = point.position.sub(this.eye);
          pointInCamCoord = Vec3(this.basis[0].dot(pointInCamCoord), this.basis[1].dot(pointInCamCoord), this.basis[2].dot(pointInCamCoord));
          const z = pointInCamCoord.get(2);
          if (z < this.distanceToPlane)
            return;
          const projectedPoint = pointInCamCoord.scale(this.distanceToPlane / z);
          let x = w / 2 + projectedPoint.get(0) * w;
          let y = h / 2 + projectedPoint.get(1) * h;
          x = Math.floor(x);
          y = Math.floor(y);
          if (x < 0 || x >= w || y < 0 || y >= h)
            return;
          const radius = Math.floor(Math.max(1, Math.min(10, 10 - z)));
          for (let k = -radius;k < radius; k++) {
            for (let l = -radius;l < radius; l++) {
              const xl = Math.max(0, Math.min(w - 1, x + k));
              const yl = Math.floor(y + l);
              const j = xl;
              const i = h - 1 - yl;
              const zBufferIndex = Math.floor(w * i + j);
              if (z < zBuffer[zBufferIndex]) {
                zBuffer[zBufferIndex] = z;
                canvas.setPxl(xl, yl, point.color);
              }
            }
          }
        });
        canvas.paint();
      }
    };
  }
  _naiveShot(scene) {
    const lambda = (ray) => {
      return scene._naiveIntercept(ray).map(([pos, normal]) => {
        return Color.ofRGB((normal.get(0) + 1) / 2, (normal.get(1) + 1) / 2, (normal.get(2) + 1) / 2);
      }).orElse(() => {
        return Color.BLACK;
      });
    };
    return this.rayShot(lambda);
  }
}

// src/Ray/Ray.jsads.js
var exports_Monads = {};
__export(exports_Monads, {
  some: () => {
    {
      return some;
    }
  },
  none: () => {
    {
      return none;
    }
  },
  maybe: () => {
    {
      return maybe;
    }
  }
});
function some(x) {
  const object = {
    map: (f) => maybe(f(x)),
    orElse: () => x,
    forEach: (f) => f(x),
    flatMap: (f) => f(x),
    isSome: () => true
  };
  return object;
}
function none() {
  const object = {
    map: () => object,
    orElse: (f = () => {
    }) => f(),
    forEach: () => {
    },
    flatMap: () => object,
    isSome: () => false
  };
  return object;
}
function maybe(x) {
  if (x) {
    return some(x);
  }
  return none(x);
}

// src/Ray/Ray.js
var maxComp = function(u) {
  return u.fold((e, x) => Math.max(e, x), -Number.MAX_VALUE);
};

class Box {
  constructor(min, max) {
    this.isEmpty = min === undefined || max === undefined;
    if (this.isEmpty)
      return this;
    this.min = min.op(max, Math.min);
    this.max = max.op(min, Math.max);
    this.center = min.add(max).scale(1 / 2);
    this.diagonal = max.sub(min);
  }
  add(box) {
    if (this.isEmpty)
      return box;
    const { min, max } = this;
    return new Box(min.op(box.min, Math.min), max.op(box.max, Math.max));
  }
  union = this.add;
  sub(box) {
    if (this.isEmpty)
      return Box.EMPTY;
    const { min, max } = this;
    const newMin = min.op(box.min, Math.max);
    const newMax = max.op(box.max, Math.min);
    const newDiag = newMax.sub(newMin);
    const isAllPositive = newDiag.data.every((x) => x >= 0);
    return !isAllPositive ? Box.EMPTY : new Box(newMin, newMax);
  }
  intersection = this.sub;
  interceptWith(ray) {
    const maxIte = 100;
    const epsilon = 0.001;
    let p = ray.init;
    let t = this.distanceToPoint(p);
    let minT = t;
    for (let i = 0;i < maxIte; i++) {
      p = ray.trace(t);
      const d = this.distanceToPoint(p);
      t += d;
      if (d < epsilon) {
        return some(p);
      }
      if (d > minT) {
        break;
      }
      minT = d;
    }
    return none();
  }
  equals(box) {
    if (!(box instanceof Box))
      return false;
    if (this == Box.EMPTY)
      return true;
    return this.min.equals(box.min) && this.max.equals(box.max);
  }
  distanceToBox(box) {
    return this.min.sub(box.min).length() + this.max.sub(box.max).length();
  }
  distanceToPoint(pointVec) {
    const p = pointVec.sub(this.center);
    const r = this.max.sub(this.center);
    const q = p.map(Math.abs).sub(r);
    return q.map((x) => Math.max(x, 0)).length() + Math.min(0, maxComp(q));
  }
  estimateNormal(pointVec) {
    const epsilon = 0.001;
    const n2 = pointVec.dim;
    const grad = [];
    const d = this.distanceToPoint(pointVec);
    for (let i = 0;i < n2; i++) {
      grad.push(this.distanceToPoint(pointVec.add(Vec.e(n2)(i).scale(epsilon))) - d);
    }
    return Vec.fromArray(grad).scale(Math.sign(d)).normalize();
  }
  toString() {
    return `{
        min:${this.min.toString()},
        max:${this.max.toString()}
    }`;
  }
  static EMPTY = new Box;
}

// src/Ray/Ray.jsads.
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
  },
  argmin: () => {
    {
      return argmin;
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
function argmin(array, costFunction = (x) => x) {
  let argminIndex = -1;
  let cost = Number.MAX_VALUE;
  for (let i = 0;i < array.length; i++) {
    const newCost = costFunction(array[i]);
    if (newCost < cost) {
      cost = newCost;
      argminIndex = i;
    }
  }
  return argminIndex;
}

// src/Ray/Ray.jsads.
var sphereInterception = function(point, ray) {
  const { init, dir } = ray;
  const diff = init.sub(point.position);
  const b = 2 * dir.dot(diff);
  const c = diff.squareLength() - point.radius * point.radius;
  const discriminant = b * b - 4 * c;
  if (discriminant < 0)
    return none();
  const sqrt = Math.sqrt(discriminant);
  const [t1, t2] = [(-b - sqrt) / 2, (-b + sqrt) / 2];
  const t = Math.min(t1, t2);
  if (t1 * t2 < 0)
    return some(t);
  return t1 >= 0 && t2 >= 0 ? some(t) : none();
};

class Point {
  constructor({ name, position, normal, color, radius }) {
    this.name = name;
    this.color = color;
    this.normal = normal;
    this.radius = radius;
    this.position = position;
  }
  interceptWith(ray) {
    return sphereInterception(this, ray).map((t) => {
      const pointOnSphere = ray.trace(t);
      const normal = pointOnSphere.sub(this.position).normalize();
      return [pointOnSphere, normal];
    });
  }
  getBoundingBox() {
    if (this.boundingBox)
      return this.boundingBox;
    const n2 = this.position.dim;
    this.boundingBox = new Box(this.position.add(Vec.ONES(n2).scale(-this.radius)), this.position.add(Vec.ONES(n2).scale(this.radius)));
    return this.boundingBox;
  }
  static builder() {
    return new PointBuilder;
  }
}

class PointBuilder {
  constructor() {
    this._name;
    this._color = Color.WHITE;
    this._radius = 1;
    this._normal = Vec3(1, 0, 0);
    this._position = Vec3(0, 0, 0);
  }
  name(name) {
    this._name = name;
    return this;
  }
  color(color) {
    this._color = color;
    return this;
  }
  radius(radius) {
    this._radius = radius;
    return this;
  }
  normal(normal) {
    this._normal = normal;
    return this;
  }
  position(posVec3) {
    this._position = posVec3;
    return this;
  }
  build() {
    const attrs = {
      name: this._name,
      color: this._color,
      radius: this._radius,
      normal: this._normal,
      position: this._position
    };
    if (Object.values(attrs).some((x) => x === undefined)) {
      throw new Error("Point is incomplete");
    }
    return new Point(attrs);
  }
}
var Point_default = Point;

// src/Ray/Ray.jsads.
class Scene {
  constructor() {
    this.id2ElemMap = {};
    this.sceneElements = [];
    this.boundingBoxScene = new Node;
    this.gridScene = {};
  }
  add(...elements) {
    elements.forEach((elem) => {
      const classes = [Point_default];
      if (!classes.some((c) => elem instanceof c))
        return this;
      const { name } = elem;
      this.id2ElemMap[name] = elem;
      this.sceneElements.push(elem);
      this.boundingBoxScene.add(elem);
    });
    return this;
  }
  clear() {
    this.id2ElemMap = {};
  }
  getElements() {
    return this.sceneElements;
  }
  interceptWith(ray, level) {
    return this.boundingBoxScene.interceptWith(ray, level);
  }
  _naiveIntercept(ray) {
    const points = this.sceneElements;
    let closestDistance = Number.MAX_VALUE;
    let closest = none();
    for (let i = 0;i < points.length; i++) {
      points[i].interceptWith(ray).map(([pos, normal]) => {
        const distance = ray.init.sub(pos).length();
        if (distance < closestDistance) {
          closest = some([pos, normal]);
          closestDistance = distance;
        }
      });
    }
    return closest;
  }
}

class Node {
  isLeaf = false;
  constructor() {
    this.box = Box.EMPTY;
  }
  add(element) {
    const elemBox = element.getBoundingBox();
    this.box = this.box.add(elemBox);
    if (!this.left) {
      this.left = new Leaf(element);
    } else if (!this.right) {
      this.right = new Leaf(element);
    } else {
      this._addElementWhenTreeIsFull(element, elemBox);
    }
    return this;
  }
  distanceToPoint(x) {
    return this.box.distanceToPoint(x);
  }
  getRandomLeaf() {
    return Math.random() < 0.5 ? this.left.getRandomLeaf() : this.right.getRandomLeaf();
  }
  interceptWith(ray, depth = 1) {
    if (depth === 10) {
      return this.getRandomLeaf().interceptWith(ray, 10);
    }
    return this.box.interceptWith(ray).flatMap((p) => {
      const children = [this.left, this.right].filter((x) => x);
      const hits = [];
      for (let i = 0;i < children.length; i++) {
        const maybeHit = children[i].interceptWith(ray, depth + 1);
        if (maybeHit.isSome())
          hits.push(maybeHit.orElse());
      }
      const minIndex = argmin(hits, ([point]) => point.sub(ray.init).length());
      if (minIndex === -1)
        return none();
      return some(hits[minIndex]);
    });
  }
  _addElementWhenTreeIsFull(element, elemBox) {
    if (this.left.isLeaf && this.right.isLeaf) {
      this._addWithLeafs(element);
    } else {
      const minIndex = argmin([
        this.left.box.distanceToBox(elemBox),
        this.right.box.distanceToBox(elemBox)
      ]);
      this._updateChildren(minIndex, element);
    }
  }
  _updateChildren(minIndex, element) {
    let child = [this.left, this.right][minIndex];
    if (!child.isLeaf) {
      child.add(element);
    } else {
      const aux = child.element;
      if (minIndex === 0)
        this.left = new Node().add(aux).add(element);
      if (minIndex === 1)
        this.right = new Node().add(aux).add(element);
    }
  }
  _addWithLeafs(element) {
    const elemBox = element.getBoundingBox();
    const distances = [
      elemBox.distanceToBox(this.left.box),
      elemBox.distanceToBox(this.right.box),
      this.left.box.distanceToBox(this.right.box)
    ];
    const index = argmin(distances);
    const index2Action = {
      0: () => {
        const aux = this.left;
        this.left = new Node;
        this.left.add(aux.element).add(element);
      },
      1: () => {
        const aux = this.right;
        this.right = new Node;
        this.right.add(aux.element).add(element);
      },
      2: () => {
        const aux = this.left;
        this.left = new Node;
        this.left.add(aux.element).add(this.right.element);
        this.right = new Leaf(element);
      }
    };
    index2Action[index]();
  }
}

class Leaf {
  isLeaf = true;
  constructor(element) {
    this.element = element;
    this.box = element.getBoundingBox();
  }
  distanceToPoint(x) {
    return this.box.distanceToPoint(x);
  }
  getRandomLeaf() {
    return this;
  }
  interceptWith(ray, depth) {
    return this.element.interceptWith(ray);
  }
}

// src/Ray/Ray.jsads
var RADIUS = 0.001;

class Mesh {
  constructor({ vertices, normals, textureCoords, faces, colors }) {
    this.vertices = vertices || [];
    this.normals = normals || [];
    this.textureCoords = textureCoords || [];
    this.faces = faces || [];
    this.colors = colors || [];
  }
  mapVertices(lambda) {
    const newVertices = [];
    for (let i = 0;i < this.vertices.length; i++) {
      newVertices.push(lambda(this.vertices[i]));
    }
    return new Mesh({
      vertices: newVertices,
      normals: this.normals,
      textureCoords: this.textureCoords,
      faces: this.faces
    });
  }
  mapColors(lambda) {
    const newColors = [];
    for (let i = 0;i < this.vertices.length; i++) {
      newColors.push(lambda(this.vertices[i]));
    }
    return new Mesh({
      vertices: this.vertices,
      normals: this.normals,
      textureCoords: this.textureCoords,
      faces: this.faces,
      colors: newColors
    });
  }
  getBoundingBox() {
    if (this.boundingBox)
      return this.boundingBox;
    this.boundingBox = new Box;
    for (let i = 0;i < this.vertices.length; i++) {
      this.boundingBox = this.boundingBox.add(new Box(this.vertices[i].add(Vec3(1, 1, 1).scale(RADIUS)), this.vertices[i].add(Vec3(1, 1, 1).scale(RADIUS))));
    }
    return this.boundingBox;
  }
  asPoints(name, radius = RADIUS) {
    const points = [];
    for (let i = 0;i < this.vertices.length; i++) {
      points.push(Point_default.builder().radius(radius).name(`${name}_${i}`).color(this.colors[i]).position(this.vertices[i]).normal(this.normals[i] || Vec3(1, 0, 0)).build());
    }
    return points;
  }
  static readObj(objFile) {
    const vertices = [];
    const normals = [];
    const texture = [];
    const faces = [];
    objFile.split("\n").forEach((lines) => {
      const spaces = lines.split(" ");
      const type = spaces[0];
      if (type === "v") {
        const v = spaces.slice(1, 4).map((x) => Number.parseFloat(x));
        vertices.push(Vec3(...v));
      }
      if (type === "vn") {
        const v = spaces.slice(1, 4).map((x) => Number.parseFloat(x));
        normals.push(Vec3(...v));
      }
      if (type === "vt") {
        const v = spaces.slice(1, 3).map((x) => Number.parseFloat(x));
        texture.push(Vec2(...v));
      }
      if (type === "f") {
      }
    });
    return new Mesh({ vertices, normals, texture, faces });
  }
}
// src/Ray/Ray.
var exports_IO = {};
__export(exports_IO, {
  saveStreamToFile: () => {
    {
      return saveStreamToFile;
    }
  },
  saveParallelToFile: () => {
    {
      return saveParallelToFile;
    }
  },
  saveImageToFile: () => {
    {
      return saveImageToFile;
    }
  },
  createPPMFromFromImage: () => {
    {
      return createPPMFromFromImage;
    }
  }
});
import {writeFileSync, unlinkSync} from "fs";
import {execSync, spawn} from "child_process";
function saveImageToFile(fileAddress, image) {
  const { fileName, extension } = getFileNameAndExtensionFromAddress(fileAddress);
  const ppmName = `${fileName}.ppm`;
  writeFileSync(ppmName, createPPMFromFromImage(image));
  if (extension !== "ppm") {
    execSync(`ffmpeg -i ${ppmName} ${fileName}.${extension}`);
    unlinkSync(ppmName);
  }
}
var getFileNameAndExtensionFromAddress = function(address) {
  const lastDotIndex = address.lastIndexOf(".");
  const fileName = address.slice(0, lastDotIndex);
  const extension = address.slice(lastDotIndex + 1);
  return { fileName, extension };
};
function createPPMFromFromImage(image) {
  const width = image.width;
  const height = image.height;
  const pixelData = image.toArray();
  const MAX_8_BIT = 255;
  let file = `P3\n${width} ${height}\n${MAX_8_BIT}\n`;
  for (let i = 0;i < pixelData.length; i += 4) {
    file += `${pixelData[i]} ${pixelData[i + 1]} ${pixelData[i + 2]}\n`;
  }
  return file;
}
function saveStreamToFile(fileAddress, streamWithImages, { imageGetter = (s) => s.image, fps }) {
  const { fileName, extension } = getFileNameAndExtensionFromAddress(fileAddress);
  let ite = 0;
  let time = 0;
  let timeCheck = performance.now();
  return {
    until: (streamStatePredicate) => {
      let s = streamWithImages;
      while (streamStatePredicate(s.head)) {
        const image = imageGetter(s.head);
        writeFileSync(`${fileName}_${ite++}.ppm`, createPPMFromFromImage(image));
        const newTimeCheck = performance.now();
        time += (newTimeCheck - timeCheck) * 0.001;
        timeCheck = performance.now();
        s = s.tail;
      }
      if (!fps)
        fps = ite / time;
      execSync(`ffmpeg -framerate ${fps} -i ${fileName}_%d.ppm ${fileName}.${extension}`);
      for (let i = 0;i < ite; i++) {
        unlinkSync(`${fileName}_${i}.ppm`);
      }
    }
  };
}
function saveParallelToFile(fileAddress, arrayWithImageProducers, { fps }) {
  const { fileName, extension } = getFileNameAndExtensionFromAddress(fileAddress);
  const times = [];
  const promises = arrayWithImageProducers.map((imageProducers, i) => {
    const spawnFile = "IO_parallel" + i + ".js";
    writeFileSync(spawnFile, `
            import { writeFileSync, unlinkSync } from "fs";
            ${createPPMFromFromImage.toString()}
            ${imageProducers}
            images.forEach()

        `);
    return new Promise((resolve) => {
      const process = spawn(`bun ${spawnFile}`);
      process.on("exit", () => {
        resolve();
      });
    });
  });
  Promise.all(promises).then((groupOfImages) => {
    let ite = 0;
    groupOfImages.forEach((images) => images.forEach((image) => {
      console.log("Image generated", ite);
      writeFileSync(`${fileName}_${ite++}.ppm`, createPPMFromFromImage(image));
    }));
    if (!fps)
      fps = Math.floor(1 / (times.reduce((e, t) => e + t, 0) / n));
    execSync(`ffmpeg -framerate ${fps} -i ${fileName}_%d.ppm ${fileName}.${extension}`);
    for (let i = 0;i < n; i++) {
      unlinkSync(`${fileName}_${i}.ppm`);
    }
  });
}
export {
  Vec3,
  Vec2,
  Vec,
  exports_Utils as Utils,
  Stream,
  Scene,
  Point_default as Point,
  exports_Monads as Monads,
  Mesh,
  Image,
  exports_IO as IO,
  DomBuilder_default as DOM,
  Color,
  Canvas,
  Camera,
  Box,
  Animation
};
