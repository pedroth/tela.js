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

// src/Utils/Constants.
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

// src/Utils/Constants.jsssr.
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

// src/Utils/Constant
var MAX_8BIT = 255;

class Color {
  constructor(rbg) {
    this.rgb = rbg;
  }
  toArray() {
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

// src/Utils/Constants.js
var MAX_8BIT2 = 255;

// src/Utils/Constants.
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
  take(n = 0, m = this._vec.length) {
    return Vec.fromArray(this._vec.slice(n, m));
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
  static ZERO = (n) => n === 3 ? new Vector3 : n === 2 ? new Vector2 : new Vec(BUILD_VEC(n));
  static ONES = (n) => {
    if (n === 2)
      return Vector2.ONES;
    if (n === 3)
      return Vector3.ONES;
    return Vec.ZERO(n).map(() => 1);
  };
  static e = (n) => (i) => {
    if (n === 2)
      return Vector2.e(i);
    if (n === 3)
      return Vector3.e(i);
    const vec = BUILD_VEC(n);
    if (i >= 0 && i < n) {
      vec[i] = 1;
    }
    return new Vec(vec);
  };
  static RANDOM = (n) => {
    if (n === 2)
      return Vector2.RANDOM();
    if (n === 3)
      return Vector3.RANDOM();
    const v = BUILD_VEC(n);
    for (let i = 0;i < n; i++) {
      v[i] = Math.random();
    }
    return new Vec(v);
  };
}
var BUILD_VEC = (n) => new ARRAY_TYPES.Float64Array(n);
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
  take(n = 0, m = 3) {
    const array = [this.x, this.y, this.z].slice(n, m);
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
  take(n = 0, m = 2) {
    const array = [this.x, this.y].slice(n, m);
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

// src/Utils/Constan
function smin(a, b, k = 32) {
  const res = Math.exp(-k * a) + Math.exp(-k * b);
  return -Math.log(res) / k;
}
function clipLine(p0, p1, box) {
  const pointStack = [p0, p1];
  const inStack = [];
  const outStack = [];
  for (let i = 0;i < pointStack.length; i++) {
    const p = pointStack[i];
    if (box.collidesWith(p)) {
      inStack.push(p);
    } else {
      outStack.push(p);
    }
  }
  if (inStack.length >= 2) {
    return inStack;
  }
  if (inStack.length === 1) {
    const [inPoint] = inStack;
    const [outPoint] = outStack;
    return [inPoint, ...lineBoxIntersection(inPoint, outPoint, box)];
  }
  return lineBoxIntersection(...outStack, box);
}
var lineBoxIntersection = function(start, end, box) {
  const width = box.diagonal.x;
  const height = box.diagonal.y;
  const v = end.sub(start);
  const boundary = [
    [Vec2(), Vec2(width, 0)],
    [Vec2(width, 0), Vec2(0, height)],
    [Vec2(width, height), Vec2(-width, 0)],
    [Vec2(0, height), Vec2(0, -height)]
  ];
  const intersectionSolutions = [];
  boundary.forEach(([s, d]) => {
    if (d.x === 0) {
      const solution = _solveLowTriMatrix(v, -d.y, s.sub(start));
      solution !== undefined && intersectionSolutions.push(solution);
    } else {
      const solution = _solveUpTriMatrix(v, -d.x, s.sub(start));
      solution !== undefined && intersectionSolutions.push(solution);
    }
  });
  const validIntersections = [];
  intersectionSolutions.forEach((solution) => {
    const [x, y] = [solution.x, solution.y];
    if (0 <= x && x <= 1 && 0 <= y && y <= 1) {
      validIntersections.push(solution);
    }
  });
  if (validIntersections.length === 0)
    return [];
  if (validIntersections.length >= 2) {
    const p1 = start.add(v.scale(validIntersections[0].x));
    const p2 = start.add(v.scale(validIntersections[1].x));
    return [p1, p2];
  }
  return [start.add(v.scale(validIntersections[0].x))];
};
var _solveLowTriMatrix = function(v, a, f) {
  const v1 = v.x;
  const v2 = v.y;
  const av1 = a * v1;
  if (av1 === 0 || v1 === 0)
    return;
  const f1 = f.x;
  const f2 = f.y;
  return Vec2(f1 / v1, (f2 * v1 - v2 * f1) / av1);
};
var _solveUpTriMatrix = function(v, a, f) {
  const v1 = v.x;
  const v2 = v.y;
  const av2 = a * v2;
  if (av2 === 0 || v2 === 0)
    return;
  const f1 = f.x;
  const f2 = f.y;
  return Vec2(f2 / v2, (f1 * v2 - v1 * f2) / av2);
};

// src/Utils/Constants.
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

// src/Utils/Cons
var maxComp = function(u) {
  return u.fold((e, x) => Math.max(e, x), -Number.MAX_VALUE);
};

class Box2 {
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
    return new Box2(min.op(box.min, Math.min), max.op(box.max, Math.max));
  }
  union = this.add;
  sub(box) {
    if (this.isEmpty)
      return Box2.EMPTY;
    const { min, max } = this;
    const newMin = min.op(box.min, Math.max);
    const newMax = max.op(box.max, Math.min);
    const newDiag = newMax.sub(newMin);
    const isAllPositive = newDiag.fold((e, x) => e && x >= 0, true);
    return !isAllPositive ? Box2.EMPTY : new Box2(newMin, newMax);
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
  scale(r) {
    return new Box2(this.min.sub(this.center).scale(r), this.max.sub(this.center).scale(r)).move(this.center);
  }
  move(v) {
    return new Box2(this.min.add(v), this.max.add(v));
  }
  equals(box) {
    if (!(box instanceof Box2))
      return false;
    if (this == Box2.EMPTY)
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
    const n = pointVec.dim;
    const grad = [];
    const d = this.distanceToPoint(pointVec);
    for (let i = 0;i < n; i++) {
      grad.push(this.distanceToPoint(pointVec.add(Vec.e(n)(i).scale(epsilon))) - d);
    }
    return Vec.fromArray(grad).scale(Math.sign(d)).normalize();
  }
  collidesWith(box) {
    const vectorCollision = () => !this.sub(new Box2(box, box)).isEmpty;
    const type2action = {
      [Box2.name]: () => !this.sub(box).isEmpty,
      Vector: vectorCollision,
      Vector3: vectorCollision,
      Vector2: vectorCollision
    };
    if (box.constructor.name in type2action) {
      return type2action[box.constructor.name]();
    }
    return false;
  }
  toString() {
    return `{
        min:${this.min.toString()},
        max:${this.max.toString()}
    }`;
  }
  static EMPTY = new Box2;
}

// src/Utils/Constants.
var drawConvexPolygon = function(canvas, positions, shader) {
  const { width, height } = canvas;
  const canvasBox = new Box2(Vec2(), Vec2(width, height));
  let boundingBox = Box2.EMPTY;
  positions.forEach((x) => {
    boundingBox = boundingBox.add(new Box2(x, x));
  });
  const finalBox = canvasBox.intersection(boundingBox);
  if (finalBox.isEmpty)
    return canvas;
  const [xMin, yMin] = finalBox.min.toArray();
  const [xMax, yMax] = finalBox.max.toArray();
  for (let x = xMin;x < xMax; x++) {
    for (let y = yMin;y < yMax; y++) {
      if (isInsideConvex(Vec2(x, y), positions)) {
        const j = x;
        const i = height - 1 - y;
        const color = shader(x, y);
        if (!color)
          continue;
        const index = 4 * (i * width + j);
        canvas._image[index] = color.red * MAX_8BIT2;
        canvas._image[index + 1] = color.green * MAX_8BIT2;
        canvas._image[index + 2] = color.blue * MAX_8BIT2;
        canvas._image[index + 3] = MAX_8BIT2;
      }
    }
  }
  return canvas;
};
var isInsideConvex = function(x, positions) {
  const m = positions.length;
  const v = [];
  const vDotN = [];
  for (let i = 0;i < m; i++) {
    const p1 = positions[(i + 1) % m];
    const p0 = positions[i];
    v[i] = p1.sub(p0);
    const vi = v[i];
    const n = Vec2(-vi.y, vi.x);
    const r = x.sub(p0);
    vDotN[i] = r.dot(n);
  }
  let orientation = v[0].x * v[1].y - v[0].y * v[1].x >= 0 ? 1 : -1;
  for (let i = 0;i < m; i++) {
    const myDot = vDotN[i] * orientation;
    if (myDot < 0)
      return false;
  }
  return true;
};
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
    return this.map(() => color);
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
      if (!color)
        return;
      this._image[k] = color.red * MAX_8BIT2;
      this._image[k + 1] = color.green * MAX_8BIT2;
      this._image[k + 2] = color.blue * MAX_8BIT2;
      this._image[k + 3] = MAX_8BIT2;
    }
    return this.paint();
  }
  setPxl(x, y, color) {
    const w = this._width;
    const h = this._height;
    const j = x;
    const i = h - 1 - y;
    let index = 4 * (w * i + j);
    this._image[index] = color.red * MAX_8BIT2;
    this._image[index + 1] = color.green * MAX_8BIT2;
    this._image[index + 2] = color.blue * MAX_8BIT2;
    this._image[index + 3] = MAX_8BIT2;
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
    const line = clipLine(p1, p2, new Box2(Vec2(0, 0), Vec2(w, h)));
    if (line.length <= 1)
      return;
    const [pi, pf] = line;
    const v = pf.sub(pi);
    const n = v.map(Math.abs).fold((e, x) => e + x);
    for (let k = 0;k < n; k++) {
      const s = k / n;
      const lineP = pi.add(v.scale(s)).map(Math.floor);
      const [x, y] = lineP.toArray();
      const j = x;
      const i = h - 1 - y;
      const index = 4 * (i * w + j);
      const color = shader(x, y);
      if (!color)
        continue;
      this._image[index] = color.red * MAX_8BIT2;
      this._image[index + 1] = color.green * MAX_8BIT2;
      this._image[index + 2] = color.blue * MAX_8BIT2;
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
  grid2canvas(i, j) {
    const h = this.height;
    const x = j;
    const y = h - 1 - i;
    return [x, y];
  }
  canvas2grid(x, y) {
    const h = this.height;
    const j = x;
    const i = h - 1 - y;
    return [i, j];
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
  static ofUrl(url) {
    return new Promise((resolve) => {
      const img = document.createElement("img");
      img.src = url;
      img.onload = function() {
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
      const img = new Image;
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
      };
    });
  }
}

// src/Utils/Constants.jsssr.js
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

// src/Utils/Constants.jsss
class Parallel {
  constructor(numberOfStreams, inputStreamGenerator, partitionFunction, stateGenerator, dependencies, lazyInitialState) {
    this.numberOfStreams = numberOfStreams;
    this.inputStreamGenerator = inputStreamGenerator;
    this.partitionFunction = partitionFunction;
    this.stateGenerator = stateGenerator;
    this.dependencies = dependencies;
    this.lazyInitialState = lazyInitialState;
  }
  getPartition() {
    return new Array(this.numberOfStreams).fill().map((_, i) => {
      return { ...this.inputStreamGenerator(i), __ite__: i };
    }).reduce((e, x, i) => {
      const value = this.partitionFunction(x, i);
      if (!(value in e)) {
        e[value] = [];
      }
      e[value].push(x);
      return e;
    }, {});
  }
  static builder() {
    return new ParallelBuilder;
  }
}

class ParallelBuilder {
  constructor() {
    this._numberOfStreams;
    this._inputStreamGenerator;
    this._partitionFunction;
    this._stateGenerator;
    this._dependencies;
    this._lazyInitialState = () => {
    };
  }
  numberOfStreams(numberOfStreams) {
    this._numberOfStreams = numberOfStreams;
    return this;
  }
  inputStreamGenerator(inputStreamGenerator) {
    this._inputStreamGenerator = inputStreamGenerator;
    return this;
  }
  partitionFunction(partitionFunction) {
    this._partitionFunction = partitionFunction;
    return this;
  }
  stateGenerator(stateGenerator, dependencies = []) {
    this._stateGenerator = stateGenerator;
    this._dependencies = dependencies;
    return this;
  }
  lazyInitialState(lazyInitialState) {
    this._lazyInitialState = lazyInitialState;
    return this;
  }
  build() {
    const attrs = [
      this._numberOfStreams,
      this._inputStreamGenerator,
      this._partitionFunction,
      this._stateGenerator,
      this._dependencies,
      this._lazyInitialState
    ];
    if (attrs.some((x) => x === undefined)) {
      throw new Error("Parallel is incomplete");
    }
    return new Parallel(...attrs);
  }
}

// src/Utils/Cons
function Ray(init, dir) {
  const ans = {};
  ans.init = init;
  ans.dir = dir;
  ans.trace = (t) => init.add(dir.scale(t));
  return ans;
}

// src/Utils/Constant
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
  distanceToPoint(p) {
    return this.position.sub(p).length() - this.radius;
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
    const n = this.position.dim;
    this.boundingBox = new Box2(this.position.add(Vec.ONES(n).scale(-this.radius)), this.position.add(Vec.ONES(n).scale(this.radius)));
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

// src/Utils/Constan
class Line {
  constructor(name, positions, colors) {
    this.name = name;
    this.positions = positions;
    this.colors = colors;
  }
  getBoundingBox() {
    if (this.boundingBox)
      return this.boundingBox;
    this.boundingBox = this.positions.reduce((box, x) => box.add(new Box(x, x)), Box.EMPTY);
    return this.boundingBox;
  }
  static builder() {
    return new LineBuilder;
  }
}

class LineBuilder {
  constructor() {
    this._name;
    this._positions;
    this._colors;
  }
  name(name) {
    this._name = name;
    return this;
  }
  positions(start, end) {
    this._positions = [start, end];
    return this;
  }
  colors(start, end) {
    this._colors = [start, end];
    return this;
  }
  build() {
    const attrs = [
      this._name,
      this._positions,
      this._colors
    ];
    if (attrs.some((x) => x === undefined)) {
      throw new Error("Line is incomplete");
    }
    return new Line(...attrs);
  }
}

// src/Utils/Constants.j
class Triangle {
  constructor(name, positions, colors, texCoords, texture) {
    this.name = name;
    this.colors = colors;
    this.positions = positions;
    this.texCoords = texCoords;
    this.texture = texture;
  }
  getBoundingBox() {
    if (this.boundingBox)
      return this.boundingBox;
    this.boundingBox = this.positions.reduce((box, x) => box.add(new Box2(x, x)), Box2.EMPTY);
    return this.boundingBox;
  }
  static builder() {
    return new TriangleBuilder;
  }
}

class TriangleBuilder {
  constructor() {
    this._name;
    this._positions;
    this._colors;
    this._texCoords = [];
    this._texture;
  }
  name(name) {
    this._name = name;
    return this;
  }
  positions(v1, v2, v3) {
    this._positions = [v1, v2, v3];
    return this;
  }
  colors(c1, c2, c3) {
    this._colors = [c1, c2, c3];
    return this;
  }
  texCoords(t1, t2, t3) {
    this._texCoords = [t1, t2, t3];
    return this;
  }
  texture(image) {
    this._texture = image;
    return this;
  }
  build() {
    const attrs = [
      this._name,
      this._positions,
      this._colors,
      this._texCoords
    ];
    if (attrs.some((x) => x === undefined)) {
      throw new Error("Triangle is incomplete");
    }
    return new Triangle(...attrs, this._texture);
  }
}

// src/Utils/Constants.
var rasterPoint = function({ canvas, camera, elem, w, h, zBuffer }) {
  const point = elem;
  const { distanceToPlane } = camera;
  let pointInCamCoord = camera.toCameraCoord(point.position);
  const z = pointInCamCoord.z;
  if (z < distanceToPlane)
    return;
  const projectedPoint = pointInCamCoord.scale(distanceToPlane / z);
  let x = w / 2 + projectedPoint.x * w;
  let y = h / 2 + projectedPoint.y * h;
  x = Math.floor(x);
  y = Math.floor(y);
  if (x < 0 || x >= w || y < 0 || y >= h)
    return;
  const radius = Math.ceil(point.radius * (distanceToPlane / z) * w);
  for (let k = -radius;k < radius; k++) {
    for (let l = -radius;l < radius; l++) {
      const xl = Math.max(0, Math.min(w - 1, x + k));
      const yl = Math.floor(y + l);
      const [i, j] = canvas.canvas2grid(xl, yl);
      const zBufferIndex = Math.floor(w * i + j);
      if (z < zBuffer[zBufferIndex]) {
        zBuffer[zBufferIndex] = z;
        canvas.setPxl(xl, yl, point.color);
      }
    }
  }
};
var rasterLine = function({ canvas, camera, elem, w, h, zBuffer }) {
  const lineElem = elem;
  const { colors, positions } = lineElem;
  const { distanceToPlane } = camera;
  const pointsInCamCoord = positions.map((p) => camera.toCameraCoord(p));
  let inFrustum = [];
  let outFrustum = [];
  pointsInCamCoord.forEach((p, i) => {
    const zCoord = p.z;
    if (zCoord < distanceToPlane) {
      outFrustum.push(i);
    } else {
      inFrustum.push(i);
    }
  });
  if (outFrustum.length === 2)
    return;
  if (outFrustum.length === 1) {
    const inVertex = inFrustum[0];
    const outVertex = outFrustum[0];
    const inter = _lineCameraPlaneIntersection(pointsInCamCoord[outVertex], pointsInCamCoord[inVertex], camera);
    pointsInCamCoord[outVertex] = inter;
  }
  const projectedPoint = pointsInCamCoord.map((p) => {
    return p.scale(distanceToPlane / p.z);
  });
  const intPoint = projectedPoint.map((p) => {
    let x = w / 2 + p.x * w;
    let y = h / 2 + p.y * h;
    x = Math.floor(x);
    y = Math.floor(y);
    return Vec2(x, y);
  });
  const v = intPoint[1].sub(intPoint[0]);
  const vSquared = v.squareLength();
  const shader = (x, y) => {
    const p = Vec2(x, y).sub(intPoint[0]);
    const t = v.dot(p) / vSquared;
    const z = pointsInCamCoord[0].z * (1 - t) + pointsInCamCoord[1].z * t;
    const c = colors[0].scale(1 - t).add(colors[1].scale(t));
    const [i, j] = canvas.canvas2grid(x, y);
    const zBufferIndex = Math.floor(w * i + j);
    if (z < zBuffer[zBufferIndex]) {
      zBuffer[zBufferIndex] = z;
      return c;
    }
  };
  canvas.drawLine(intPoint[0], intPoint[1], shader);
};
var rasterTriangle = function({ canvas, camera, elem, w, h, zBuffer }) {
  const triangleElem = elem;
  const { colors, positions, texCoords } = triangleElem;
  const { distanceToPlane } = camera;
  const pointsInCamCoord = positions.map((p) => camera.toCameraCoord(p));
  let inFrustum = [];
  let outFrustum = [];
  pointsInCamCoord.forEach((p, i) => {
    const zCoord = p.z;
    if (zCoord < distanceToPlane) {
      outFrustum.push(i);
    } else {
      inFrustum.push(i);
    }
  });
  if (outFrustum.length >= 1)
    return;
  const projectedPoint = pointsInCamCoord.map((p) => p.scale(distanceToPlane / p.z));
  const intPoint = projectedPoint.map((p) => {
    let x = w / 2 + p.x * w;
    let y = h / 2 + p.y * h;
    x = Math.floor(x);
    y = Math.floor(y);
    return Vec2(x, y);
  });
  const u = intPoint[2].sub(intPoint[0]);
  const v = intPoint[1].sub(intPoint[0]);
  const det = u.x * v.y - u.y * v.x;
  const shader = (x, y) => {
    const p = Vec2(x, y).sub(intPoint[0]);
    const alpha = -(v.x * p.y - v.y * p.x) / det;
    const beta = (u.x * p.y - u.y * p.x) / det;
    const gamma = 1 - alpha - beta;
    const z = pointsInCamCoord[0].z * gamma + pointsInCamCoord[1].z * alpha + pointsInCamCoord[2].z * beta;
    const c = colors[0].scale(gamma).add(colors[1].scale(alpha)).add(colors[2].scale(beta));
    const [i, j] = canvas.canvas2grid(x, y);
    const zBufferIndex = Math.floor(w * i + j);
    if (z < zBuffer[zBufferIndex]) {
      zBuffer[zBufferIndex] = z;
      return c;
    }
  };
  canvas.drawTriangle(intPoint[0], intPoint[1], intPoint[2], shader);
};
var _lineCameraPlaneIntersection = function(vertexOut, vertexIn, camera) {
  const { distanceToPlane } = camera;
  const v = vertexIn.sub(vertexOut);
  const alpha = (distanceToPlane - vertexOut.z) / v.z;
  const p = vertexOut.add(v.scale(alpha));
  return p;
};

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
      return scene.interceptWith(ray).map(([, normal]) => {
        return Color.ofRGB((normal.get(0) + 1) / 2, (normal.get(1) + 1) / 2, (normal.get(2) + 1) / 2);
      }).orElse(() => {
        return Color.BLACK;
      });
    };
    return this.rayShot(lambda);
  }
  reverseShot(scene) {
    const type2render = {
      [Point_default.name]: rasterPoint,
      [Line.name]: rasterLine,
      [Triangle.name]: rasterTriangle
    };
    return {
      to: (canvas) => {
        canvas.fill(Color.BLACK);
        const w = canvas.width;
        const h = canvas.height;
        const zBuffer = new Float64Array(w * h).fill(Number.MAX_VALUE);
        scene.getElements().forEach((elem) => {
          if (elem.constructor.name in type2render) {
            type2render[elem.constructor.name]({
              canvas,
              camera: this,
              elem,
              w,
              h,
              zBuffer
            });
          }
        });
        canvas.paint();
        return canvas;
      }
    };
  }
  toCameraCoord(x) {
    let pointInCamCoord = x.sub(this.eye);
    pointInCamCoord = Vec3(this.basis[0].dot(pointInCamCoord), this.basis[1].dot(pointInCamCoord), this.basis[2].dot(pointInCamCoord));
    return pointInCamCoord;
  }
}

// src/Utils/Constant
var exports_Utils = {};
__export(exports_Utils, {
  or: () => {
    {
      return or;
    }
  },
  measureTimeWithResult: () => {
    {
      return measureTimeWithResult;
    }
  },
  measureTimeWithAsyncResult: () => {
    {
      return measureTimeWithAsyncResult;
    }
  },
  measureTime: () => {
    {
      return measureTime;
    }
  },
  groupBy: () => {
    {
      return groupBy;
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
async function measureTimeWithAsyncResult(lambda) {
  const t = performance.now();
  const result = await lambda();
  return { result, time: 0.001 * (performance.now() - t) };
}
function measureTimeWithResult(lambda) {
  const t = performance.now();
  const result = lambda();
  return { result, time: 0.001 * (performance.now() - t) };
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
function groupBy(array, groupFunction) {
  const ans = {};
  array.forEach((x, i) => {
    const key = groupFunction(x, i);
    if (!ans[key])
      ans[key] = [];
    ans[key].push(x);
  });
  return ans;
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

// src/Utils/Constant
class Scene {
  constructor() {
    this.id2ElemMap = {};
    this.sceneElements = [];
    this.boundingBoxScene = new Node;
  }
  add(...elements) {
    return this.addList(elements);
  }
  addList(elements) {
    for (let i = 0;i < elements.length; i++) {
      const elem = elements[i];
      const { name } = elem;
      this.id2ElemMap[name] = elem;
      this.sceneElements.push(elem);
      this.boundingBoxScene.add(elem);
    }
    return this;
  }
  clear() {
    this.id2ElemMap = {};
    this.sceneElements = [];
    this.boundingBoxScene = new Node;
  }
  getElements() {
    return this.sceneElements;
  }
  interceptWith(ray, level) {
    return this.boundingBoxScene.interceptWith(ray, level);
  }
  distanceToPoint(p) {
    return this.boundingBoxScene.distanceToPoint(p);
  }
  estimateNormal(p) {
    const epsilon = 0.001;
    const n = p.dim;
    const grad = [];
    const d = this.distanceToPoint(p);
    for (let i = 0;i < n; i++) {
      grad.push(this.distanceToPoint(p.add(Vec.e(n)(i).scale(epsilon))) - d);
    }
    return Vec.fromArray(grad).scale(Math.sign(d)).normalize();
  }
}

class Node {
  isLeaf = false;
  numberOfLeafs = 0;
  leafs = [];
  constructor() {
    this.box = Box2.EMPTY;
  }
  add(element) {
    this.numberOfLeafs += 1;
    this.leafs.push(element);
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
  interceptWith(ray, depth = 1) {
    return this.box.interceptWith(ray).flatMap(() => {
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
  distanceToPoint(p) {
    if (this.numberOfLeafs <= 2) {
      return this.getElements().reduce((e, leaf) => smin(e, leaf.distanceToPoint(p)), 1000);
    }
    const children = [this.left, this.right];
    const index = argmin(children, (c) => c.box.distanceToPoint(p));
    return children[index].distanceToPoint(p);
  }
  getElements() {
    return this.leafs;
  }
  getRandomLeaf() {
    return Math.random() < 0.5 ? this.left.getRandomLeaf() : this.right.getRandomLeaf();
  }
}

class Leaf {
  isLeaf = true;
  constructor(element) {
    this.element = element;
    this.box = element.getBoundingBox();
  }
  distanceToPoint(x) {
    return this.element.distanceToPoint(x);
  }
  getLeafs() {
    return [this];
  }
  getRandomLeaf() {
    return this;
  }
  interceptWith(ray, depth) {
    return this.element.interceptWith(ray);
  }
}

// src/Utils/Constants.jss
class NaiveScene {
  constructor() {
    this.id2ElemMap = {};
    this.sceneElements = [];
  }
  add(...elements) {
    return this.addList(elements);
  }
  addList(elements) {
    for (let i = 0;i < elements.length; i++) {
      const elem = elements[i];
      const { name } = elem;
      this.id2ElemMap[name] = elem;
      this.sceneElements.push(elem);
    }
    return this;
  }
  clear() {
    this.id2ElemMap = {};
    this.sceneElements = [];
  }
  getElements() {
    return this.sceneElements;
  }
  distanceToPoint(p) {
    const elements = this.sceneElements;
    let distance = Number.MAX_VALUE;
    for (let i = 0;i < elements.length; i++) {
      distance = smin(distance, elements[i].distanceToPoint(p));
    }
    return;
  }
  estimateNormal(p) {
    const epsilon = 0.001;
    const n = p.dim;
    const grad = [];
    const d = this.distanceToPoint(p);
    for (let i = 0;i < n; i++) {
      grad.push(this.distanceToPoint(p.add(Vec.e(n)(i).scale(epsilon))) - d);
    }
    return Vec.fromArray(grad).scale(Math.sign(d)).normalize();
  }
  interceptWith(ray) {
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

// src/Utils/Constan
var RADIUS = 0.001;

class Mesh {
  constructor({ vertices, normals, textureCoords, faces, colors, texture }) {
    this.vertices = vertices || [];
    this.normals = normals || [];
    this.textureCoords = textureCoords || [];
    this.faces = faces || [];
    this.colors = colors || [];
    this.texture = texture;
  }
  addTexture(image) {
    this.texture = image;
    return this;
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
      faces: this.faces,
      texture: this.texture
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
      colors: newColors,
      texture: this.texture
    });
  }
  getBoundingBox() {
    if (this.boundingBox)
      return this.boundingBox;
    this.boundingBox = new Box2;
    for (let i = 0;i < this.vertices.length; i++) {
      this.boundingBox = this.boundingBox.add(new Box2(this.vertices[i].add(Vec3(1, 1, 1).scale(RADIUS)), this.vertices[i].add(Vec3(1, 1, 1).scale(RADIUS))));
    }
    return this.boundingBox;
  }
  asPoints(name, radius = RADIUS) {
    const points = [];
    for (let i = 0;i < this.vertices.length; i++) {
      points.push(Point_default.builder().radius(radius).name(`${name}_${i}`).color(this.colors[i] || Color.RED).position(this.vertices[i]).normal(this.normals[i] || Vec3(1, 0, 0)).build());
    }
    return points;
  }
  asLines(name) {
    const lines = {};
    for (let i = 0;i < this.faces.length; i++) {
      const indices = this.faces[i].vertices;
      for (let j = 0;j < indices.length; j++) {
        const vi = indices[j] - 1;
        const vj = indices[(j + 1) % indices.length] - 1;
        const edge_id = [vi, vj].sort().join("_");
        const edge_name = `${name}_${edge_id}`;
        lines[edge_id] = Line.builder().name(edge_name).positions(this.vertices[vi], this.vertices[vj]).colors(this.colors[vi] || Color.GREEN, this.colors[vj] || Color.GREEN).build();
      }
    }
    return Object.values(lines);
  }
  asTriangles(name) {
    const triangles = {};
    for (let i = 0;i < this.faces.length; i++) {
      const texCoordIndexes = this.faces[i].textures.map((x) => x - 1);
      const normalIndexes = this.faces[i].normals.map((x) => x - 1);
      const verticesIndexes = this.faces[i].vertices.map((x) => x - 1);
      const edge_id = verticesIndexes.sort().join("_");
      const edge_name = `${name}_${edge_id}`;
      triangles[edge_id] = Triangle.builder().name(edge_name).texture(this.texture).positions(...verticesIndexes.map((j) => this.vertices[j])).texCoords(...texCoordIndexes.map((j) => this.textureCoords[j])).colors(...verticesIndexes.map((j) => this.colors[j] || Color.BLUE)).build();
    }
    return Object.values(triangles);
  }
  static readObj(objFile) {
    const vertices = [];
    const normals = [];
    const textureCoords = [];
    const faces = [];
    const lines = objFile.split("\n");
    for (let i = 0;i < lines.length; i++) {
      const line = lines[i];
      const spaces = line.split(" ");
      const type = spaces[0];
      if (!type)
        continue;
      if (type === "v") {
        const v = spaces.slice(1, 4).map((x) => Number.parseFloat(x));
        vertices.push(Vec3(...v));
        continue;
      }
      if (type === "vn") {
        const v = spaces.slice(1, 4).map((x) => Number.parseFloat(x));
        normals.push(Vec3(...v));
        continue;
      }
      if (type === "vt") {
        const v = spaces.slice(1, 3).map((x) => Number.parseFloat(x));
        textureCoords.push(Vec2(...v));
        continue;
      }
      if (type === "f") {
        const facesInfo = spaces.slice(1, 4).flatMap((x) => x.split("/")).map((x) => Number.parseFloat(x));
        const length = facesInfo.length;
        const lengthDiv3 = length / 3;
        const group = groupBy(facesInfo, (_, i2) => i2 % Math.floor(lengthDiv3));
        const face = { vertices: [], textures: [], normals: [] };
        Object.keys(group).map((k) => {
          k = Number.parseInt(k);
          if (k === 0)
            face.vertices = group[k];
          if (k === 1)
            face.textures = group[k];
          if (k === 2)
            face.normals = group[k];
        });
        faces.push(face);
        continue;
      }
    }
    return new Mesh({ vertices, normals, textureCoords, faces });
  }
}
// src/Utils/Co
var exports_IO = {};
__export(exports_IO, {
  saveParallelImageStreamToVideo: () => {
    {
      return saveParallelImageStreamToVideo;
    }
  },
  saveImageToFile: () => {
    {
      return saveImageToFile;
    }
  },
  saveImageStreamToVideo: () => {
    {
      return saveImageStreamToVideo;
    }
  },
  readImageFrom: () => {
    {
      return readImageFrom;
    }
  },
  createPPMFromImage: () => {
    {
      return createPPMFromImage;
    }
  }
});
import {writeFileSync, unlinkSync, readFileSync} from "fs";
import {execSync, exec} from "child_process";

// src/Utils/Constant
class Image2 {
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
    return this.map(() => color);
  }
  paint() {
    return this;
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
  setPxl(x, y, color) {
    const w = this._width;
    const h = this._height;
    const i = h - 1 - y;
    const j = x;
    let index = w * i + j;
    this._image[index] = color;
    return this;
  }
  getPxl(x, y) {
    const w = this._width;
    const h = this._height;
    const i = h - 1 - y;
    const j = x;
    let index = w * i + j;
    return this._image[index];
  }
  drawLine(p1, p2, shader) {
    const w = this._width;
    const h = this._height;
    const line = clipLine(p1, p2, new Box2(Vec2(0, 0), Vec2(w, h)));
    if (line.length <= 1)
      return;
    const [pi, pf] = line;
    const v = pf.sub(pi);
    const n = v.map(Math.abs).fold((e, x) => e + x);
    for (let k = 0;k < n; k++) {
      const s = k / n;
      const lineP = pi.add(v.scale(s)).map(Math.floor);
      const [x, y] = lineP.toArray();
      const j = x;
      const i = h - 1 - y;
      const index = i * w + j;
      const color = shader(x, y);
      if (!color)
        continue;
      this._image[index] = color;
    }
    return this;
  }
  array() {
    return this.toArray();
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
  grid2canvas(i, j) {
    const h = this.height;
    const x = j;
    const y = h - 1 - i;
    return [x, y];
  }
  canvas2grid(x, y) {
    const h = this.height;
    const j = x;
    const i = h - 1 - y;
    return [i, j];
  }
  static ofUrl(url) {
    return readImageFrom(url);
  }
  static ofSize(width, height) {
    return new Image2(width, height);
  }
  static ofDOM(canvasDOM) {
    const ctx = canvasDOM.getContext("2d", { willReadFrequently: true });
    const w = canvasDOM.width;
    const h = canvasDOM.height;
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const image = Image2.ofSize(w, h);
    for (let i = 0;i < data.length; i += 4) {
      const color = Color.ofRGB(data[i] / 255, data[i + 1] / 255, data[i + 2] / 255);
      image._image[Math.floor(i / 4)] = color;
    }
  }
  static ofCanvas(canvas) {
    const w = canvas.width;
    const h = canvas.height;
    return Image2.ofSize(w, h).map((x, y) => {
      return canvas.get(x, y);
    });
  }
}

// src/Utils/Co
function saveImageToFile(fileAddress, image) {
  const { fileName, extension } = getFileNameAndExtensionFromAddress(fileAddress);
  const ppmName = `${fileName}.ppm`;
  writeFileSync(ppmName, createPPMFromImage(image));
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
var parsePPM = function(data) {
  const NEW_LINE_CHAR = 10;
  let index = 0;
  let headerLines = 3;
  while (headerLines > 0) {
    if (data[index] === NEW_LINE_CHAR)
      headerLines--;
    index++;
  }
  const [, width, height, maxColor] = data.slice(0, index).map((x) => String.fromCharCode(x)).join("").match(/\d+/g).map(Number);
  const pixelStart = index;
  const pixels = [];
  for (let i = pixelStart;i < data.length; i += 3) {
    pixels.push({
      r: data[i],
      g: data[i + 1],
      b: data[i + 2]
    });
  }
  return { width, height, maxColor, pixels };
};
function readImageFrom(src) {
  const { fileName } = getFileNameAndExtensionFromAddress(src);
  execSync(`ffmpeg -i ${src} ${fileName}.ppm`);
  const imageFile = readFileSync(`${fileName}.ppm`);
  const { width: w, height: h, pixels } = parsePPM(Array.from(imageFile));
  unlinkSync(`${fileName}.ppm`);
  const img = Image2.ofSize(w, h);
  for (let k = 0;k < pixels.length; k++) {
    const { r, g, b } = pixels[k];
    const i = Math.floor(k / w);
    const j = k % w;
    const x = j;
    const y = h - 1 - i;
    img.setPxl(x, y, Color.ofRGBRaw(r, g, b));
  }
  return img;
}
function createPPMFromImage(image) {
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
function saveImageStreamToVideo(fileAddress, streamWithImages, { imageGetter = (s) => s.image, fps }) {
  const { fileName, extension } = getFileNameAndExtensionFromAddress(fileAddress);
  let ite = 0;
  let time = 0;
  let timeCheck = performance.now();
  return {
    until: (streamStatePredicate) => {
      let s = streamWithImages;
      while (streamStatePredicate(s.head)) {
        const image = imageGetter(s.head);
        writeFileSync(`${fileName}_${ite++}.ppm`, createPPMFromImage(image));
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
function saveParallelImageStreamToVideo(fileAddress, parallelStreamOfImages, { fps }) {
  const { fileName, extension } = getFileNameAndExtensionFromAddress(fileAddress);
  const partition = parallelStreamOfImages.getPartition();
  const inputParamsPartitions = Object.values(partition);
  const n = inputParamsPartitions.reduce((acc, partition2) => {
    acc += partition2.length;
    return acc;
  }, 0);
  const promises = inputParamsPartitions.map((inputParams, i) => {
    const spawnFile = "IO_parallel" + i + ".js";
    writeFileSync(spawnFile, `
            import {DOM, Color, Animation, Scene, Camera, Vec2, Vec3, Vec, Box, Point, Mesh, Image,NaiveScene} from "./dist/node/index.js"
            import fs from "fs";

            
            ${createPPMFromImage.toString().replaceAll("function(image)", "function __createPPMFromImage__(image)")}
            
            ${parallelStreamOfImages.dependencies.map((dependency) => dependency.toString()).join("\n")}
            
            const __initial_state__ = (${parallelStreamOfImages.lazyInitialState})();

            const __gen__ = ${parallelStreamOfImages.stateGenerator.toString()};
            
            const partition_inputs = ${JSON.stringify(inputParams)};
            partition_inputs.forEach(input => {
                const {__ite__} = input;
                const combinedInput = !__initial_state__ ? input : {...input, ...__initial_state__}; 
                const __img__ = __gen__(combinedInput);
                fs.writeFileSync(\`${fileName}_\${__ite__}.ppm\`, __createPPMFromImage__(__img__));
            });
        `);
    return new Promise((resolve) => {
      exec(`bun ${spawnFile}`, () => resolve());
    });
  });
  return Promise.all(promises).then(() => {
    execSync(`ffmpeg -framerate ${fps} -i ${fileName}_%d.ppm ${fileName}.${extension}`);
    for (let i = 0;i < n; i++) {
      unlinkSync(`${fileName}_${i}.ppm`);
    }
    for (let i = 0;i < inputParamsPartitions.length; i++) {
      const spawnFile = "IO_parallel" + i + ".js";
      unlinkSync(spawnFile);
    }
  });
}
export {
  Vec3,
  Vec2,
  Vec,
  exports_Utils as Utils,
  Triangle,
  Stream,
  Scene,
  Point_default as Point,
  Parallel,
  NaiveScene,
  exports_Monads as Monads,
  Mesh,
  Line,
  Image2 as Image,
  exports_IO as IO,
  DomBuilder_default as DOM,
  Color,
  Canvas,
  Camera,
  Box2 as Box,
  Animation
};
