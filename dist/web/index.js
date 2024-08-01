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
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);
var __require = ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// node:os
var exports_os = {};
__export(exports_os, {
  uptime: () => {
    {
      return A;
    }
  },
  type: () => {
    {
      return V;
    }
  },
  totalmem: () => {
    {
      return N;
    }
  },
  tmpdir: () => {
    {
      return U;
    }
  },
  release: () => {
    {
      return x;
    }
  },
  platform: () => {
    {
      return O;
    }
  },
  networkInterfaces: () => {
    {
      return j;
    }
  },
  loadavg: () => {
    {
      return y;
    }
  },
  hostname: () => {
    {
      return k;
    }
  },
  homedir: () => {
    {
      return _;
    }
  },
  getNetworkInterfaces: () => {
    {
      return B;
    }
  },
  freemem: () => {
    {
      return I;
    }
  },
  endianness: () => {
    {
      return L;
    }
  },
  default: () => {
    {
      return E;
    }
  },
  cpus: () => {
    {
      return b;
    }
  },
  arch: () => {
    {
      return M;
    }
  },
  EOL: () => {
    {
      return X;
    }
  }
});
var c, a, m, s, p, d, l, h, g, f, u, E, L, k, y, A, I, N, b, V, x, M, O, U, X, _, j, B;
var init_os = __esm(() => {
  c = Object.create;
  a = Object.defineProperty;
  m = Object.getOwnPropertyDescriptor;
  s = Object.getOwnPropertyNames;
  p = Object.getPrototypeOf;
  d = Object.prototype.hasOwnProperty;
  l = (r, n) => () => (n || r((n = { exports: {} }).exports, n), n.exports);
  h = (r, n, t, i) => {
    if (n && typeof n == "object" || typeof n == "function")
      for (let o of s(n))
        !d.call(r, o) && o !== t && a(r, o, { get: () => n[o], enumerable: !(i = m(n, o)) || i.enumerable });
    return r;
  };
  g = (r, n, t) => (t = r != null ? c(p(r)) : {}, h(n || !r || !r.__esModule ? a(t, "default", { value: r, enumerable: true }) : t, r));
  f = l((e) => {
    e.endianness = function() {
      return "LE";
    };
    e.hostname = function() {
      return typeof location < "u" ? location.hostname : "";
    };
    e.loadavg = function() {
      return [];
    };
    e.uptime = function() {
      return 0;
    };
    e.freemem = function() {
      return Number.MAX_VALUE;
    };
    e.totalmem = function() {
      return Number.MAX_VALUE;
    };
    e.cpus = function() {
      return [];
    };
    e.type = function() {
      return "Browser";
    };
    e.release = function() {
      return typeof navigator < "u" ? navigator.appVersion : "";
    };
    e.networkInterfaces = e.getNetworkInterfaces = function() {
      return {};
    };
    e.arch = function() {
      return "javascript";
    };
    e.platform = function() {
      return "browser";
    };
    e.tmpdir = e.tmpDir = function() {
      return "/tmp";
    };
    e.EOL = `
`;
    e.homedir = function() {
      return "/";
    };
  });
  u = g(f());
  E = u.default;
  ({ endianness: L, hostname: k, loadavg: y, uptime: A, freemem: I, totalmem: N, cpus: b, type: V, release: x, arch: M, platform: O, tmpdir: U, EOL: X, homedir: _, networkInterfaces: j, getNetworkInterfaces: B } = u.default);
});

// src/Utils/Constants.js
var MAX_8BIT = 255;
var RAD2DEG = 180 / Math.PI;
var IS_NODE = typeof process !== "undefined" && process.versions && process.versions.node;
var NUMBER_OF_CORES = IS_NODE ? (await Promise.resolve().then(() => (init_os(), exports_os))).cpus().length : navigator.hardwareConcurrency;

// src/Color/Color.js
class Color {
  constructor(rgb, alpha = 1) {
    this.rgb = rgb;
    this.alpha = alpha;
  }
  toArray() {
    return [this.red, this.green, this.blue, this.alpha];
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
    return Color.ofRGB(this.rgb[0] + color.red, this.rgb[1] + color.green, this.rgb[2] + color.blue, this.alpha + color.alpha);
  }
  scale(r) {
    return Color.ofRGB(r * this.red, r * this.green, r * this.blue, r * this.alpha);
  }
  mul(color) {
    return Color.ofRGB(this.rgb[0] * color.red, this.rgb[1] * color.green, this.rgb[2] * color.blue, this.alpha * color.alpha);
  }
  equals(color) {
    return this.rgb[0] === color.rgb[0] && this.rgb[1] === color.rgb[1] && this.rgb[2] === color.rgb[2] && this.alpha === color.alpha;
  }
  toString() {
    return `red: ${this.red}, green: ${this.green}, blue: ${this.blue}`;
  }
  toGamma(alpha = 0.5) {
    const r = this.red ** alpha;
    const g2 = this.green ** alpha;
    const b2 = this.blue ** alpha;
    return Color.ofRGB(r, g2, b2);
  }
  static ofRGB(red = 0, green = 0, blue = 0, alpha = 1) {
    const rgb = [];
    rgb[0] = red;
    rgb[1] = green;
    rgb[2] = blue;
    return new Color(rgb, alpha);
  }
  static ofRGBRaw(red = 0, green = 0, blue = 0, alpha = MAX_8BIT) {
    const rgb = [];
    rgb[0] = red / MAX_8BIT;
    rgb[1] = green / MAX_8BIT;
    rgb[2] = blue / MAX_8BIT;
    return new Color(rgb, alpha / MAX_8BIT);
  }
  static ofHSV(hue, s2, v) {
    const h2 = hue * RAD2DEG;
    let f2 = (n, k2 = (n + h2 / 60) % 6) => v - v * s2 * Math.max(Math.min(k2, 4 - k2, 1), 0);
    return new Color([f2(5), f2(3), f2(1)]);
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
  static GRAY = Color.ofRGB(0.5, 0.5, 0.5);
  static GREY = Color.ofRGB(0.5, 0.5, 0.5);
  static PURPLE = Color.ofRGB(1, 0, 1);
  static YELLOW = Color.ofRGB(1, 1, 0);
  static CYAN = Color.ofRGB(0, 1, 1);
}

// src/Utils/Utils.js
async function measureTime(lambda) {
  const t = performance.now();
  await lambda();
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
function groupBy(array, groupFunction) {
  const ans = {};
  array.forEach((x2, i) => {
    const key = groupFunction(x2, i);
    if (!ans[key])
      ans[key] = [];
    ans[key].push(x2);
  });
  return ans;
}
function argmin(array, costFunction = (x2) => x2) {
  let argminIndex = -1;
  let cost = Number.MAX_VALUE;
  for (let i = 0;i < array.length; i++) {
    const newCost = costFunction(array[i], i);
    if (newCost < cost) {
      cost = newCost;
      argminIndex = i;
    }
  }
  return argminIndex;
}
function memoize(func) {
  const cache = {};
  return (...args) => {
    const key = JSON.stringify(args.map((x2) => typeof x2 === "object" ? JSON.stringify(x2) : x2.toString()));
    if (key in cache)
      return cache[key];
    const ans = func(...args);
    cache[key] = ans;
    return ans;
  };
}
function fRandom() {
  if (i > 1e6)
    i = 0;
  return RANDOM[i++ % RANDOM.length];
}
function loop(lambda) {
  let isFinished = false;
  const play = async ({ time, oldT }) => {
    const newT = new Date().getTime();
    const dt = (newT - oldT) * 0.001;
    await lambda({ time, dt });
    if (isFinished)
      return;
    setTimeOut(() => play({
      oldT: newT,
      time: time + dt
    }));
  };
  const loopControl = {
    stop: () => {
      isFinished = true;
    },
    play: () => play({ oldT: new Date().getTime(), time: 0 })
  };
  return loopControl;
}
function hashStr(string) {
  let hash = 0;
  for (let i = 0;i < string.length; i++) {
    hash = hash * 37 ^ string.charCodeAt(i);
  }
  return hash >>> 0;
}
var RANDOM = Array(1000).fill().map(Math.random);
var i = 0;
var setTimeOut = typeof window === "undefined" ? setTimeout : requestAnimationFrame;

// src/Vector/Vector.js
function Vec3(x2 = 0, y2 = 0, z = 0) {
  return new Vector3(x2, y2, z);
}
function Vec2(x2 = 0, y2 = 0) {
  return new Vector2(x2, y2);
}

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
  clone() {
    return new Vec(COPY_VEC(this._vec));
  }
  get(i2) {
    return this._vec[i2];
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
  add(u2) {
    return this.op(u2, (a2, b2) => a2 + b2);
  }
  sub(u2) {
    return this.op(u2, (a2, b2) => a2 - b2);
  }
  mul(u2) {
    return this.op(u2, (a2, b2) => a2 * b2);
  }
  div(u2) {
    return this.op(u2, (a2, b2) => a2 / b2);
  }
  dot(u2) {
    let acc = 0;
    for (let i2 = 0;i2 < this._n; i2++) {
      acc += this._vec[i2] * u2._vec[i2];
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
    for (let i2 = 0;i2 < this._n; i2++) {
      ans[i2] = lambda(this._vec[i2], i2);
    }
    return new Vec(ans);
  }
  op(u2, operation) {
    const ans = BUILD_VEC(this._n);
    for (let i2 = 0;i2 < this._n; i2++) {
      ans[i2] = operation(this._vec[i2], u2._vec[i2]);
    }
    return new Vec(ans);
  }
  reduce(fold, init = 0) {
    let acc = init;
    for (let i2 = 0;i2 < this._n; i2++) {
      acc = fold(acc, this._vec[i2], i2);
    }
    return acc;
  }
  fold = this.reduce;
  foldLeft = this.fold;
  equals(u2, precision = 0.00001) {
    if (!(u2 instanceof Vec))
      return false;
    return this.sub(u2).length() < precision;
  }
  take(n = 0, m2 = this._vec.length) {
    return Vec.fromArray(this._vec.slice(n, m2));
  }
  findIndex(predicate) {
    for (let i2 = 0;i2 < this._n; i2++) {
      if (predicate(this._vec[i2]))
        return i2;
    }
    return -1;
  }
  static fromArray(array) {
    if (array.length === 2)
      return Vector2.fromArray(array);
    if (array.length === 3)
      return Vector3.fromArray(array);
    return new Vec(array);
  }
  static of(...values) {
    if (values.length === 2)
      return Vector2.of(...values);
    if (values.length === 3)
      return Vector3.of(...values);
    return new Vec(values);
  }
  static ZERO = (n) => n === 3 ? new Vector3 : n === 2 ? new Vector2 : new Vec(BUILD_VEC(n));
  static ONES = (n) => {
    if (n === 2)
      return Vector2.ONES;
    if (n === 3)
      return Vector3.ONES;
    return Vec.ZERO(n).map(() => 1);
  };
  static e = (n) => (i2) => {
    if (n === 2)
      return Vector2.e(i2);
    if (n === 3)
      return Vector3.e(i2);
    const vec = BUILD_VEC(n);
    if (i2 >= 0 && i2 < n) {
      vec[i2] = 1;
    }
    return new Vec(vec);
  };
  static RANDOM = (n) => {
    if (n === 2)
      return Vector2.RANDOM();
    if (n === 3)
      return Vector3.RANDOM();
    const v = BUILD_VEC(n);
    for (let i2 = 0;i2 < n; i2++) {
      v[i2] = Math.random();
    }
    return new Vec(v);
  };
}
var BUILD_VEC = (n) => new Float64Array(n);
var COPY_VEC = (array) => Float64Array.from(array);
class Vector3 {
  constructor(x2 = 0, y2 = 0, z = 0) {
    this.x = x2;
    this.y = y2;
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
  get(i2) {
    return [this.x, this.y, this.z][i2];
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
  add(u2) {
    return this.op(u2, (a2, b2) => a2 + b2);
  }
  sub(u2) {
    return this.op(u2, (a2, b2) => a2 - b2);
  }
  mul(u2) {
    return this.op(u2, (a2, b2) => a2 * b2);
  }
  div(u2) {
    return this.op(u2, (a2, b2) => a2 / b2);
  }
  dot(u2) {
    return this.x * u2.x + this.y * u2.y + this.z * u2.z;
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
  cross(v) {
    const u2 = this;
    return Vec3(u2.y * v.z - u2.z * v.y, u2.z * v.x - u2.x * v.z, u2.x * v.y - u2.y * v.x);
  }
  op(u2, operation) {
    return new Vector3(operation(this.x, u2.x), operation(this.y, u2.y), operation(this.z, u2.z));
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
  equals(u2, precision = 0.00001) {
    if (!(u2 instanceof Vector3))
      return false;
    return this.sub(u2).length() < precision;
  }
  take(n = 0, m2 = 3) {
    const array = [this.x, this.y, this.z].slice(n, m2);
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
  static e = (i2) => {
    if (i2 === 0)
      return new Vector3(1, 0, 0);
    if (i2 === 1)
      return new Vector3(0, 1, 0);
    if (i2 === 2)
      return new Vector3(0, 0, 1);
    return new Vec3;
  };
  static RANDOM = () => {
    return new Vector3(Math.random(), Math.random(), Math.random());
  };
  static ONES = new Vector3(1, 1, 1);
}

class Vector2 {
  constructor(x2 = 0, y2 = 0) {
    this.x = x2;
    this.y = y2;
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
  get(i2) {
    return [this.x, this.y][i2];
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
  add(u2) {
    return this.op(u2, (a2, b2) => a2 + b2);
  }
  sub(u2) {
    return this.op(u2, (a2, b2) => a2 - b2);
  }
  mul(u2) {
    return this.op(u2, (a2, b2) => a2 * b2);
  }
  div(u2) {
    return this.op(u2, (a2, b2) => a2 / b2);
  }
  dot(u2) {
    return this.x * u2.x + this.y * u2.y;
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
  cross(v) {
    const u2 = this;
    return u2.x * v.y - u2.y * v.x;
  }
  op(u2, operation) {
    return new Vector2(operation(this.x, u2.x), operation(this.y, u2.y));
  }
  reduce(fold, init = 0) {
    let acc = init;
    acc = fold(acc, this.x);
    acc = fold(acc, this.y);
    return acc;
  }
  fold = this.reduce;
  foldLeft = this.fold;
  equals(u2, precision = 0.00001) {
    if (!(u2 instanceof Vector2))
      return false;
    return this.sub(u2).length() < precision;
  }
  take(n = 0, m2 = 2) {
    const array = [this.x, this.y].slice(n, m2);
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
  static e = (i2) => {
    if (i2 === 0)
      return new Vector2(1, 0);
    if (i2 === 1)
      return new Vector2(0, 1);
    return new Vector2;
  };
  static RANDOM = () => {
    return new Vector2(Math.random(), Math.random());
  };
  static ONES = new Vector2(1, 1);
}

// src/Geometry/Box.js
var maxComp = function(u2) {
  return u2.fold((e, x2) => Math.max(e, x2), -Number.MAX_VALUE);
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
    this.dim = min.dim;
  }
  getBoundingBox() {
    return this;
  }
  distanceToPoint(pointVec) {
    const p2 = pointVec.sub(this.center);
    const r = this.max.sub(this.center);
    const q = p2.map(Math.abs).sub(r);
    return q.map((x2) => Math.max(x2, 0)).length() + Math.min(0, maxComp(q));
  }
  normalToPoint(pointVec) {
    const epsilon = 0.001;
    const n = pointVec.dim;
    const grad = [];
    const d2 = this.distanceToPoint(pointVec);
    for (let i2 = 0;i2 < n; i2++) {
      grad.push(this.distanceToPoint(pointVec.add(Vec.e(n)(i2).scale(epsilon))) - d2);
    }
    return Vec.fromArray(grad).scale(Math.sign(d2)).normalize();
  }
  interceptWithRay(ray) {
    const epsilon = 0.001;
    let tmin = -Number.MAX_VALUE;
    let tmax = Number.MAX_VALUE;
    if (this.isEmpty)
      return;
    const minArray = this.min.toArray();
    const maxArray = this.max.toArray();
    const rInit = ray.init.toArray();
    const dirInv = ray.dirInv.toArray();
    const dim = this.min?.dim;
    for (let i2 = 0;i2 < dim; ++i2) {
      let t1 = (minArray[i2] - rInit[i2]) * dirInv[i2];
      let t2 = (maxArray[i2] - rInit[i2]) * dirInv[i2];
      tmin = Math.max(tmin, Math.min(t1, t2));
      tmax = Math.min(tmax, Math.max(t1, t2));
    }
    return tmax >= Math.max(tmin, 0) ? [tmin - epsilon, ray.trace(tmin - epsilon), this] : undefined;
  }
  interceptWithLine(a2, b2) {
    const epsilon = 0.001;
    let tmin = -Number.MAX_VALUE;
    let tmax = Number.MAX_VALUE;
    if (this.isEmpty)
      return;
    const minArray = this.min.toArray();
    const maxArray = this.max.toArray();
    const rInit = a2.toArray();
    const dir = b2.sub(a2).normalize();
    const dirInv = dir.map((x2) => 1 / (x2 + epsilon)).toArray();
    const dim = this.min?.dim;
    for (let i2 = 0;i2 < dim; ++i2) {
      let t1 = (minArray[i2] - rInit[i2]) * dirInv[i2];
      let t2 = (maxArray[i2] - rInit[i2]) * dirInv[i2];
      tmin = Math.max(tmin, Math.min(t1, t2));
      tmax = Math.min(tmax, Math.max(t1, t2));
    }
    if (Number.isNaN(tmin) || Number.isNaN(tmax))
      return;
    if (Math.abs(tmin - tmax) < epsilon)
      return [a2.add(dir.scale(tmin - epsilon))];
    return [a2.add(dir.scale(tmin - epsilon)), a2.add(dir.scale(tmax - epsilon))];
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
    const isAllPositive = newDiag.fold((e, x2) => e && x2 >= 0, true);
    return !isAllPositive ? Box.EMPTY : new Box(newMin, newMax);
  }
  intersection = this.sub;
  scale(r) {
    return new Box(this.min.sub(this.center).scale(r), this.max.sub(this.center).scale(r)).move(this.center);
  }
  move(v) {
    return new Box(this.min.add(v), this.max.add(v));
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
  collidesWith(arg) {
    const vectorCollision = () => !this.sub(new Box(arg, arg)).isEmpty;
    const type2action = {
      [Box.name]: () => !this.sub(arg).isEmpty,
      Vector: vectorCollision,
      Vector3: vectorCollision,
      Vector2: vectorCollision
    };
    if (arg.constructor.name in type2action) {
      return type2action[arg.constructor.name]();
    }
    return false;
  }
  toString() {
    return `{
        min:${this.min.toString()},
        max:${this.max.toString()}
    }`;
  }
  sample() {
    return this.min.add(Vec.RANDOM(this.dim).mul(this.diagonal));
  }
  serialize() {
  }
  deserialize() {
  }
  static EMPTY = new Box;
}

// src/Utils/Math.js
function smin(a2, b2, k2 = 32) {
  const res = Math.exp(-k2 * a2) + Math.exp(-k2 * b2);
  return -Math.log(res) / k2;
}
function mod(n, m2) {
  return (n % m2 + m2) % m2;
}
function clamp(min = 0, max = 1) {
  return (x2) => Math.max(min, Math.min(max, x2));
}
function lerp(a2, b2) {
  if (typeof a2 === "number" && typeof b2 === "number")
    return (t) => a2 + (b2 - a2) * t;
  return (t) => a2.scale(1 - t).add(b2.scale(t));
}
function randomPointInSphere(dim) {
  let randomInSphere;
  while (true) {
    const random = Vec.RANDOM(dim).map((x2) => 2 * x2 - 1);
    if (random.squareLength() >= 1)
      continue;
    randomInSphere = random.normalize();
    break;
  }
  return randomInSphere;
}

// src/Tela/Tela.js
var drawConvexPolygon = function(tela, positions, shader) {
  const { width, height } = tela;
  const canvasBox = tela.box;
  let boundingBox = Box.EMPTY;
  positions.forEach((x2) => {
    boundingBox = boundingBox.add(new Box(x2, x2));
  });
  const finalBox = canvasBox.intersection(boundingBox);
  if (finalBox.isEmpty)
    return tela;
  const [xMin, yMin] = finalBox.min.toArray();
  const [xMax, yMax] = finalBox.max.toArray();
  const isInsideFunc = isInsideConvex(positions);
  for (let x2 = xMin;x2 < xMax; x2++) {
    for (let y2 = yMin;y2 < yMax; y2++) {
      if (isInsideFunc(Vec2(x2, y2))) {
        const j2 = x2;
        const i2 = height - 1 - y2;
        const color = shader(x2, y2);
        if (!color)
          continue;
        const index = CHANNELS * (i2 * width + j2);
        tela.image[index] = color.red;
        tela.image[index + 1] = color.green;
        tela.image[index + 2] = color.blue;
        tela.image[index + 3] = color.alpha;
      }
    }
  }
  return tela;
};
var isInsideConvex = function(positions) {
  const m2 = positions.length;
  const v = [];
  const n = [];
  for (let i2 = 0;i2 < m2; i2++) {
    const p1 = positions[(i2 + 1) % m2];
    const p0 = positions[i2];
    v[i2] = p1.sub(p0);
    n[i2] = Vec2(-v[i2].y, v[i2].x);
  }
  const orientation = v[0].x * v[1].y - v[0].y * v[1].x >= 0 ? 1 : -1;
  return (x2) => {
    for (let i2 = 0;i2 < m2; i2++) {
      const r = x2.sub(positions[i2]);
      const myDot = r.dot(n[i2]) * orientation;
      if (myDot < 0)
        return false;
    }
    return true;
  };
};
var clipLine = function(p0, p1, box) {
  const pointStack = [p0, p1];
  const inStack = [];
  const outStack = [];
  for (let i2 = 0;i2 < pointStack.length; i2++) {
    const p2 = pointStack[i2];
    if (box.collidesWith(p2)) {
      inStack.push(p2);
    } else {
      outStack.push(p2);
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
};
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
  boundary.forEach(([s2, d2]) => {
    if (d2.x === 0) {
      const solution = solveLowTriMatrix(v, -d2.y, s2.sub(start));
      solution !== undefined && intersectionSolutions.push(solution);
    } else {
      const solution = solveUpTriMatrix(v, -d2.x, s2.sub(start));
      solution !== undefined && intersectionSolutions.push(solution);
    }
  });
  const validIntersections = [];
  intersectionSolutions.forEach((solution) => {
    const [x2, y2] = [solution.x, solution.y];
    if (0 <= x2 && x2 <= 1 && 0 <= y2 && y2 <= 1) {
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
var solveLowTriMatrix = function(v, a2, f2) {
  const v1 = v.x;
  const v2 = v.y;
  const av1 = a2 * v1;
  if (av1 === 0 || v1 === 0)
    return;
  const f1 = f2.x;
  const f22 = f2.y;
  return Vec2(f1 / v1, (f22 * v1 - v2 * f1) / av1);
};
var solveUpTriMatrix = function(v, a2, f2) {
  const v1 = v.x;
  const v2 = v.y;
  const av2 = a2 * v2;
  if (av2 === 0 || v2 === 0)
    return;
  const f1 = f2.x;
  const f22 = f2.y;
  return Vec2(f22 / v2, (f1 * v2 - v1 * f22) / av2);
};
var CHANNELS = 4;

class Tela {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.image = new Float32Array(CHANNELS * this.width * this.height);
    this.box = new Box(Vec2(0, 0), Vec2(this.width, this.height));
  }
  paint() {
    return this;
  }
  map(lambda) {
    const n = this.image.length;
    const w = this.width;
    const h2 = this.height;
    for (let k2 = 0;k2 < n; k2 += CHANNELS) {
      const i2 = Math.floor(k2 / (CHANNELS * w));
      const j2 = Math.floor(k2 / CHANNELS % w);
      const x2 = j2;
      const y2 = h2 - 1 - i2;
      const color = lambda(x2, y2);
      if (!color)
        continue;
      this.image[k2] = color.red;
      this.image[k2 + 1] = color.green;
      this.image[k2 + 2] = color.blue;
      this.image[k2 + 3] = color.alpha;
    }
    return this.paint();
  }
  fill(color) {
    if (!color)
      return;
    const n = this.image.length;
    for (let k2 = 0;k2 < n; k2 += CHANNELS) {
      this.image[k2] = color.red;
      this.image[k2 + 1] = color.green;
      this.image[k2 + 2] = color.blue;
      this.image[k2 + 3] = color.alpha;
    }
    return this;
  }
  getPxl(x2, y2) {
    const w = this.width;
    const h2 = this.height;
    let [i2, j2] = this.canvas2grid(x2, y2);
    i2 = mod(i2, h2);
    j2 = mod(j2, w);
    let index = CHANNELS * (w * i2 + j2);
    return Color.ofRGB(this.image[index], this.image[index + 1], this.image[index + 2], this.image[index + 3]);
  }
  setPxl(x2, y2, color) {
    const w = this.width;
    const [i2, j2] = this.canvas2grid(x2, y2);
    let index = CHANNELS * (w * i2 + j2);
    this.image[index] = color.red;
    this.image[index + 1] = color.green;
    this.image[index + 2] = color.blue;
    this.image[index + 3] = color.alpha;
    return this;
  }
  setPxlData(index, color) {
    this.image[index] = color.red;
    this.image[index + 1] = color.green;
    this.image[index + 2] = color.blue;
    this.image[index + 3] = color.alpha;
    return this;
  }
  drawLine(p1, p2, shader) {
    const w = this.width;
    const h2 = this.height;
    const line = clipLine(p1, p2, this.box);
    if (line.length <= 1)
      return;
    const [pi, pf] = line;
    const v = pf.sub(pi);
    const n = v.map(Math.abs).fold((e, x2) => e + x2);
    for (let k2 = 0;k2 < n; k2++) {
      const s2 = k2 / n;
      const lineP = pi.add(v.scale(s2)).map(Math.floor);
      const [x2, y2] = lineP.toArray();
      const j2 = x2;
      const i2 = h2 - 1 - y2;
      const index = CHANNELS * (i2 * w + j2);
      const color = shader(x2, y2);
      if (!color)
        continue;
      this.image[index] = color.red;
      this.image[index + 1] = color.green;
      this.image[index + 2] = color.blue;
      this.image[index + 3] = color.alpha;
    }
    return this;
  }
  drawTriangle(x1, x2, x3, shader) {
    return drawConvexPolygon(this, [x1, x2, x3], shader);
  }
  grid2canvas(i2, j2) {
    const h2 = this.height;
    const x2 = j2;
    const y2 = h2 - 1 - i2;
    return [x2, y2];
  }
  canvas2grid(x2, y2) {
    const h2 = this.height;
    const j2 = Math.floor(x2);
    const i2 = Math.floor(h2 - 1 - y2);
    return [i2, j2];
  }
  exposure(time = Number.MAX_VALUE) {
    let it = 1;
    const ans = {};
    for (let key of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
      const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this), key);
      if (descriptor && typeof descriptor.value === "function") {
        ans[key] = descriptor.value.bind(this);
      }
    }
    ans.width = this.width;
    ans.height = this.height;
    ans.map = (lambda) => {
      const n = this.image.length;
      const w = this.width;
      const h2 = this.height;
      for (let k2 = 0;k2 < n; k2 += 4) {
        const i2 = Math.floor(k2 / (4 * w));
        const j2 = Math.floor(k2 / 4 % w);
        const x2 = j2;
        const y2 = h2 - 1 - i2;
        const color = lambda(x2, y2);
        if (!color)
          continue;
        this.image[k2] = this.image[k2] + (color.red - this.image[k2]) / it;
        this.image[k2 + 1] = this.image[k2 + 1] + (color.green - this.image[k2 + 1]) / it;
        this.image[k2 + 2] = this.image[k2 + 2] + (color.blue - this.image[k2 + 2]) / it;
        this.image[k2 + 3] = this.image[k2 + 3] + (color.alpha - this.image[k2 + 3]) / it;
      }
      if (it < time)
        it++;
      return this.paint();
    };
    ans.setPxl = (x2, y2, color) => {
      const w = this.width;
      const [i2, j2] = this.canvas2grid(x2, y2);
      let index = 4 * (w * i2 + j2);
      this.image[index] = this.image[index] + (color.red - this.image[index]) / it;
      this.image[index + 1] = this.image[index + 1] + (color.green - this.image[index + 1]) / it;
      this.image[index + 2] = this.image[index + 2] + (color.blue - this.image[index + 2]) / it;
      this.image[index + 3] = this.image[index + 3] + (color.alpha - this.image[index + 3]) / it;
      return this;
    };
    ans.setPxlData = (index, color) => {
      this.image[index] = this.image[index] + (color.red - this.image[index]) / it;
      this.image[index + 1] = this.image[index + 1] + (color.green - this.image[index + 1]) / it;
      this.image[index + 2] = this.image[index + 2] + (color.blue - this.image[index + 2]) / it;
      this.image[index + 3] = this.image[index + 3] + (color.alpha - this.image[index + 3]) / it;
      return ans;
    };
    ans.paint = () => {
      if (it < time)
        it++;
      return this.paint();
    };
    return ans;
  }
  resize(width, height) {
    this.width = Math.floor(width);
    this.height = Math.floor(height);
    this.image = new Float32Array(CHANNELS * this.width * this.height);
    this.box = new Box(Vec2(0, 0), Vec2(this.width, this.height));
  }
}

// src/Tela/Canvas.js
var handleMouse = function(canvas, lambda) {
  return (event) => {
    const h2 = canvas.height;
    const w = canvas.width;
    const rect = canvas.canvas.getBoundingClientRect();
    const mx = (event.clientX - rect.left) / rect.width, my = (event.clientY - rect.top) / rect.height;
    const x2 = Math.floor(mx * w);
    const y2 = Math.floor(h2 - 1 - my * h2);
    return lambda(x2, y2, event);
  };
};

class Canvas extends Tela {
  constructor(canvas) {
    super(canvas.width, canvas.height);
    this.canvas = canvas;
    this.canvas.setAttribute("tabindex", "1");
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
    this.imageData = this.ctx.getImageData(0, 0, this.width, this.height);
  }
  get DOM() {
    return this.canvas;
  }
  paint() {
    const data = this.imageData.data;
    for (let i2 = 0;i2 < data.length; i2++) {
      data[i2] = this.image[i2] * MAX_8BIT;
    }
    this.ctx.putImageData(this.imageData, 0, 0);
    return this;
  }
  mapParallel = memoize((lambda, dependencies = []) => {
    const N2 = navigator.hardwareConcurrency;
    const w = this.width;
    const h2 = this.height;
    const fun = ({ _start_row, _end_row, _width_, _height_, _worker_id_, _vars_ }) => {
      const image = new Float32Array(CHANNELS * _width_ * (_end_row - _start_row));
      const startIndex = CHANNELS * _width_ * _start_row;
      const endIndex = CHANNELS * _width_ * _end_row;
      let index = 0;
      for (let k2 = startIndex;k2 < endIndex; k2 += CHANNELS) {
        const i2 = Math.floor(k2 / (CHANNELS * _width_));
        const j2 = Math.floor(k2 / CHANNELS % _width_);
        const x2 = j2;
        const y2 = _height_ - 1 - i2;
        const color = lambda(x2, y2, { ..._vars_ });
        if (!color)
          return;
        image[index] = color.red;
        image[index + 1] = color.green;
        image[index + 2] = color.blue;
        image[index + 3] = color.alpha;
        index += CHANNELS;
      }
      return { image, _start_row, _end_row, _worker_id_ };
    };
    const workers = [...Array(N2)].map(() => createWorker(fun, lambda, dependencies));
    return {
      run: (vars = {}) => {
        return new Promise((resolve) => {
          const allWorkersDone = [...Array(N2)].fill(false);
          workers.forEach((worker, k2) => {
            worker.onmessage = (event) => {
              const { image, _start_row, _end_row, _worker_id_ } = event.data;
              let index = 0;
              const startIndex = CHANNELS * w * _start_row;
              const endIndex = CHANNELS * w * _end_row;
              for (let i2 = startIndex;i2 < endIndex; i2++) {
                this.image[i2] = image[index];
                index++;
              }
              allWorkersDone[_worker_id_] = true;
              if (allWorkersDone.every((x2) => x2)) {
                return resolve(this.paint());
              }
            };
            const ratio = Math.floor(h2 / N2);
            worker.postMessage({
              _start_row: k2 * ratio,
              _end_row: Math.min(h2 - 1, (k2 + 1) * ratio),
              _width_: w,
              _height_: h2,
              _worker_id_: k2,
              _vars_: vars
            });
          });
        });
      }
    };
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
    });
    return this;
  }
  onKeyUp(lambda) {
    this.canvas.addEventListener("keyup", (e) => {
      lambda(e);
    });
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
    recorder.addEventListener("dataavailable", (e) => canvasSnapshots.push(e.data));
    recorder.start();
    recorder.onstop = () => responseBlob = new Blob(canvasSnapshots, { type: "video/webm" });
    return {
      stop: () => new Promise((re) => {
        recorder.stop();
        setTimeout(() => re([responseBlob, URL.createObjectURL(responseBlob)]));
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
    const canvas = new Canvas(canvasDOM);
    const data = canvas.imageData.data;
    for (let i2 = 0;i2 < data.length; i2 += CHANNELS) {
      canvas.setPxlData(i2, Color.ofRGBRaw(data[i2], data[i2 + 1], data[i2 + 2], data[i2 + 3]));
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
}
var createWorker = (main, lambda, dependencies) => {
  const workerFile = `
  const CHANNELS = ${CHANNELS};
  ${Color.toString()}
  ${dependencies.map((d2) => d2.toString()).join("\n")}
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

// src/Utils/DomBuilder.js
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

// src/Utils/Stream.js
var ID = (x2) => x2;
var TRUE = () => true;

class Stream {
  constructor(initialState, updateStateFunction, options = {}) {
    this._head = initialState;
    this._tail = updateStateFunction;
    this._pred = options?.predicate ?? TRUE;
    this._map = options?.map ?? ID;
  }
  get head() {
    return this._map(this._head);
  }
  get tail() {
    return (async () => {
      let state = this.head;
      while (!this._pred(this._tail(state))) {
        state = await this._tail(state);
      }
      return new Stream(await this._tail(state), this._tail, this._pred);
    })();
  }
  map(lambda) {
    return new Stream(this._head, this._tail, { predicate: this._pred, map: (x2) => lambda(this._map(x2)) });
  }
  filter(predicate = () => true) {
    return new Stream(this._head, this._tail, { predicate: (x2) => this._pred(x2) && predicate(x2), map: this._map });
  }
}

// src/Ray/Ray.js
function Ray(init, dir) {
  const ans = {};
  ans.init = init;
  ans.dir = dir;
  ans.trace = (t) => init.add(dir.scale(t));
  ans.dirInv = dir.map((x2) => 1 / x2);
  return ans;
}

// src/Material/Material.js
function Diffuse() {
  return {
    type: MATERIAL_NAMES.Diffuse,
    args: [],
    scatter(inRay, point, element) {
      let normal = element.normalToPoint(point);
      const randomInSphere = randomPointInSphere(3);
      if (randomInSphere.dot(normal) >= 0)
        return Ray(point, randomInSphere);
      return Ray(point, randomInSphere.scale(-1));
    }
  };
}
function Metallic(fuzz = 0) {
  return {
    type: MATERIAL_NAMES.Metallic,
    args: [fuzz],
    scatter(inRay, point, element) {
      fuzz = Math.min(1, Math.max(0, fuzz));
      let normal = element.normalToPoint(point);
      const v = inRay.dir;
      let reflected = v.sub(normal.scale(2 * v.dot(normal)));
      reflected = reflected.add(randomPointInSphere(3).scale(fuzz)).normalize();
      return Ray(point, reflected);
    }
  };
}
function Alpha(alpha = 1) {
  alpha = clamp()(alpha);
  return {
    type: MATERIAL_NAMES.Alpha,
    args: [alpha],
    scatter(inRay, point, element) {
      if (Math.random() <= alpha)
        return Diffuse().scatter(inRay, point, element);
      const v = point.sub(inRay.init);
      let t = undefined;
      if (inRay.dir.x !== 0)
        t = v.x / inRay.dir.x;
      if (inRay.dir.y !== 0)
        t = v.y / inRay.dir.y;
      if (inRay.dir.z !== 0)
        t = v.z / inRay.dir.z;
      return Ray(inRay.trace(t + 0.01), inRay.dir);
    }
  };
}
function DiElectric(indexOfRefraction = 1) {
  return {
    type: MATERIAL_NAMES.DiElectric,
    args: [indexOfRefraction],
    scatter(inRay, point, element) {
      const p2 = point.sub(inRay.init);
      let t = undefined;
      if (inRay.dir.x !== 0)
        t = p2.x / inRay.dir.x;
      if (inRay.dir.y !== 0)
        t = p2.y / inRay.dir.y;
      if (inRay.dir.z !== 0)
        t = p2.z / inRay.dir.z;
      const isInside = element.isInside(point);
      const refractionRatio = isInside ? indexOfRefraction : 1 / indexOfRefraction;
      const vIn = inRay.dir;
      const n = element.normalToPoint(point).scale(-1);
      const cosThetaIn = Math.min(1, vIn.dot(n));
      const sinThetaIn = Math.sqrt(1 - cosThetaIn * cosThetaIn);
      const sinThetaOut = refractionRatio * sinThetaIn;
      if (sinThetaOut > 1) {
        const vOut2 = vIn.sub(n.scale(-2 * cosThetaIn));
        return Ray(inRay.trace(t + 0.01), vOut2);
      }
      const cosThetaOut = Math.sqrt(1 - sinThetaOut * sinThetaOut);
      const vp = n.scale(cosThetaIn);
      const vo = vIn.sub(vp).normalize();
      const vOut = n.scale(cosThetaOut).add(vo.scale(sinThetaOut));
      return Ray(inRay.trace(t + 0.01), vOut);
    }
  };
}
var MATERIALS = {
  Diffuse,
  Metallic,
  Alpha,
  DiElectric
};
var MATERIAL_NAMES = Object.keys(MATERIALS).reduce((e, x2) => ({ [x2]: x2, ...e }), {});

// src/Geometry/Triangle.js
class Triangle {
  constructor({ name, positions, colors, texCoords, normals, texture, emissive, material }) {
    this.name = name;
    this.colors = colors;
    this.normals = normals;
    this.texture = texture;
    this.positions = positions;
    this.texCoords = texCoords;
    this.emissive = emissive;
    this.material = material;
    this.edges = [];
    const n = this.positions.length;
    for (let i2 = 0;i2 < n; i2++) {
      this.edges.push(this.positions[(i2 + 1) % n].sub(this.positions[i2]));
    }
    this.tangents = [this.edges[0], this.edges.at(-1).scale(-1)];
    const u2 = this.tangents[0];
    const v = this.tangents[1];
    this.faceNormal = u2.cross(v).normalize();
  }
  getBoundingBox() {
    if (this.boundingBox)
      return this.boundingBox;
    this.boundingBox = this.positions.reduce((box, x2) => box.add(new Box(x2, x2)), Box.EMPTY);
    return this.boundingBox;
  }
  distanceToPoint(p2) {
    return Number.MAX_VALUE;
  }
  normalToPoint(p2) {
    const r = p2.sub(this.positions[0]);
    const dot = this.faceNormal.dot(r);
    return dot < 0.001 ? this.faceNormal : this.faceNormal.scale(-1);
  }
  interceptWithRay(ray) {
    const epsilon = 0.000000001;
    const v = ray.dir;
    const p2 = ray.init.sub(this.positions[0]);
    const n = this.faceNormal;
    const t = -n.dot(p2) / n.dot(v);
    if (t <= epsilon)
      return;
    const x2 = ray.trace(t);
    for (let i2 = 0;i2 < this.positions.length; i2++) {
      const xi = this.positions[i2];
      const u2 = x2.sub(xi);
      const ni = n.cross(this.edges[i2]);
      const dot = ni.dot(u2);
      if (dot <= epsilon)
        return;
    }
    return [t - epsilon, x2, this];
  }
  sample() {
    return this.tangents[0].scale(Math.random()).add(this.tangents[1].scale(Math.random())).add(this.positions[0]);
  }
  isInside(p2) {
    return this.faceNormal.dot(p2.sub(this.positions[0])) >= 0;
  }
  serialize() {
    return {
      type: Triangle.name,
      name: this.name,
      emissive: this.emissive,
      colors: this.colors.map((x2) => x2.toArray()),
      positions: this.positions.map((x2) => x2.toArray()),
      material: { type: this.material.type, args: this.material.args }
    };
  }
  static deserialize(json) {
    const { type, args } = json.material;
    return Triangle.builder().name(json.name).positions(...json.positions.map((x2) => Vec.fromArray(x2))).colors(...json.colors.map((x2) => new Color(x2))).emissive(json.emissive).material(MATERIALS[type](...args)).build();
  }
  static builder() {
    return new TriangleBuilder;
  }
}
var indx = [1, 2, 3];

class TriangleBuilder {
  constructor() {
    this._name;
    this._texture;
    this._normals = indx.map(() => Vec3());
    this._colors = indx.map(() => Color.BLACK);
    this._positions = indx.map(() => Vec3());
    this._texCoords = [Vec2(), Vec2(1, 0), Vec2(0, 1)];
    this._emissive = false;
    this._material = Diffuse();
  }
  name(name) {
    this._name = name;
    return this;
  }
  positions(v1, v2, v3) {
    if ([v1, v2, v3].some((x2) => !x2))
      return this;
    this._positions = [v1, v2, v3];
    return this;
  }
  colors(c1, c2, c3) {
    if ([c1, c2, c3].some((x2) => !x2))
      return this;
    this._colors = [c1, c2, c3];
    return this;
  }
  texCoords(t1, t2, t3) {
    if ([t1, t2, t3].some((x2) => !x2))
      return this;
    this._texCoords = [t1, t2, t3];
    return this;
  }
  normals(n1, n2, n3) {
    if ([n1, n2, n3].some((x2) => !x2))
      return this;
    this._normals = [n1, n2, n3];
    return this;
  }
  texture(image) {
    this._texture = image;
    return this;
  }
  emissive(isEmissive) {
    this._emissive = isEmissive;
    return this;
  }
  material(material) {
    this._material = material;
    return this;
  }
  build() {
    const attrs = {
      name: this._name,
      colors: this._colors,
      normals: this._normals,
      positions: this._positions,
      texCoords: this._texCoords,
      emissive: this._emissive,
      material: this._material
    };
    if (Object.values(attrs).some((x2) => x2 === undefined)) {
      throw new Error("Triangle is incomplete");
    }
    return new Triangle({ ...attrs, texture: this._texture });
  }
}

// src/Camera/common.js
function getDefaultTexColor(texUV) {
  texUV = texUV.scale(16).map((x2) => x2 % 1);
  return texUV.x < 0.5 && texUV.y < 0.5 ? Color.BLACK : texUV.x > 0.5 && texUV.y > 0.5 ? Color.BLACK : Color.PURPLE;
}
function getBiLinearTexColor(texUV, texture) {
  const size = Vec2(texture.width, texture.height);
  const texInt = texUV.mul(size);
  const texInt0 = texInt.map(Math.floor);
  const texInt1 = texInt0.add(Vec2(1, 0));
  const texInt2 = texInt0.add(Vec2(0, 1));
  const texInt3 = texInt0.add(Vec2(1, 1));
  const color0 = texture.getPxl(...texInt0.toArray());
  const color1 = texture.getPxl(...texInt1.toArray());
  const color2 = texture.getPxl(...texInt2.toArray());
  const color3 = texture.getPxl(...texInt3.toArray());
  const x2 = texInt.sub(texInt0);
  const bottomX = lerp(color0, color1)(x2.x);
  const topX = lerp(color2, color3)(x2.x);
  return lerp(bottomX, topX)(x2.y);
}
function getTexColor(texUV, texture) {
  return texture.getPxl(texUV.x * texture.width, texUV.y * texture.height);
}

// src/Camera/raytrace.js
function rayTrace(scene, params = {}) {
  let { samplesPerPxl, bounces, variance, gamma, bilinearTexture } = params;
  bounces = bounces ?? 10;
  variance = variance ?? 0.001;
  samplesPerPxl = samplesPerPxl ?? 1;
  gamma = gamma ?? 0.5;
  bilinearTexture = bilinearTexture ?? false;
  const invSamples = bounces / samplesPerPxl;
  const lambda = (ray) => {
    let c2 = Color.BLACK;
    for (let i2 = 0;i2 < samplesPerPxl; i2++) {
      const epsilon = Vec.RANDOM(3).scale(variance);
      const epsilonOrtho = epsilon.sub(ray.dir.scale(epsilon.dot(ray.dir)));
      const r = Ray(ray.init, ray.dir.add(epsilonOrtho).normalize());
      c2 = c2.add(trace(r, scene, { bounces, bilinearTexture }));
    }
    return c2.scale(invSamples).toGamma(gamma);
  };
  return lambda;
}
function trace(ray, scene, options) {
  const { bounces, bilinearTexture } = options;
  if (bounces < 0)
    return Color.BLACK;
  const hit = scene.interceptWithRay(ray);
  if (!hit)
    return Color.BLACK;
  const [, p2, e] = hit;
  const color = getColorFromElement(e, ray, { bilinearTexture });
  const mat = e.material;
  let r = mat.scatter(ray, p2, e);
  let finalC = trace(r, scene, { bounces: bounces - 1, bilinearTexture });
  return e.emissive ? color.add(color.mul(finalC)) : color.mul(finalC);
}
var getColorFromElement = function(e, ray, params) {
  if (Triangle.name === e.constructor.name) {
    return getTriangleColor(e, ray, params);
  }
  return e.color ?? e.colors[0];
};
var getTriangleColor = function(triangle, ray, params) {
  const { tangents, positions, texCoords, texture, colors } = triangle;
  const haveTextures = texture && texCoords && texCoords.length > 0 && !texCoords.some((x2) => x2 === undefined);
  const v = ray.init.sub(positions[0]);
  const u1 = tangents[0];
  const u2 = tangents[1];
  const r = ray.dir;
  const detInv = 1 / u1.cross(u2).dot(r);
  const alpha = v.cross(u2).dot(r) * detInv;
  const beta = u1.cross(v).dot(r) * detInv;
  if (haveTextures) {
    const texUV = texCoords[0].scale(1 - alpha - beta).add(texCoords[1].scale(alpha)).add(texCoords[2].scale(beta));
    const texColor = texture ? params.bilinearTexture ? getBiLinearTexColor(texUV, texture) : getTexColor(texUV, texture) : getDefaultTexColor(texUV);
    return texColor;
  }
  return colors[0].scale(alpha).add(colors[1].scale(beta)).add(colors[2].scale(1 - alpha - beta));
};

// src/Geometry/Line.js
class Line {
  constructor({ name, positions, colors, texCoords, normals, texture, radius, emissive, material }) {
    this.name = name;
    this.radius = radius;
    this.colors = colors;
    this.normals = normals;
    this.texture = texture;
    this.emissive = emissive;
    this.material = material;
    this.positions = positions;
    this.texCoords = texCoords;
    this.edge = this.positions[1].sub(this.positions[0]);
  }
  getBoundingBox() {
    if (this.boundingBox)
      return this.boundingBox;
    const size = Vec3(this.radius, this.radius, this.radius);
    this.boundingBox = this.positions.reduce((box, x2) => box.add(new Box(x2.sub(size), x2.add(size))), Box.EMPTY);
    return this.boundingBox;
  }
  distanceToPoint(p2) {
    const l2 = this.edge;
    const v = p2.sub(this.positions[0]);
    const h2 = clamp()(l2.dot(v) / l2.dot(l2));
    return p2.sub(this.positions[0].add(l2.scale(h2))).length() - this.radius;
  }
  normalToPoint(p2) {
    const epsilon = 0.001;
    const f2 = this.distanceToPoint(p2);
    const sign = Math.sign(f2);
    const grad = Vec3(this.distanceToPoint(p2.add(Vec3(epsilon, 0, 0))) - f2, this.distanceToPoint(p2.add(Vec3(0, epsilon, 0))) - f2, this.distanceToPoint(p2.add(Vec3(0, 0, epsilon))) - f2).normalize();
    return grad.scale(sign);
  }
  interceptWithRay(ray) {
    const maxIte = 100;
    const epsilon = 0.001;
    let p2 = ray.init;
    let t = this.distanceToPoint(p2);
    let minT = t;
    for (let i2 = 0;i2 < maxIte; i2++) {
      p2 = ray.trace(t);
      const d2 = this.distanceToPoint(p2);
      t += d2;
      if (d2 < epsilon) {
        return [t, p2, this];
      }
      if (d2 > minT) {
        break;
      }
      minT = d2;
    }
    return;
  }
  sample() {
    return this.edge.scale(Math.random());
  }
  isInside(p2) {
    return this.distanceToPoint(p2) < 0;
  }
  serialize() {
  }
  static deserialize(json) {
    const { type, args } = json.material;
    return Line.builder().name(json.name).radius(json.radius).positions(...json.positions.map((x2) => Vec.fromArray(x2))).colors(...json.colors.map((x2) => new Color(x2))).emissive(json.emissive).material(MATERIALS[type](...args)).build();
  }
  static builder() {
    return new LineBuilder;
  }
}
var indx2 = [1, 2];

class LineBuilder {
  constructor() {
    this._name;
    this._texture;
    this._radius = 1;
    this._normals = indx2.map(() => Vec3());
    this._colors = indx2.map(() => Color.BLACK);
    this._positions = indx2.map(() => Vec3());
    this._texCoords = indx2.map(() => Vec2());
    this._emissive = false;
    this._material = Diffuse();
  }
  name(name) {
    this._name = name;
    return this;
  }
  positions(v1, v2) {
    if ([v1, v2].some((x2) => !x2))
      return this;
    this._positions = [v1, v2];
    return this;
  }
  colors(c1, c2) {
    if ([c1, c2].some((x2) => !x2))
      return this;
    this._colors = [c1, c2];
    return this;
  }
  texCoords(t1, t2) {
    if ([t1, t2].some((x2) => !x2))
      return this;
    this._texCoords = [t1, t2];
    return this;
  }
  normals(n1, n2) {
    if ([n1, n2].some((x2) => !x2))
      return this;
    this._normals = [n1, n2];
    return this;
  }
  texture(image) {
    this._texture = image;
    return this;
  }
  radius(radius) {
    this._radius = radius;
    return this;
  }
  emissive(isEmissive) {
    this._emissive = isEmissive;
    return this;
  }
  material(material) {
    this._material = material;
    return this;
  }
  build() {
    const attrs = {
      name: this._name,
      radius: this._radius,
      colors: this._colors,
      normals: this._normals,
      positions: this._positions,
      texCoords: this._texCoords,
      emissive: this._emissive,
      material: this._material
    };
    if (Object.values(attrs).some((x2) => x2 === undefined)) {
      throw new Error("Line is incomplete");
    }
    return new Line({ ...attrs, texture: this._texture });
  }
}

// src/Geometry/Sphere.js
var sphereInterception = function(point, ray) {
  const { init, dir } = ray;
  const diff = init.sub(point.position);
  const b2 = 2 * dir.dot(diff);
  const c2 = diff.squareLength() - point.radius * point.radius;
  const discriminant = b2 * b2 - 4 * c2;
  if (discriminant < 0)
    return;
  const sqrt = Math.sqrt(discriminant);
  const [t1, t2] = [(-b2 - sqrt) / 2, (-b2 + sqrt) / 2];
  const t = Math.min(t1, t2);
  const tM = Math.max(t1, t2);
  if (t1 * t2 < 0)
    return tM;
  return t1 >= 0 && t2 >= 0 ? t : undefined;
};

class Sphere {
  constructor({ name, position, color, texCoord, normal, radius, texture, emissive, material }) {
    this.name = name;
    this.color = color;
    this.radius = radius;
    this.normals = normal;
    this.texture = texture;
    this.position = position;
    this.texCoord = texCoord;
    this.emissive = emissive;
    this.material = material;
  }
  getBoundingBox() {
    if (this.boundingBox)
      return this.boundingBox;
    const n = this.position.dim;
    this.boundingBox = new Box(this.position.add(Vec.ONES(n).scale(-this.radius)), this.position.add(Vec.ONES(n).scale(this.radius)));
    return this.boundingBox;
  }
  distanceToPoint(p2) {
    return this.position.sub(p2).length() - this.radius;
  }
  normalToPoint(p2) {
    const r = p2.sub(this.position);
    const length = r.length();
    return length > this.radius ? r.normalize() : r.scale(-1).normalize();
  }
  interceptWithRay(ray) {
    const epsilon = 0.000000001;
    const t = sphereInterception(this, ray);
    return !t ? undefined : [t, ray.trace(t - epsilon), this];
  }
  sample() {
    return randomPointInSphere(this.position.dim).scale(this.radius).add(this.position);
  }
  isInside(p2) {
    return p2.sub(this.position).length() < this.radius;
  }
  serialize() {
    return {
      type: Sphere.name,
      name: this.name,
      radius: this.radius,
      emissive: this.emissive,
      color: this.color.toArray(),
      position: this.position.toArray(),
      material: { type: this.material.type, args: this.material.args }
    };
  }
  static deserialize(json) {
    const { type, args } = json.material;
    return Sphere.builder().name(json.name).radius(json.radius).position(Vec.fromArray(json.position)).color(new Color(json.color)).emissive(json.emissive).material(MATERIALS[type](...args)).build();
  }
  static builder() {
    return new SphereBuilder;
  }
}

class SphereBuilder {
  constructor() {
    this._name;
    this._texture;
    this._radius = 1;
    this._normal = Vec3();
    this._color = Color.BLACK;
    this._position = Vec3();
    this._texCoord = Vec2();
    this._emissive = false;
    this._material = Diffuse();
  }
  name(name) {
    this._name = name;
    return this;
  }
  color(color) {
    if (!color)
      return this;
    this._color = color;
    return this;
  }
  normal(normal) {
    if (!normal)
      return this;
    this._normal = normal;
    return this;
  }
  radius(radius) {
    if (!radius)
      return this;
    this._radius = radius;
    return this;
  }
  position(posVec3) {
    if (!posVec3)
      return this;
    this._position = posVec3;
    return this;
  }
  texCoord(t) {
    if (!t)
      return this;
    this._texCoord = t;
    return this;
  }
  texture(image) {
    this._texture = image;
    return this;
  }
  emissive(isEmissive) {
    this._emissive = isEmissive;
    return this;
  }
  material(material) {
    this._material = material;
    return this;
  }
  build() {
    const attrs = {
      name: this._name,
      color: this._color,
      normal: this._normal,
      radius: this._radius,
      position: this._position,
      texCoord: this._texCoord,
      emissive: this._emissive,
      material: this._material
    };
    if (Object.values(attrs).some((x2) => x2 === undefined)) {
      throw new Error("Sphere is incomplete");
    }
    return new Sphere({ ...attrs, texture: this._texture });
  }
}
var Sphere_default = Sphere;

// src/Utils/PQueue.js
var heapifyBuilder = function(data, comparator) {
  return (rootIndex) => {
    const leftIndex = 2 * rootIndex + 1;
    const rightIndex = 2 * rootIndex + 2;
    let minIndex = rootIndex;
    if (leftIndex < data.length && comparator(data[leftIndex], data[rootIndex]) < 0) {
      minIndex = leftIndex;
    }
    if (rightIndex < data.length && comparator(data[rightIndex], data[minIndex]) < 0) {
      minIndex = rightIndex;
    }
    if (minIndex !== rootIndex) {
      const temp = data[rootIndex];
      data[rootIndex] = data[minIndex];
      data[minIndex] = temp;
      return heapifyBuilder(data, comparator)(minIndex);
    }
    return data;
  };
};

class PQueue {
  constructor(comparator = (a2, b2) => a2 - b2) {
    this.data = [];
    this.comparator = comparator;
  }
  get length() {
    return this.data.length;
  }
  peek() {
    return this.data[0];
  }
  push(element) {
    this.data.push(element);
    if (this.data.length <= 1)
      return this;
    let i2 = this.data.length - 1;
    while (i2 > 0) {
      const parentIndex = i2 % 2 !== 0 ? Math.floor(i2 / 2) : i2 / 2 - 1;
      if (this.comparator(this.data[parentIndex], this.data[i2]) <= 0)
        break;
      const temp = this.data[parentIndex];
      this.data[parentIndex] = this.data[i2];
      this.data[i2] = temp;
      i2 = parentIndex;
    }
    return this;
  }
  pop() {
    if (!this.data.length)
      return;
    const v = this.data[0];
    if (this.data.length <= 1) {
      return this.data.pop();
    }
    this.data[0] = this.data[this.data.length - 1];
    this.data = this.data.slice(0, -1);
    this.data = heapifyBuilder(this.data, this.comparator)(0);
    return v;
  }
  static ofArray(array, comparator) {
    const queue = new PQueue(comparator);
    for (let i2 = 0;i2 < array.length; i2++) {
      queue.push(array[i2]);
    }
    return queue;
  }
}

// src/Scene/NaiveScene.js
class NaiveScene {
  constructor() {
    this.id2ElemMap = {};
    this.sceneElements = [];
  }
  add(...elements) {
    return this.addList(elements);
  }
  addList(elements) {
    for (let i2 = 0;i2 < elements.length; i2++) {
      const elem = elements[i2];
      const { name } = elem;
      this.id2ElemMap[name] = elem;
      this.sceneElements.push(elem);
    }
    return this;
  }
  getElements() {
    return this.sceneElements;
  }
  clear() {
    this.id2ElemMap = {};
    this.sceneElements = [];
  }
  distanceToPoint(p2) {
    const elements = this.sceneElements;
    let distance = Number.MAX_VALUE;
    for (let i2 = 0;i2 < elements.length; i2++) {
      distance = Math.min(distance, elements[i2].distanceToPoint(p2));
    }
    return distance;
  }
  normalToPoint(p2) {
    const epsilon = 0.001;
    const n = p2.dim;
    const grad = [];
    const d2 = this.distanceToPoint(p2);
    for (let i2 = 0;i2 < n; i2++) {
      grad.push(this.distanceToPoint(p2.add(Vec.e(n)(i2).scale(epsilon))) - d2);
    }
    return Vec.fromArray(grad).scale(Math.sign(d2)).normalize();
  }
  interceptWithRay(ray) {
    const elements = this.sceneElements;
    let closestDistance = Number.MAX_VALUE;
    let closest;
    for (let i2 = 0;i2 < elements.length; i2++) {
      const hit = elements[i2].interceptWithRay(ray);
      if (hit && hit[0] < closestDistance) {
        closest = hit;
        closestDistance = hit[0];
      }
    }
    return closest;
  }
  distanceOnRay(ray) {
    return this.distanceToPoint(ray.init);
  }
  getElementNear(p2) {
    return this.sceneElements[argmin(this.sceneElements, (x2) => x2.distanceToPoint(p2))];
  }
  getElementInBox(box) {
    throw Error("Not Implemented");
  }
  rebuild() {
    return this;
  }
  debug(params) {
    return params.canvas;
  }
}

// src/Utils/Utils3D.js
function drawBox({ box, color, debugScene }) {
  if (box.isEmpty)
    return debugScene;
  const vertices = UNIT_BOX_VERTEX.map((v) => v.mul(box.diagonal).add(box.min));
  const lines = UNIT_BOX_LINES.map(([i2, j2]) => Line.builder().name(`debug_box_${i2}_${j2}`).positions(vertices[i2], vertices[j2]).colors(color, color).build());
  debugScene.addList(lines);
  return debugScene;
}
var UNIT_BOX_VERTEX = [
  Vec3(),
  Vec3(1, 0, 0),
  Vec3(1, 1, 0),
  Vec3(0, 1, 0),
  Vec3(0, 0, 1),
  Vec3(1, 0, 1),
  Vec3(1, 1, 1),
  Vec3(0, 1, 1)
];
var UNIT_BOX_LINES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 4],
  [0, 4],
  [1, 5],
  [3, 7],
  [2, 6]
];

// src/Scene/KScene.js
var clusterLeafs = function(box, leafs, it = 10) {
  const clusters = [box.sample(), box.sample()];
  const clusterIndexes = [];
  for (let i2 = 0;i2 < it; i2++) {
    for (let i3 = 0;i3 < clusters.length; i3++) {
      clusterIndexes[i3] = [];
    }
    for (let j2 = 0;j2 < leafs.length; j2++) {
      const leafPosition = leafs[j2].box.center;
      const kIndex = argmin(clusters, (c2) => c2.sub(leafPosition).squareLength());
      clusterIndexes[kIndex].push(j2);
    }
    for (let j2 = 0;j2 < clusters.length; j2++) {
      if (clusterIndexes[j2].length === 0) {
        const dataPoints = clusterIndexes[(j2 + 1) % clusters.length];
        clusterIndexes[j2].push(dataPoints[Math.floor(Math.random() * dataPoints.length)]);
      }
    }
    for (let j2 = 0;j2 < clusters.length; j2++) {
      let acc = Vec.ZERO(box.dim);
      for (let k2 = 0;k2 < clusterIndexes[j2].length; k2++) {
        const leafPosition = leafs[clusterIndexes[j2][k2]].box.center;
        acc = acc.add(leafPosition);
      }
      clusters[j2] = acc.scale(1 / clusterIndexes[j2].length);
    }
  }
  return clusterIndexes.map((indxs) => indxs.map((indx3) => leafs[indx3]));
};
var leafsInterceptWithRay = function(leafs, ray) {
  let closestDistance = Number.MAX_VALUE;
  let closest;
  for (let i2 = 0;i2 < leafs.length; i2++) {
    const hit = leafs[i2].interceptWithRay(ray);
    if (hit && hit[0] < closestDistance) {
      closest = hit;
      closestDistance = hit[0];
    }
  }
  return closest;
};
var distanceFromLeafs = function(leafs, p2, combineLeafs) {
  const elements = leafs.map((x2) => x2.element);
  let distance = Number.MAX_VALUE;
  for (let i2 = 0;i2 < elements.length; i2++) {
    distance = combineLeafs(distance, elements[i2].distanceToPoint(p2));
  }
  return distance;
};

class KScene {
  constructor(k2 = 10) {
    this.k = k2;
    this.id2ElemMap = {};
    this.sceneElements = [];
    this.boundingBoxScene = new Node(k2);
  }
  add(...elements) {
    return this.addList(elements);
  }
  addList(elements) {
    for (let i2 = 0;i2 < elements.length; i2++) {
      const elem = elements[i2];
      const { name } = elem;
      this.id2ElemMap[name] = elem;
      this.sceneElements.push(elem);
      this.boundingBoxScene.add(elem);
    }
    return this;
  }
  getElements() {
    return this.sceneElements;
  }
  clear() {
    this.id2ElemMap = {};
    this.sceneElements = [];
    this.boundingBoxScene = new Node(this.k);
  }
  distanceToPoint(p2) {
    if (this.boundingBoxScene.leafs.length > 0) {
      let distance = Number.MAX_VALUE;
      const leafs = this.boundingBoxScene.leafs;
      for (let i2 = 0;i2 < leafs.length; i2++) {
        distance = Math.min(distance, leafs[i2].element.distanceToPoint(p2));
      }
      return distance;
    }
    return this.getElementNear(p2).distanceToPoint(p2);
  }
  normalToPoint(p2) {
    let normal = Vec3();
    let weight = 0;
    const ones = Vec3(1, 1, 1).scale(1 / (2 * this.k));
    const box = new Box(p2.sub(ones), p2.add(ones));
    const elements = this.getElementInBox(box);
    const size = elements.length;
    for (let i2 = 0;i2 < size; i2++) {
      const n = elements[i2].normalToPoint(p2);
      const d2 = 1 / elements[i2].distanceToPoint(p2);
      normal = normal.add(n.scale(d2));
      weight += d2;
    }
    return normal.length() > 0 ? normal.scale(1 / weight).normalize() : normal;
  }
  interceptWithRay(ray) {
    return this.boundingBoxScene.interceptWithRay(ray);
  }
  distanceOnRay(ray, combineLeafs = Math.min) {
    return this.boundingBoxScene.distanceOnRay(ray, combineLeafs);
  }
  getElementNear(p2) {
    if (this.boundingBoxScene.leafs.length > 0) {
      return this.boundingBoxScene.getElementNear(p2);
    }
    const initial = [this.boundingBoxScene.left, this.boundingBoxScene.right].map((x2) => ({ node: x2, distance: x2.box.distanceToPoint(p2) }));
    let stack = PQueue.ofArray(initial, (a2, b2) => a2.distance - b2.distance);
    while (stack.length) {
      const { leaf, node } = stack.pop();
      if (leaf)
        return leaf.getElemNear(p2);
      if (node.leafs.length > 0) {
        for (let i2 = 0;i2 < node.leafs.length; i2++) {
          const leaf2 = node.leafs[i2];
          stack.push({ leaf: leaf2, distance: leaf2.box.distanceToPoint(p2) });
        }
      }
      const children = [node.left, node.right].filter((x2) => x2).map((x2) => ({ node: x2, distance: x2.box.distanceToPoint(p2) }));
      children.forEach((c2) => stack.push(c2));
    }
  }
  getElementInBox(box) {
    return this.boundingBoxScene.getElemInBox(box);
  }
  rebuild() {
    if (!this.sceneElements.length)
      return this;
    let groupsQueue = PQueue.ofArray(clusterLeafs(this.boundingBoxScene.box, this.sceneElements.map((x2) => new Leaf(x2))), (a2, b2) => b2.length - a2.length);
    while (groupsQueue.data.map((x2) => x2.length > this.k).some((x2) => x2)) {
      if (groupsQueue.peek().length > this.k) {
        const groupOfLeafs = groupsQueue.pop();
        const box = groupOfLeafs.reduce((e, x2) => e.add(x2.box), new Box);
        const [left, right] = clusterLeafs(box, groupOfLeafs);
        groupsQueue.push(left);
        groupsQueue.push(right);
      }
    }
    let nodeOrLeafStack = groupsQueue.data.map((group) => group.reduce((e, x2) => e.add(x2.element), new Node(this.k)));
    while (nodeOrLeafStack.length > 1) {
      const nodeOrLeaf = nodeOrLeafStack[0];
      nodeOrLeafStack = nodeOrLeafStack.slice(1);
      const minIndex = argmin(nodeOrLeafStack, (x2) => nodeOrLeaf.box.distanceToBox(x2.box));
      const newNode = nodeOrLeaf.join(nodeOrLeafStack[minIndex]);
      nodeOrLeafStack.splice(minIndex, 1);
      nodeOrLeafStack.push(newNode);
    }
    this.boundingBoxScene = nodeOrLeafStack.pop();
    return this;
  }
  debug(props) {
    const { camera, canvas } = props;
    let { node, level, level2colors, debugScene } = props;
    node = node || this.boundingBoxScene;
    level = level || 0;
    level2colors = level2colors || [];
    debugScene = debugScene || new NaiveScene;
    if (level === 0) {
      let maxLevels = Math.round(Math.log2(node.numberOfLeafs / this.k)) + 1;
      maxLevels = maxLevels === 0 ? 1 : maxLevels;
      for (let i2 = 0;i2 <= maxLevels; i2++)
        level2colors.push(Color.RED.scale(1 - i2 / maxLevels).add(Color.BLUE.scale(i2 / maxLevels)));
    }
    debugScene = drawBox({ box: node.box, color: level2colors[level], debugScene });
    if (!node.isLeaf && node.left) {
      this.debug({ canvas, camera, node: node.left, level: level + 1, level2colors, debugScene });
    }
    if (!node.isLeaf && node.right) {
      this.debug({ canvas, camera, node: node.right, level: level + 1, level2colors, debugScene });
    }
    if (level === 0)
      return camera.reverseShot(debugScene, { clearScreen: false }).to(canvas);
    return canvas;
  }
}

class Node {
  isLeaf = false;
  numberOfLeafs = 0;
  constructor(k2) {
    this.k = k2;
    this.box = Box.EMPTY;
    this.leafs = [];
    this.parent = undefined;
  }
  add(element) {
    this.numberOfLeafs += 1;
    const elemBox = element.getBoundingBox();
    this.box = this.box.add(elemBox);
    if (!this.left && !this.right) {
      this.leafs.push(new Leaf(element));
      if (this.leafs.length <= this.k)
        return this;
      const [lefts, rights] = clusterLeafs(this.box, this.leafs);
      this.left = new Node(this.k).addList(lefts.map((x2) => x2.element));
      this.right = new Node(this.k).addList(rights.map((x2) => x2.element));
      this.left.parent = this;
      this.right.parent = this;
      this.leafs = [];
    } else {
      const children = [this.left, this.right];
      const index = argmin(children, (x2) => element.getBoundingBox().distanceToBox(x2.box));
      children[index].add(element);
    }
    return this;
  }
  addList(elements) {
    for (let i2 = 0;i2 < elements.length; i2++) {
      this.add(elements[i2]);
    }
    return this;
  }
  interceptWithRay(ray) {
    if (this.leafs.length > 0) {
      return leafsInterceptWithRay(this.leafs, ray);
    }
    const leftT = this.left?.box?.interceptWithRay(ray)?.[0] ?? Number.MAX_VALUE;
    const rightT = this.right?.box?.interceptWithRay(ray)?.[0] ?? Number.MAX_VALUE;
    if (leftT === Number.MAX_VALUE && rightT === Number.MAX_VALUE)
      return;
    const first = leftT <= rightT ? this.left : this.right;
    const second = leftT > rightT ? this.left : this.right;
    const secondT = Math.max(leftT, rightT);
    const firstHit = first.interceptWithRay(ray);
    if (firstHit && firstHit[0] < secondT)
      return firstHit;
    const secondHit = second.interceptWithRay(ray);
    return secondHit && secondHit[0] < (firstHit?.[0] ?? Number.MAX_VALUE) ? secondHit : firstHit;
  }
  distanceToPoint(p2) {
    return this.getElementNear(p2).distanceToPoint(p2);
  }
  distanceOnRay(ray, combineLeafs) {
    if (this.leafs.length > 0) {
      return distanceFromLeafs(this.leafs, ray.init, combineLeafs);
    }
    const leftT = this.left?.box?.interceptWithRay(ray)?.[0] ?? Number.MAX_VALUE;
    const rightT = this.right?.box?.interceptWithRay(ray)?.[0] ?? Number.MAX_VALUE;
    if (leftT === Number.MAX_VALUE && rightT === Number.MAX_VALUE)
      return Number.MAX_VALUE;
    const first = leftT <= rightT ? this.left : this.right;
    const second = leftT > rightT ? this.left : this.right;
    const firstT = Math.min(leftT, rightT);
    const secondT = Math.max(leftT, rightT);
    const firstHit = first.distanceOnRay(ray, combineLeafs);
    if (firstHit < secondT)
      return firstHit;
    const secondHit = second.distanceOnRay(ray, combineLeafs);
    return secondHit <= firstHit ? secondHit : firstHit;
  }
  getElementNear(p2) {
    if (this.leafs.length > 0) {
      const minIndex = argmin(this.leafs, (x2) => x2.distanceToPoint(p2));
      return this.leafs[minIndex].element;
    }
    const children = [this.left, this.right];
    const index = argmin(children, (n) => n.box.center.sub(p2).length());
    return children[index].getElementNear(p2);
  }
  getNodeNear(p2) {
    if (this.leafs.length > 0) {
      return this;
    }
    const children = [this.left, this.right];
    const index = argmin(children, (n) => n.box.center.sub(p2).length());
    return children[index].getNodeNear(p2);
  }
  getLeafsNear(p2) {
    if (this.leafs.length > 0) {
      return this.leafs;
    }
    const children = [this.left, this.right];
    const index = argmin(children, (n) => n.box.center.sub(p2).length());
    return children[index].getLeafsNear(p2);
  }
  getElemInBox(box) {
    let elements = [];
    if (this.leafs.length > 0) {
      this.leafs.forEach((leaf) => !leaf.box.sub(box).isEmpty && elements.push(leaf.element));
      return elements;
    }
    const children = [this.left, this.right];
    for (let i2 = 0;i2 < children.length; i2++) {
      if (!children[i2].box.sub(box).isEmpty) {
        elements = elements.concat(children[i2].getElemInBox(box));
      }
    }
    return elements;
  }
  getRandomLeaf() {
    const index = Math.floor(Math.random() * this.children.length);
    return this.children[index].isLeaf ? this.children[index] : this.children[index].getRandomLeaf();
  }
  join(nodeOrLeaf) {
    if (nodeOrLeaf.isLeaf)
      return this.add(nodeOrLeaf.element);
    const newNode = new Node(this.k);
    newNode.left = this;
    newNode.left.parent = newNode;
    newNode.right = nodeOrLeaf;
    newNode.right.parent = newNode;
    newNode.box = this.box.add(nodeOrLeaf.box);
    newNode.numberOfLeafs = newNode.left.numberOfLeafs + newNode.right.numberOfLeafs;
    return newNode;
  }
}

class Leaf {
  isLeaf = true;
  constructor(element) {
    this.element = element;
    this.box = element.getBoundingBox();
  }
  distanceToPoint(x2) {
    return this.element.distanceToPoint(x2);
  }
  getLeafs() {
    return [this];
  }
  getRandomLeaf() {
    return this;
  }
  getElemIn(box) {
    if (!box.sub(this.box).isEmpty)
      return [this.element];
    return [];
  }
  getElemNear() {
    return this.element;
  }
  interceptWithRay(ray) {
    return this.element.interceptWithRay(ray);
  }
}

// src/Geometry/Mesh.js
var triangulate = function(polygon) {
  if (polygon.length === 3) {
    return [polygon];
  }
  if (polygon.length === 4) {
    return [
      [polygon[0], polygon[1], polygon[2]],
      [polygon[2], polygon[3], polygon[0]]
    ];
  }
};
var parseFace = function(vertexInfo) {
  const facesInfo = vertexInfo.flatMap((x2) => x2.split("/")).map((x2) => Number.parseFloat(x2));
  const length = facesInfo.length;
  const lengthDiv3 = Math.floor(length / 3);
  const group = groupBy(facesInfo, (_2, i2) => i2 % lengthDiv3);
  const face = { vertices: [], textures: [], normals: [] };
  Object.keys(group).map((k2) => {
    k2 = Number.parseInt(k2);
    const indices = group[k2].map((x2) => x2 - 1);
    if (k2 === 0)
      face.vertices = indices;
    if (k2 === 1)
      face.textures = indices;
    if (k2 === 2)
      face.normals = indices;
  });
  return face;
};
var MESH_COUNTER = 0;
var RADIUS = 0.001;

class Mesh {
  constructor({ name, vertices, normals, textureCoords, faces, colors, texture, materials }) {
    this.vertices = vertices || [];
    this.normals = normals || [];
    this.textureCoords = textureCoords || [];
    this.faces = faces || [];
    this.colors = colors || [];
    this.texture = texture;
    this.name = name || `Mesh_${MESH_COUNTER++}`;
    this.materials = materials;
  }
  _init() {
    if (this._meshScene)
      return this;
    this._meshScene = new KScene;
    this._meshScene.addList(this.asTriangles());
    this._meshScene.rebuild();
    return this;
  }
  get meshScene() {
    this._init();
    return this._meshScene;
  }
  getBoundingBox() {
    if (this.boundingBox)
      return this.boundingBox;
    this.boundingBox = this.meshScene.boundingBoxScene.box;
    return this.boundingBox;
  }
  distanceToPoint(x2) {
    return this.meshScene.distanceToPoint(x2);
  }
  normalToPoint(x2) {
    throw Error("No implementation");
  }
  interceptWithRay(ray) {
    return this.meshScene.interceptWithRay(ray);
  }
  distanceOnRay(ray) {
    return this.meshScene.distanceOnRay(ray);
  }
  setName(name) {
    this.name = name;
    return this;
  }
  addTexture(image) {
    this.texture = image;
    this.meshScene.getElements().forEach((e) => e.texture = this.texture);
    return this;
  }
  mapVertices(lambda) {
    const newVertices = [];
    for (let i2 = 0;i2 < this.vertices.length; i2++) {
      newVertices.push(lambda(this.vertices[i2]));
    }
    return new Mesh({
      name: this.name,
      vertices: newVertices,
      normals: this.normals,
      textureCoords: this.textureCoords,
      faces: this.faces,
      texture: this.texture,
      colors: this.colors
    });
  }
  mapColors(lambda) {
    const newColors = [];
    for (let i2 = 0;i2 < this.vertices.length; i2++) {
      newColors.push(lambda(this.vertices[i2]));
    }
    return new Mesh({
      name: this.name,
      vertices: this.vertices,
      normals: this.normals,
      textureCoords: this.textureCoords,
      faces: this.faces,
      colors: newColors,
      texture: this.texture
    });
  }
  mapMaterials(lambda) {
    const newMaterials = [];
    for (let i2 = 0;i2 < this.faces.length; i2++) {
      newMaterials.push(lambda(this.faces[i2]));
    }
    return new Mesh({
      name: this.name,
      vertices: this.vertices,
      normals: this.normals,
      textureCoords: this.textureCoords,
      faces: this.faces,
      colors: this.colors,
      texture: this.texture,
      materials: newMaterials
    });
  }
  asPoints(radius = RADIUS) {
    const points = {};
    for (let i2 = 0;i2 < this.faces.length; i2++) {
      const texCoordIndexes = this.faces[i2].textures;
      const normalIndexes = this.faces[i2].normals;
      const verticesIndexes = this.faces[i2].vertices;
      for (let j2 = 0;j2 < 3; j2++) {
        const pointName = `${this.name}_${verticesIndexes[j2]}`;
        if (!(pointName in points)) {
          points[pointName] = Sphere_default.builder().name(pointName).radius(radius).texture(this.texture).color(this.colors[verticesIndexes[j2]]).normal(this.normals[normalIndexes[j2]]).position(this.vertices[verticesIndexes[j2]]).texCoord(this.textureCoords[texCoordIndexes[j2]]).build();
        }
      }
    }
    return Object.values(points);
  }
  asLines(radius = RADIUS) {
    const lines = {};
    for (let i2 = 0;i2 < this.faces.length; i2++) {
      const indices = this.faces[i2].vertices;
      for (let j2 = 0;j2 < indices.length; j2++) {
        const vi = indices[j2];
        const vj = indices[(j2 + 1) % indices.length];
        const edge_id = [vi, vj].sort().join("_");
        const edge_name = `${this.name}_${edge_id}`;
        lines[edge_id] = Line.builder().name(edge_name).radius(radius).positions(this.vertices[vi], this.vertices[vj]).colors(this.colors[vi], this.colors[vj]).build();
      }
    }
    return Object.values(lines);
  }
  asTriangles() {
    const triangles = [];
    for (let i2 = 0;i2 < this.faces.length; i2++) {
      let texCoordIndexes = this.faces[i2].textures;
      const normalIndexes = this.faces[i2].normals;
      const verticesIndexes = this.faces[i2].vertices;
      const material = this.materials?.[i2] ?? Diffuse();
      const edge_id = verticesIndexes.join("_");
      const edge_name = `${this.name}_${edge_id}`;
      triangles.push(Triangle.builder().name(edge_name).texture(this.texture).colors(...verticesIndexes.map((j2) => this.colors[j2])).normals(...normalIndexes.map((j2) => this.normals[j2])).positions(...verticesIndexes.map((j2) => this.vertices[j2])).texCoords(...texCoordIndexes.map((j2) => this.textureCoords[j2])).material(material).build());
    }
    return triangles;
  }
  serialize() {
  }
  deserialize(jsonMesh) {
  }
  static readObj(objFile, name = `Mesh_${MESH_COUNTER++}`) {
    const vertices = [];
    const normals = [];
    const textureCoords = [];
    const faces = [];
    const lines = objFile.split(/\n|\r/);
    for (let i2 = 0;i2 < lines.length; i2++) {
      const line = lines[i2];
      const spaces = line.split(" ").filter((x2) => x2 !== "");
      const type = spaces[0];
      if (!type)
        continue;
      if (type === "v") {
        const v = spaces.slice(1, 4).map((x2) => Number.parseFloat(x2));
        vertices.push(Vec3(...v));
        continue;
      }
      if (type === "vn") {
        const v = spaces.slice(1, 4).map((x2) => Number.parseFloat(x2));
        normals.push(Vec3(...v));
        continue;
      }
      if (type === "vt") {
        const v = spaces.slice(1, 3).map((x2) => Number.parseFloat(x2));
        textureCoords.push(Vec2(...v));
        continue;
      }
      if (type === "f") {
        triangulate(spaces.slice(1)).forEach((triangleIdx) => {
          faces.push(parseFace(triangleIdx));
        });
        continue;
      }
    }
    return new Mesh({ name, vertices, normals, textureCoords, faces });
  }
  static ofBox(box, name) {
    const vertices = UNIT_BOX_VERTEX.map((v) => v.mul(box.diagonal).add(box.min));
    return new Mesh({ name, vertices, faces: UNIT_BOX_LINES.map((indx3) => ({ vertices: indx3 })) });
  }
}

// src/Camera/raster.js
function rasterGraphics(scene, camera, params = {}) {
  const type2render = {
    [Sphere_default.name]: rasterSphere,
    [Line.name]: rasterLine,
    [Triangle.name]: rasterTriangle,
    [Mesh.name]: rasterMesh
  };
  const {
    cullBackFaces,
    bilinearTexture,
    clipCameraPlane,
    clearScreen,
    backgroundColor
  } = params;
  params.cullBackFaces = cullBackFaces ?? true;
  params.bilinearTexture = bilinearTexture ?? false;
  params.clipCameraPlane = clipCameraPlane ?? true;
  params.clearScreen = clearScreen ?? true;
  params.backgroundColor = backgroundColor ?? Color.BLACK;
  return (canvas) => {
    params.clearScreen && canvas.fill(params.backgroundColor);
    const w = canvas.width;
    const h2 = canvas.height;
    const zBuffer = new Float64Array(w * h2).fill(Number.MAX_VALUE);
    const elements = scene.getElements();
    for (let i2 = 0;i2 < elements.length; i2++) {
      const elem = elements[i2];
      if (elem.constructor.name in type2render) {
        type2render[elem.constructor.name]({
          w,
          h: h2,
          elem,
          canvas,
          params,
          zBuffer,
          camera
        });
      }
    }
    canvas.paint();
    return canvas;
  };
}
var rasterSphere = function({ canvas, camera, elem, w, h: h2, zBuffer }) {
  const point = elem;
  const { distanceToPlane } = camera;
  const { texCoord, texture, position, color, radius } = point;
  let pointInCamCoord = camera.toCameraCoord(position);
  const z = pointInCamCoord.z;
  if (z < distanceToPlane)
    return;
  const projectedPoint = pointInCamCoord.scale(distanceToPlane / z);
  let x2 = w / 2 + projectedPoint.x * w;
  let y2 = h2 / 2 + projectedPoint.y * h2;
  x2 = Math.floor(x2);
  y2 = Math.floor(y2);
  if (x2 < 0 || x2 >= w || y2 < 0 || y2 >= h2)
    return;
  const intRadius = Math.ceil(radius * (distanceToPlane / z) * w);
  const intRadiusSquare = intRadius * intRadius;
  let finalColor = color;
  if (texture && texCoord) {
    const texColor = getTexColor(texCoord, texture);
    finalColor = finalColor.add(texColor).scale(1 / 2);
  }
  for (let k2 = -intRadius;k2 < intRadius; k2++) {
    for (let l2 = -intRadius;l2 < intRadius; l2++) {
      const xl = Math.max(0, Math.min(w - 1, x2 + k2));
      const yl = Math.floor(y2 + l2);
      const squareLength = k2 * k2 + l2 * l2;
      if (squareLength > intRadiusSquare)
        continue;
      const [i2, j2] = canvas.canvas2grid(xl, yl);
      const zBufferIndex = Math.floor(w * i2 + j2);
      if (z < zBuffer[zBufferIndex]) {
        zBuffer[zBufferIndex] = z;
        canvas.setPxl(xl, yl, finalColor);
      }
    }
  }
};
var rasterLine = function({ canvas, camera, elem, w, h: h2, zBuffer, params }) {
  const lineElem = elem;
  const { colors, positions } = lineElem;
  const { distanceToPlane } = camera;
  const pointsInCamCoord = positions.map((p2) => camera.toCameraCoord(p2));
  let inFrustum = [];
  let outFrustum = [];
  pointsInCamCoord.forEach((p2, i2) => {
    const zCoord = p2.z;
    if (zCoord < distanceToPlane) {
      outFrustum.push(i2);
    } else {
      inFrustum.push(i2);
    }
  });
  if (params.clipCameraPlane && outFrustum.length === 2)
    return;
  if (outFrustum.length === 1) {
    const inVertex = inFrustum[0];
    const outVertex = outFrustum[0];
    const inter = lineCameraPlaneIntersection(pointsInCamCoord[outVertex], pointsInCamCoord[inVertex], camera);
    pointsInCamCoord[outVertex] = inter;
  }
  const projectedPoints = pointsInCamCoord.map((p2) => p2.scale(distanceToPlane / p2.z));
  const intPoints = projectedPoints.map((p2) => {
    let x2 = w / 2 + p2.x * w;
    let y2 = h2 / 2 + p2.y * h2;
    x2 = Math.floor(x2);
    y2 = Math.floor(y2);
    return Vec2(x2, y2);
  });
  const v = intPoints[1].sub(intPoints[0]);
  const vSquared = v.squareLength();
  const shader = (x2, y2) => {
    const p2 = Vec2(x2, y2).sub(intPoints[0]);
    const t = v.dot(p2) / vSquared;
    const z = pointsInCamCoord[0].z * (1 - t) + pointsInCamCoord[1].z * t;
    const c2 = colors[0].scale(1 - t).add(colors[1].scale(t));
    const [i2, j2] = canvas.canvas2grid(x2, y2);
    const zBufferIndex = Math.floor(w * i2 + j2);
    if (z < zBuffer[zBufferIndex]) {
      zBuffer[zBufferIndex] = z;
      return c2;
    }
  };
  canvas.drawLine(intPoints[0], intPoints[1], shader);
};
var rasterTriangle = function({ canvas, camera, elem, w, h: h2, zBuffer, params }) {
  const triangleElem = elem;
  const { distanceToPlane } = camera;
  const { colors, positions, texCoords, texture } = triangleElem;
  const pointsInCamCoord = positions.map((p2) => camera.toCameraCoord(p2));
  if (params.cullBackFaces) {
    const du = pointsInCamCoord[1].sub(pointsInCamCoord[0]);
    const dv = pointsInCamCoord[2].sub(pointsInCamCoord[0]);
    const n = du.cross(dv).normalize();
    if (n.dot(pointsInCamCoord[0]) <= 0)
      return;
  }
  let inFrustum = [];
  let outFrustum = [];
  pointsInCamCoord.forEach((p2, i2) => {
    const zCoord = p2.z;
    if (zCoord < distanceToPlane) {
      outFrustum.push(i2);
    } else {
      inFrustum.push(i2);
    }
  });
  if (params.clipCameraPlane && outFrustum.length >= 1)
    return;
  const projectedPoints = pointsInCamCoord.map((p2) => p2.scale(distanceToPlane / p2.z));
  const intPoints = projectedPoints.map((p2) => {
    let x2 = w / 2 + p2.x * w;
    let y2 = h2 / 2 + p2.y * h2;
    x2 = Math.floor(x2);
    y2 = Math.floor(y2);
    return Vec2(x2, y2);
  });
  const u2 = intPoints[1].sub(intPoints[0]);
  const v = intPoints[2].sub(intPoints[0]);
  const det = u2.x * v.y - u2.y * v.x;
  if (det === 0)
    return;
  const invDet = 1 / det;
  const c1 = colors[0].toArray();
  const c2 = colors[1].toArray();
  const c3 = colors[2].toArray();
  const haveTextures = texCoords && texCoords.length > 0 && !texCoords.some((x2) => x2 === undefined);
  const shader = (x2, y2) => {
    const p2 = Vec2(x2, y2).sub(intPoints[0]);
    const alpha = -(v.x * p2.y - v.y * p2.x) * invDet;
    const beta = (u2.x * p2.y - u2.y * p2.x) * invDet;
    const gamma = 1 - alpha - beta;
    const z = pointsInCamCoord[0].z * gamma + pointsInCamCoord[1].z * alpha + pointsInCamCoord[2].z * beta;
    let c4 = Color.ofRGB(c1[0] * gamma + c2[0] * alpha + c3[0] * beta, c1[1] * gamma + c2[1] * alpha + c3[1] * beta, c1[2] * gamma + c2[2] * alpha + c3[2] * beta, c1[3] * gamma + c2[3] * alpha + c3[3] * beta);
    if (haveTextures) {
      const texUV = texCoords[0].scale(gamma).add(texCoords[1].scale(alpha)).add(texCoords[2].scale(beta));
      const texColor = texture ? params.bilinearTexture ? getBiLinearTexColor(texUV, texture) : getTexColor(texUV, texture) : c4 ? c4 : getDefaultTexColor(texUV);
      c4 = texColor;
    }
    const [i2, j2] = canvas.canvas2grid(x2, y2);
    const zBufferIndex = Math.floor(w * i2 + j2);
    if (z < zBuffer[zBufferIndex]) {
      zBuffer[zBufferIndex] = z;
      return Math.random() < c4.alpha ? c4 : undefined;
    }
  };
  canvas.drawTriangle(intPoints[0], intPoints[1], intPoints[2], shader);
};
var rasterMesh = function({ canvas, camera, elem, w, h: h2, zBuffer, params }) {
  const triangles = elem._meshScene.getElements();
  for (let i2 = 0;i2 < triangles.length; i2++) {
    rasterTriangle({ canvas, camera, elem: triangles[i2], w, h: h2, zBuffer, params });
  }
};
var lineCameraPlaneIntersection = function(vertexOut, vertexIn, camera) {
  const { distanceToPlane } = camera;
  const v = vertexIn.sub(vertexOut);
  const alpha = (distanceToPlane - vertexOut.z) / v.z;
  const p2 = vertexOut.add(v.scale(alpha));
  return p2;
};

// src/Camera/sdf.js
function sdfTrace(scene) {
  return (ray) => {
    const maxIte = 100;
    const epsilon = 0.000001;
    let p2 = ray.init;
    let t = scene.distanceOnRay(ray);
    let minT = t;
    for (let i2 = 0;i2 < maxIte; i2++) {
      p2 = ray.trace(t);
      const d2 = scene.distanceOnRay(Ray(p2, ray.dir));
      t += d2;
      if (d2 < epsilon) {
        const normal = scene.normalToPoint(p2);
        return Color.ofRGB((normal.x + 1) / 2, (normal.y + 1) / 2, (normal.z + 1) / 2);
      }
      if (d2 > 2 * minT) {
        return Color.ofRGB(0, 0, i2 / maxIte);
      }
      minT = d2;
    }
    return Color.BLACK;
  };
}

// src/Camera/normal.js
function normalTrace(scene) {
  return (ray) => {
    const hit = scene.interceptWithRay(ray);
    if (hit) {
      const [, point, element] = hit;
      const normal = element.normalToPoint(point);
      return Color.ofRGB((normal.get(0) + 1) / 2, (normal.get(1) + 1) / 2, (normal.get(2) + 1) / 2);
    }
    return Color.BLACK;
  };
}

// src/Camera/parallel.js
function parallelWorkers(camera, scene, canvas, params = {}) {
  if (WORKERS.length === 0)
    WORKERS = [...Array(NUMBER_OF_CORES)].map(() => new MyWorker(`./src/Camera/RayTraceWorker.js`));
  const w = canvas.width;
  const h2 = canvas.height;
  let { samplesPerPxl, bounces, variance, gamma, bilinearTexture } = params;
  bounces = bounces ?? 10;
  variance = variance ?? 0.001;
  samplesPerPxl = samplesPerPxl ?? 1;
  gamma = gamma ?? 0.5;
  bilinearTexture = bilinearTexture ?? false;
  const isNewScene = prevSceneHash !== scene.hash;
  if (isNewScene)
    prevSceneHash = scene.hash;
  return WORKERS.map((worker, k2) => {
    return new Promise((resolve) => {
      worker.onMessage((message2) => {
        const { image, startRow, endRow } = message2;
        let index = 0;
        const startIndex = CHANNELS * w * startRow;
        const endIndex = CHANNELS * w * endRow;
        for (let i2 = startIndex;i2 < endIndex; i2 += CHANNELS) {
          canvas.setPxlData(i2, Color.ofRGB(image[index++], image[index++], image[index++], image[index++]));
        }
        resolve();
      });
      const ratio = Math.floor(h2 / WORKERS.length);
      const message = {
        width: w,
        height: h2,
        params: { samplesPerPxl, bounces, variance, gamma, bilinearTexture },
        startRow: k2 * ratio,
        endRow: Math.min(h2, (k2 + 1) * ratio),
        camera: camera.serialize(),
        scene: isNewScene ? scene.serialize() : undefined
      };
      worker.postMessage(message);
    });
  });
}
var __Worker = IS_NODE ? (await import("node:worker_threads")).Worker : Worker;

class MyWorker {
  constructor(path) {
    this.path = path;
    this.worker = new __Worker(path, { type: "module" });
  }
  onMessage(lambda) {
    if (IS_NODE) {
      this.worker.removeAllListeners("message");
      this.worker.on("message", lambda);
    } else {
      this.worker.onmessage = (message) => lambda(message.data);
    }
  }
  postMessage(message) {
    return this.worker.postMessage(message);
  }
}
var WORKERS = [];
var prevSceneHash = undefined;

// src/Camera/Camera.js
class Camera {
  constructor(props = {}) {
    const { lookAt, distanceToPlane, position, orientCoords, orbitCoords } = props;
    this.lookAt = lookAt ?? Vec3(0, 0, 0);
    this.distanceToPlane = distanceToPlane ?? 1;
    this.position = position ?? Vec3(3, 0, 0);
    this._orientCoords = orientCoords ?? Vec2();
    this._orbitCoords = orbitCoords;
    if (this._orbitCoords)
      this.orbit(...this._orbitCoords.toArray());
    else
      this.orient(...this._orientCoords.toArray());
    this._orbitCoords = this._orbitCoords ?? Vec3(this.position.length());
  }
  look(at, up = Vec3(0, 0, 1)) {
    this.lookAt = at;
    this.basis[2] = this.position.sub(at).normalize();
    this.basis[0] = this.basis[2].cross(up).normalize();
    this.basis[1] = this.basis[0].cross(this.basis[2]).normalize();
    return this;
  }
  orient(theta = 0, phi = 0) {
    if (theta instanceof Function) {
      this._orientCoords = theta(this._orientCoords);
      theta = this._orientCoords.x;
      phi = this._orientCoords.y;
    } else {
      this._orientCoords = Vec2(theta, phi);
    }
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    const cosP = Math.cos(phi);
    const sinP = Math.sin(phi);
    this.basis = [];
    this.basis[2] = Vec3(-cosP * cosT, -cosP * sinT, -sinP);
    this.basis[1] = Vec3(-sinP * cosT, -sinP * sinT, cosP);
    this.basis[0] = Vec3(-sinT, cosT, 0);
    return this;
  }
  orbit(radius, theta, phi) {
    if (radius instanceof Function) {
      this._orbitCoords = radius(this._orbitCoords);
      radius = this._orbitCoords.x;
      theta = this._orbitCoords.y;
      phi = this._orbitCoords.z;
    } else {
      this._orbitCoords = Vec3(radius, theta, phi);
    }
    this.orient(theta, phi);
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    const cosP = Math.cos(phi);
    const sinP = Math.sin(phi);
    const sphereCoordinates = Vec3(radius * cosP * cosT, radius * cosP * sinT, radius * sinP);
    this.position = sphereCoordinates.add(this.lookAt);
    return this;
  }
  rayMap(lambdaWithRays) {
    return {
      to: (canvas) => {
        const w = canvas.width;
        const invW = 1 / w;
        const h2 = canvas.height;
        const invH = 1 / h2;
        const ans = canvas.map((x2, y2) => {
          const dirInLocal = [
            x2 * invW - 0.5,
            y2 * invH - 0.5,
            this.distanceToPlane
          ];
          const dir = Vec3(this.basis[0].x * dirInLocal[0] + this.basis[1].x * dirInLocal[1] + this.basis[2].x * dirInLocal[2], this.basis[0].y * dirInLocal[0] + this.basis[1].y * dirInLocal[1] + this.basis[2].y * dirInLocal[2], this.basis[0].z * dirInLocal[0] + this.basis[1].z * dirInLocal[1] + this.basis[2].z * dirInLocal[2]).normalize();
          const c2 = lambdaWithRays(Ray(this.position, dir));
          return c2;
        });
        return ans;
      }
    };
  }
  sceneShot(scene, params) {
    return this.rayMap(rayTrace(scene, params));
  }
  reverseShot(scene, params) {
    return {
      to: rasterGraphics(scene, this, params)
    };
  }
  sdfShot(scene) {
    return this.rayMap(sdfTrace(scene));
  }
  normalShot(scene) {
    return this.rayMap(normalTrace(scene));
  }
  parallelShot(scene, params) {
    return {
      to: (canvas) => {
        return Promise.all(parallelWorkers(this, scene, canvas, params)).then(() => canvas.paint());
      }
    };
  }
  toCameraCoord(x2) {
    let pointInCamCoord = x2.sub(this.position);
    pointInCamCoord = Vec3(this.basis[0].dot(pointInCamCoord), this.basis[1].dot(pointInCamCoord), this.basis[2].dot(pointInCamCoord));
    return pointInCamCoord;
  }
  toWorldCoord(camVec) {
    let x2 = Vec3();
    for (let i2 = 0;i2 < this.basis.length; i2++) {
      x2 = x2.add(this.basis[i2].scale(camVec.get(i2)));
    }
    return x2;
  }
  rayFromImage(width, height) {
    const w = width;
    const invW = 1 / w;
    const h2 = height;
    const invH = 1 / h2;
    return (x2, y2) => {
      const dirInLocal = [
        x2 * invW - 0.5,
        y2 * invH - 0.5,
        this.distanceToPlane
      ];
      const dir = Vec3(this.basis[0].x * dirInLocal[0] + this.basis[1].x * dirInLocal[1] + this.basis[2].x * dirInLocal[2], this.basis[0].y * dirInLocal[0] + this.basis[1].y * dirInLocal[1] + this.basis[2].y * dirInLocal[2], this.basis[0].z * dirInLocal[0] + this.basis[1].z * dirInLocal[1] + this.basis[2].z * dirInLocal[2]).normalize();
      return Ray(this.position, dir);
    };
  }
  serialize() {
    return {
      lookAt: this.lookAt.toArray(),
      distanceToPlane: this.distanceToPlane,
      position: this.position.toArray(),
      orientCoords: this._orientCoords.toArray(),
      orbitCoords: this._orbitCoords.toArray()
    };
  }
  static deserialize(json) {
    return new Camera({
      lookAt: Vec.fromArray(json.lookAt),
      distanceToPlane: json.distanceToPlane,
      position: Vec.fromArray(json.position),
      orientCoords: Vec.fromArray(json.orientCoords),
      orbitCoords: Vec.fromArray(json.orbitCoords)
    });
  }
}

// src/Scene/Scene.js
var clusterLeafs2 = function(box, leafs, it = 10) {
  const clusters = [box.sample(), box.sample()];
  const clusterIndexes = [];
  for (let i2 = 0;i2 < it; i2++) {
    for (let i3 = 0;i3 < clusters.length; i3++) {
      clusterIndexes[i3] = [];
    }
    for (let j2 = 0;j2 < leafs.length; j2++) {
      const leafPosition = leafs[j2].box.center;
      const kIndex = argmin(clusters, (c2) => c2.sub(leafPosition).squareLength());
      clusterIndexes[kIndex].push(j2);
    }
    for (let j2 = 0;j2 < clusters.length; j2++) {
      if (clusterIndexes[j2].length === 0) {
        const dataPoints = clusterIndexes[(j2 + 1) % clusters.length];
        clusterIndexes[j2].push(dataPoints[Math.floor(Math.random() * dataPoints.length)]);
      }
    }
    for (let j2 = 0;j2 < clusters.length; j2++) {
      let acc = Vec.ZERO(box.dim);
      for (let k2 = 0;k2 < clusterIndexes[j2].length; k2++) {
        const leafPosition = leafs[clusterIndexes[j2][k2]].box.center;
        acc = acc.add(leafPosition);
      }
      clusters[j2] = acc.scale(1 / clusterIndexes[j2].length);
    }
  }
  return clusterIndexes.map((indxs) => indxs.map((indx3) => leafs[indx3]));
};
var leafsInterceptWithRay2 = function(leafs, ray) {
  let closestDistance = Number.MAX_VALUE;
  let closest;
  for (let i2 = 0;i2 < leafs.length; i2++) {
    const hit = leafs[i2].interceptWithRay(ray);
    if (hit && hit[0] < closestDistance) {
      closest = hit;
      closestDistance = hit[0];
    }
  }
  return closest;
};
var distanceFromLeafs2 = function(leafs, p2, combineLeafs) {
  const elements = leafs.map((x2) => x2.element);
  let distance = Number.MAX_VALUE;
  for (let i2 = 0;i2 < elements.length; i2++) {
    distance = combineLeafs(distance, elements[i2].distanceToPoint(p2));
  }
  return distance;
};

class Scene {
  constructor(k2 = 10) {
    this.k = k2;
    this.id2ElemMap = {};
    this.sceneElements = [];
    this.boundingBoxScene = new Node2(k2);
  }
  get hash() {
    return this.getElements().reduce((e, x2) => e ^ hashStr(x2.name), 0);
  }
  add(...elements) {
    return this.addList(elements);
  }
  addList(elements) {
    for (let i2 = 0;i2 < elements.length; i2++) {
      const elem = elements[i2];
      const { name } = elem;
      this.id2ElemMap[name] = elem;
      this.sceneElements.push(elem);
      this.boundingBoxScene.add(elem);
    }
    return this;
  }
  getElements() {
    return this.sceneElements;
  }
  clear() {
    this.id2ElemMap = {};
    this.sceneElements = [];
    this.boundingBoxScene = new Node2(this.k);
  }
  distanceToPoint(p2) {
    if (this.boundingBoxScene.leafs.length > 0) {
      let distance = Number.MAX_VALUE;
      const leafs = this.boundingBoxScene.leafs;
      for (let i2 = 0;i2 < leafs.length; i2++) {
        distance = Math.min(distance, leafs[i2].element.distanceToPoint(p2));
      }
      return distance;
    }
    return this.getElementNear(p2).distanceToPoint(p2);
  }
  normalToPoint(p2) {
    let normal2 = Vec3();
    let weight = 0;
    const ones = Vec3(1, 1, 1).scale(1 / (2 * this.k));
    const box = new Box(p2.sub(ones), p2.add(ones));
    const elements = this.getElementInBox(box);
    const size = elements.length;
    for (let i2 = 0;i2 < size; i2++) {
      const n = elements[i2].normalToPoint(p2);
      const d2 = 1 / elements[i2].distanceToPoint(p2);
      normal2 = normal2.add(n.scale(d2));
      weight += d2;
    }
    return normal2.length() > 0 ? normal2.scale(1 / weight).normalize() : normal2;
  }
  interceptWithRay(ray) {
    return this.boundingBoxScene.interceptWithRay(ray);
  }
  distanceOnRay(ray, combineLeafs = Math.min) {
    return this.boundingBoxScene.distanceOnRay(ray, combineLeafs);
  }
  getElementNear(p2) {
    if (this.boundingBoxScene.leafs.length > 0) {
      return this.boundingBoxScene.getElementNear(p2);
    }
    const initial = [this.boundingBoxScene.left, this.boundingBoxScene.right].map((x2) => ({ node: x2, distance: x2.box.distanceToPoint(p2) }));
    let stack = PQueue.ofArray(initial, (a2, b2) => a2.distance - b2.distance);
    while (stack.length) {
      const { leaf, node } = stack.pop();
      if (leaf)
        return leaf.getElemNear(p2);
      if (node.leafs.length > 0) {
        for (let i2 = 0;i2 < node.leafs.length; i2++) {
          const leaf2 = node.leafs[i2];
          stack.push({ leaf: leaf2, distance: leaf2.box.distanceToPoint(p2) });
        }
      }
      const children = [node.left, node.right].filter((x2) => x2).map((x2) => ({ node: x2, distance: x2.box.distanceToPoint(p2) }));
      children.forEach((c2) => stack.push(c2));
    }
  }
  getElementInBox(box) {
    return this.boundingBoxScene.getElemInBox(box);
  }
  rebuild() {
    if (!this.sceneElements.length)
      return this;
    let groupsQueue = PQueue.ofArray(clusterLeafs2(this.boundingBoxScene.box, this.sceneElements.map((x2) => new Leaf2(x2))), (a2, b2) => b2.length - a2.length);
    while (groupsQueue.data.map((x2) => x2.length > this.k).some((x2) => x2)) {
      if (groupsQueue.peek().length > this.k) {
        const groupOfLeafs = groupsQueue.pop();
        const box = groupOfLeafs.reduce((e, x2) => e.add(x2.box), new Box);
        const [left, right] = clusterLeafs2(box, groupOfLeafs);
        groupsQueue.push(left);
        groupsQueue.push(right);
      }
    }
    let nodeOrLeafStack = groupsQueue.data.map((group) => group.reduce((e, x2) => e.add(x2.element), new Node2(this.k)));
    while (nodeOrLeafStack.length > 1) {
      const nodeOrLeaf = nodeOrLeafStack[0];
      nodeOrLeafStack = nodeOrLeafStack.slice(1);
      const minIndex = argmin(nodeOrLeafStack, (x2) => nodeOrLeaf.box.distanceToBox(x2.box));
      const newNode = nodeOrLeaf.join(nodeOrLeafStack[minIndex]);
      nodeOrLeafStack.splice(minIndex, 1);
      nodeOrLeafStack.push(newNode);
    }
    this.boundingBoxScene = nodeOrLeafStack.pop();
    return this;
  }
  debug(props) {
    const { camera, canvas } = props;
    let { node, level, level2colors, debugScene } = props;
    node = node || this.boundingBoxScene;
    level = level || 0;
    level2colors = level2colors || [];
    debugScene = debugScene || new NaiveScene;
    if (level === 0) {
      let maxLevels = Math.round(Math.log2(node.numberOfLeafs / this.k)) + 1;
      maxLevels = maxLevels === 0 ? 1 : maxLevels;
      for (let i2 = 0;i2 <= maxLevels; i2++)
        level2colors.push(Color.RED.scale(1 - i2 / maxLevels).add(Color.BLUE.scale(i2 / maxLevels)));
    }
    debugScene = drawBox({ box: node.box, color: level2colors[level], debugScene });
    if (!node.isLeaf && node.left) {
      this.debug({ canvas, camera, node: node.left, level: level + 1, level2colors, debugScene });
    }
    if (!node.isLeaf && node.right) {
      this.debug({ canvas, camera, node: node.right, level: level + 1, level2colors, debugScene });
    }
    if (level === 0)
      return camera.reverseShot(debugScene, { clearScreen: false }).to(canvas);
    return canvas;
  }
  serialize() {
    return this.getElements().map((x2) => x2.serialize());
  }
  static deserialize(serializedScene) {
    return new Scene().addList(serializedScene.map((x2) => {
      if (x2.type === Triangle.name)
        return Triangle.deserialize(x2);
      if (x2.type === Sphere_default.name)
        return Sphere_default.deserialize(x2);
    }));
  }
}

class Node2 {
  isLeaf = false;
  numberOfLeafs = 0;
  constructor(k2) {
    this.k = k2;
    this.box = Box.EMPTY;
    this.leafs = [];
    this.parent = undefined;
  }
  add(element) {
    this.numberOfLeafs += 1;
    const elemBox = element.getBoundingBox();
    this.box = this.box.add(elemBox);
    if (!this.left && !this.right) {
      this.leafs.push(new Leaf2(element));
      if (this.leafs.length <= this.k)
        return this;
      const [lefts, rights] = clusterLeafs2(this.box, this.leafs);
      this.left = new Node2(this.k).addList(lefts.map((x2) => x2.element));
      this.right = new Node2(this.k).addList(rights.map((x2) => x2.element));
      this.left.parent = this;
      this.right.parent = this;
      this.leafs = [];
    } else {
      const children = [this.left, this.right];
      const index = argmin(children, (x2) => element.getBoundingBox().distanceToBox(x2.box));
      children[index].add(element);
    }
    return this;
  }
  addList(elements) {
    for (let i2 = 0;i2 < elements.length; i2++) {
      this.add(elements[i2]);
    }
    return this;
  }
  interceptWithRay(ray) {
    if (this.leafs.length > 0) {
      return leafsInterceptWithRay2(this.leafs, ray);
    }
    const leftT = this.left?.box?.interceptWithRay(ray)?.[0] ?? Number.MAX_VALUE;
    const rightT = this.right?.box?.interceptWithRay(ray)?.[0] ?? Number.MAX_VALUE;
    if (leftT === Number.MAX_VALUE && rightT === Number.MAX_VALUE)
      return;
    const first = leftT <= rightT ? this.left : this.right;
    const second = leftT > rightT ? this.left : this.right;
    const secondT = Math.max(leftT, rightT);
    const firstHit = first.interceptWithRay(ray);
    if (firstHit && firstHit[0] < secondT)
      return firstHit;
    const secondHit = second.interceptWithRay(ray);
    return secondHit && secondHit[0] < (firstHit?.[0] ?? Number.MAX_VALUE) ? secondHit : firstHit;
  }
  distanceToPoint(p2) {
    return this.getElementNear(p2).distanceToPoint(p2);
  }
  distanceOnRay(ray, combineLeafs) {
    if (this.leafs.length > 0) {
      return distanceFromLeafs2(this.leafs, ray.init, combineLeafs);
    }
    const leftT = this.left?.box?.interceptWithRay(ray)?.[0] ?? Number.MAX_VALUE;
    const rightT = this.right?.box?.interceptWithRay(ray)?.[0] ?? Number.MAX_VALUE;
    if (leftT === Number.MAX_VALUE && rightT === Number.MAX_VALUE)
      return Number.MAX_VALUE;
    const first = leftT <= rightT ? this.left : this.right;
    const second = leftT > rightT ? this.left : this.right;
    const firstT = Math.min(leftT, rightT);
    const secondT = Math.max(leftT, rightT);
    const firstHit = first.distanceOnRay(ray, combineLeafs);
    if (firstHit < secondT)
      return firstHit;
    const secondHit = second.distanceOnRay(ray, combineLeafs);
    return secondHit <= firstHit ? secondHit : firstHit;
  }
  getElementNear(p2) {
    if (this.leafs.length > 0) {
      const minIndex = argmin(this.leafs, (x2) => x2.distanceToPoint(p2));
      return this.leafs[minIndex].element;
    }
    const children = [this.left, this.right];
    const index = argmin(children, (n) => n.box.center.sub(p2).length());
    return children[index].getElementNear(p2);
  }
  getNodeNear(p2) {
    if (this.leafs.length > 0) {
      return this;
    }
    const children = [this.left, this.right];
    const index = argmin(children, (n) => n.box.center.sub(p2).length());
    return children[index].getNodeNear(p2);
  }
  getLeafsNear(p2) {
    if (this.leafs.length > 0) {
      return this.leafs;
    }
    const children = [this.left, this.right];
    const index = argmin(children, (n) => n.box.center.sub(p2).length());
    return children[index].getLeafsNear(p2);
  }
  getElemInBox(box) {
    let elements = [];
    if (this.leafs.length > 0) {
      this.leafs.forEach((leaf) => !leaf.box.sub(box).isEmpty && elements.push(leaf.element));
      return elements;
    }
    const children = [this.left, this.right];
    for (let i2 = 0;i2 < children.length; i2++) {
      if (!children[i2].box.sub(box).isEmpty) {
        elements = elements.concat(children[i2].getElemInBox(box));
      }
    }
    return elements;
  }
  getRandomLeaf() {
    const index = Math.floor(Math.random() * this.children.length);
    return this.children[index].isLeaf ? this.children[index] : this.children[index].getRandomLeaf();
  }
  join(nodeOrLeaf) {
    if (nodeOrLeaf.isLeaf)
      return this.add(nodeOrLeaf.element);
    const newNode = new Node2(this.k);
    newNode.left = this;
    newNode.left.parent = newNode;
    newNode.right = nodeOrLeaf;
    newNode.right.parent = newNode;
    newNode.box = this.box.add(nodeOrLeaf.box);
    newNode.numberOfLeafs = newNode.left.numberOfLeafs + newNode.right.numberOfLeafs;
    return newNode;
  }
}

class Leaf2 {
  isLeaf = true;
  constructor(element) {
    this.element = element;
    this.box = element.getBoundingBox();
  }
  distanceToPoint(x2) {
    return this.element.distanceToPoint(x2);
  }
  getLeafs() {
    return [this];
  }
  getRandomLeaf() {
    return this;
  }
  getElemIn(box) {
    if (!box.sub(this.box).isEmpty)
      return [this.element];
    return [];
  }
  getElemNear() {
    return this.element;
  }
  interceptWithRay(ray) {
    return this.element.interceptWithRay(ray);
  }
}

// src/Scene/BScene.js
class BScene {
  constructor() {
    this.id2ElemMap = {};
    this.sceneElements = [];
    this.boundingBoxScene = new Node3;
  }
  add(...elements) {
    return this.addList(elements);
  }
  addList(elements) {
    for (let i2 = 0;i2 < elements.length; i2++) {
      const elem = elements[i2];
      const { name } = elem;
      this.id2ElemMap[name] = elem;
      this.sceneElements.push(elem);
      this.boundingBoxScene.add(elem);
    }
    return this;
  }
  getElements() {
    return this.sceneElements;
  }
  clear() {
    this.id2ElemMap = {};
    this.sceneElements = [];
    this.boundingBoxScene = new Node3;
  }
  distanceToPoint(p2) {
    return this.getElementNear(p2).distanceToPoint(p2);
  }
  normalToPoint(p2) {
    const epsilon = 0.000000001;
    const n = p2.dim;
    const grad = [];
    const d2 = this.distanceToPoint(p2);
    for (let i2 = 0;i2 < n; i2++) {
      grad.push(this.distanceToPoint(p2.add(Vec.e(n)(i2).scale(epsilon))) - d2);
    }
    return Vec.fromArray(grad).scale(Math.sign(d2)).normalize();
  }
  interceptWithRay(ray, level) {
    if (!this.boundingBoxScene)
      return;
    return this.boundingBoxScene.interceptWithRay(ray, level);
  }
  distanceOnRay(ray) {
    return this.boundingBoxScene.distanceOnRay(ray);
  }
  getElementNear(p2) {
    if (this.boundingBoxScene.numberOfLeafs < 2) {
      return this.boundingBoxScene.getElementNear(p2);
    }
    const initial = [this.boundingBoxScene.left, this.boundingBoxScene.right].map((x2) => ({ node: x2, distance: x2.box.distanceToPoint(p2) }));
    let stack = PQueue.ofArray(initial, (a2, b2) => a2.distance - b2.distance);
    while (stack.length) {
      const { node } = stack.pop();
      if (node.isLeaf)
        return node.getElemNear(p2);
      const children = [node.left, node.right].filter((x2) => x2).map((x2) => ({ node: x2, distance: x2.box.distanceToPoint(p2) }));
      children.forEach((c2) => stack.push(c2));
    }
  }
  getElementInBox(box) {
    return this.boundingBoxScene.getElemInBox(box);
  }
  rebuild() {
    let nodeOrLeafStack = this.sceneElements.map((x2) => new Leaf3(x2));
    while (nodeOrLeafStack.length > 1) {
      const nodeOrLeaf = nodeOrLeafStack[0];
      nodeOrLeafStack = nodeOrLeafStack.slice(1);
      const minIndex = argmin(nodeOrLeafStack, (x2) => nodeOrLeaf.box.distanceToBox(x2.box));
      const newNode = nodeOrLeaf.join(nodeOrLeafStack[minIndex]);
      nodeOrLeafStack.splice(minIndex, 1);
      nodeOrLeafStack.push(newNode);
    }
    this.boundingBoxScene = nodeOrLeafStack.pop();
    return this;
  }
  debug(props) {
    const { camera, canvas } = props;
    let { node, level, level2colors, debugScene } = props;
    node = node || this.boundingBoxScene;
    level = level || 0;
    level2colors = level2colors || [];
    debugScene = debugScene || new NaiveScene;
    if (level === 0) {
      let maxLevels = Math.round(Math.log2(node.numberOfLeafs));
      maxLevels = maxLevels === 0 ? 1 : maxLevels;
      for (let i2 = 0;i2 <= maxLevels; i2++)
        level2colors.push(Color.RED.scale(1 - i2 / maxLevels).add(Color.BLUE.scale(i2 / maxLevels)));
    }
    debugScene = drawBox({ box: node.box, color: level2colors[level], debugScene });
    if (!node.isLeaf && node.left) {
      this.debug({ canvas, camera, node: node.left, level: level + 1, level2colors, debugScene });
    }
    if (!node.isLeaf && node.right) {
      this.debug({ canvas, camera, node: node.right, level: level + 1, level2colors, debugScene });
    }
    if (level === 0)
      return camera.reverseShot(debugScene, { clearScreen: false }).to(canvas);
    return canvas;
  }
}

class Node3 {
  isLeaf = false;
  numberOfLeafs = 0;
  constructor() {
    this.box = Box.EMPTY;
  }
  add(element) {
    this.numberOfLeafs += 1;
    const elemBox = element.getBoundingBox();
    this.box = this.box.add(elemBox);
    if (!this.left) {
      this.left = new Leaf3(element);
    } else if (!this.right) {
      this.right = new Leaf3(element);
    } else {
      this._addElementWhenTreeIsFull(element, elemBox);
    }
    return this;
  }
  addList(elements) {
    for (let i2 = 0;i2 < elements.length; i2++) {
      this.add(elements[i2]);
    }
    return this;
  }
  interceptWithRay(ray) {
    const leftT = this.left?.box?.interceptWithRay(ray)?.[0] ?? Number.MAX_VALUE;
    const rightT = this.right?.box?.interceptWithRay(ray)?.[0] ?? Number.MAX_VALUE;
    if (leftT === Number.MAX_VALUE && rightT === Number.MAX_VALUE)
      return;
    const first = leftT <= rightT ? this.left : this.right;
    const second = leftT > rightT ? this.left : this.right;
    const secondT = Math.max(leftT, rightT);
    const firstHit = first.interceptWithRay(ray);
    if (firstHit && firstHit[0] < secondT)
      return firstHit;
    const secondHit = second.interceptWithRay(ray);
    return secondHit && secondHit[0] < (firstHit?.[0] ?? Number.MAX_VALUE) ? secondHit : firstHit;
  }
  distanceToPoint(p2) {
    const children = [this.left, this.right].filter((x2) => x2);
    const index = argmin(children, (n) => n.box.center.sub(p2).length());
    return children[index].distanceToPoint(p2);
  }
  distanceOnRay(ray) {
    if (this.left.isLeaf && this.right.isLeaf) {
      return Math.min(this.left.distanceToPoint(ray.init), this.right.distanceToPoint(ray.init));
    }
    const leftT = this.left?.box?.interceptWithRay(ray)?.[0] ?? Number.MAX_VALUE;
    const rightT = this.right?.box?.interceptWithRay(ray)?.[0] ?? Number.MAX_VALUE;
    if (leftT === Number.MAX_VALUE && rightT === Number.MAX_VALUE)
      return Number.MAX_VALUE;
    const first = leftT <= rightT ? this.left : this.right;
    const second = leftT > rightT ? this.left : this.right;
    const firstT = Math.min(leftT, rightT);
    const secondT = Math.max(leftT, rightT);
    const firstHit = first.distanceOnRay(ray, firstT);
    if (firstHit < secondT)
      return firstHit;
    const secondHit = second.distanceOnRay(ray, secondT);
    return secondHit <= firstHit ? secondHit : firstHit;
  }
  getElementNear(p2) {
    const children = [this.left, this.right].filter((x2) => x2);
    const index = argmin(children, (n) => n.box.center.sub(p2).length());
    return children[index].getElemNear(p2);
  }
  getElemInBox(box) {
    let elements = [];
    const children = [this.left, this.right].filter((x2) => x2);
    for (let i2 = 0;i2 < children.length; i2++) {
      if (!children[i2].box.sub(box).isEmpty) {
        elements = elements.concat(children[i2].getElemIn(box));
      }
    }
    return elements;
  }
  getRandomLeaf() {
    return Math.random() < 0.5 ? this.left.getRandomLeaf() : this.right.getRandomLeaf();
  }
  join(nodeOrLeaf) {
    if (nodeOrLeaf.isLeaf)
      return this.add(nodeOrLeaf.element);
    const newNode = new Node3;
    newNode.left = this;
    newNode.right = nodeOrLeaf;
    newNode.box = this.box.add(nodeOrLeaf.box);
    newNode.numberOfLeafs = newNode.left.numberOfLeafs + newNode.right.numberOfLeafs;
    return newNode;
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
        this.left = new Node3().add(aux).add(element);
      if (minIndex === 1)
        this.right = new Node3().add(aux).add(element);
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
        this.left = new Node3;
        this.left.add(aux.element).add(element);
      },
      1: () => {
        const aux = this.right;
        this.right = new Node3;
        this.right.add(aux.element).add(element);
      },
      2: () => {
        const aux = this.left;
        this.left = new Node3;
        this.left.add(aux.element).add(this.right.element);
        this.right = new Leaf3(element);
      }
    };
    index2Action[index]();
  }
}

class Leaf3 {
  isLeaf = true;
  constructor(element) {
    this.element = element;
    this.box = element.getBoundingBox();
    this.numberOfLeafs = 1;
  }
  distanceToPoint(x2) {
    return this.element.distanceToPoint(x2);
  }
  getLeafs() {
    return [this];
  }
  getRandomLeaf() {
    return this;
  }
  getElemIn(box) {
    if (!box.sub(this.box).isEmpty)
      return [this.element];
    return [];
  }
  getElemNear() {
    return this.element;
  }
  interceptWithRay(ray) {
    return this.element.interceptWithRay(ray);
  }
  join(nodeOrLeaf) {
    if (nodeOrLeaf.isLeaf)
      return new Node3().add(this.element).add(nodeOrLeaf.element);
    return nodeOrLeaf.join(this);
  }
}

// src/Scene/VoxelScene.js
class VoxelScene {
  constructor(gridSpace = 0.1) {
    this.id2ElemMap = {};
    this.sceneElements = [];
    this.gridMap = {};
    this.gridSpace = gridSpace;
  }
  hash(p2) {
    const integerCoord = p2.map((z) => Math.floor(z / this.gridSpace));
    const h2 = integerCoord.x * 92837111 ^ integerCoord.y * 689287499 ^ integerCoord.z * 283923481;
    return Math.abs(h2);
  }
  add(...elements) {
    return this.addList(elements);
  }
  addList(elements) {
    const binary = [0, 1];
    const n = binary.length ** 3;
    const powers = [binary.length ** 2, binary.length];
    for (let i2 = 0;i2 < elements.length; i2++) {
      const elem = elements[i2];
      const { name } = elem;
      this.id2ElemMap[name] = elem;
      this.sceneElements.push(elem);
      const pivot = elem.getBoundingBox().min;
      const points = [];
      for (let k2 = 0;k2 < n; k2++) {
        const i0 = Math.floor(k2 / powers[0]);
        const i1 = Math.floor(k2 / powers[1]) % powers[1];
        const i22 = k2 % powers[1];
        points.push(pivot.add(Vec3(i0, i1, i22).mul(elem.getBoundingBox().diagonal)));
      }
      points.forEach((p2) => {
        const h2 = this.hash(p2);
        if (!(h2 in this.gridMap)) {
          this.gridMap[h2] = {};
        }
        let cell = this.gridMap[h2];
        cell[elem.name] = elem;
      });
    }
    return this;
  }
  getElements() {
    return this.sceneElements;
  }
  clear() {
    this.id2ElemMap = {};
    this.sceneElements = [];
    this.gridMap = {};
  }
  distanceToPoint(p2) {
    return Number.MAX_VALUE;
  }
  normalToPoint(p2) {
    let normal2 = Vec3();
    const elements = Object.values(this.gridMap[this.hash(p2)] || {});
    for (let i2 = 0;i2 < elements.length; i2++) {
      const elem = elements[i2];
      normal2 = normal2.add(elem.normalToPoint(p2));
    }
    return normal2.length() > 0 ? normal2.normalize() : normal2;
  }
  interceptWithRay(ray) {
    const maxDist = 10;
    const maxIte = maxDist / this.gridSpace;
    let t = 0;
    let elements = [];
    for (let n = 0;n < maxIte; n++) {
      let p2 = ray.trace(t);
      const newElements = Object.values(this.gridMap[this.hash(p2)] || {});
      if (newElements?.length) {
        elements = elements.concat(newElements);
      }
      t += this.gridSpace;
    }
    if (elements?.length) {
      let closestDistance = Number.MAX_VALUE;
      let closest;
      for (let i2 = 0;i2 < elements.length; i2++) {
        const hit = elements[i2].interceptWithRay(ray);
        if (hit && hit[0] < closestDistance) {
          closest = hit;
          closestDistance = hit[0];
        }
      }
      return closest;
    }
  }
  distanceOnRay(ray, combineLeafs = Math.min) {
    const maxDist = 10;
    const maxIte = maxDist / this.gridSpace;
    let t = 0;
    let elements = [];
    for (let n = 0;n < maxIte; n++) {
      let p2 = ray.trace(t);
      const newElements = Object.values(this.gridMap[this.hash(p2)] || {});
      if (newElements?.length) {
        elements = elements.concat(newElements);
        break;
      }
      t += this.gridSpace;
    }
    if (elements?.length) {
      let distance = Number.MAX_VALUE;
      for (let i2 = 0;i2 < elements.length; i2++) {
        distance = combineLeafs(distance, elements[i2].distanceToPoint(ray.init));
      }
      return distance;
    }
    return Number.MAX_VALUE;
  }
  getElementNear(p2) {
    throw Error("Not implemented");
  }
  getElementInBox(box) {
    const size = box.diagonal.fold((e, x2) => e * x2, 1);
    const samples = Math.floor(size / this.gridSpace);
    let elements = [];
    for (let i2 = 0;i2 < samples; i2++) {
      const p2 = box.sample();
      elements = elements.concat(Object.values(this.gridMap[this.hash(p2)] || {}));
    }
    return elements;
  }
  rebuild() {
    return this;
  }
  debug(props) {
    const { camera, canvas } = props;
    const debugScene = new NaiveScene;
    Object.keys(this.gridMap).forEach((k2) => {
      const elemsMap = this.gridMap[k2] || {};
      Object.values(elemsMap).forEach((e) => {
        const pivot = e.getBoundingBox().center.map((z) => Math.floor(z / this.gridSpace)).scale(this.gridSpace);
        drawBox({
          box: new Box(pivot, pivot.add(Vec3(1, 1, 1).scale(this.gridSpace))),
          color: Color.RED,
          debugScene
        });
      });
    });
    camera.reverseShot(debugScene, { clearScreen: false }).to(canvas);
    return canvas;
  }
}

// src/Scene/RandomScene.js
var clusterLeafs3 = function(box, leafs, it = 10) {
  const clusters = [box.sample(), box.sample()];
  const clusterIndexes = [];
  for (let i2 = 0;i2 < it; i2++) {
    for (let i3 = 0;i3 < clusters.length; i3++) {
      clusterIndexes[i3] = [];
    }
    for (let j2 = 0;j2 < leafs.length; j2++) {
      const leafPosition = leafs[j2].box.center;
      const kIndex = argmin(clusters, (c2) => c2.sub(leafPosition).squareLength());
      clusterIndexes[kIndex].push(j2);
    }
    for (let j2 = 0;j2 < clusters.length; j2++) {
      if (clusterIndexes[j2].length === 0) {
        const dataPoints = clusterIndexes[(j2 + 1) % clusters.length];
        clusterIndexes[j2].push(dataPoints[Math.floor(Math.random() * dataPoints.length)]);
      }
    }
    for (let j2 = 0;j2 < clusters.length; j2++) {
      let acc = Vec.ZERO(box.dim);
      for (let k2 = 0;k2 < clusterIndexes[j2].length; k2++) {
        const leafPosition = leafs[clusterIndexes[j2][k2]].box.center;
        acc = acc.add(leafPosition);
      }
      clusters[j2] = acc.scale(1 / clusterIndexes[j2].length);
    }
  }
  return [...clusterIndexes].map((indxs) => indxs.map((indx3) => leafs[indx3]));
};
var random = function(n) {
  let index = 0;
  const numbers = new Float64Array(n).map(() => Math.random());
  return () => numbers[index++ % n];
};
var leafsinterceptWithRay = function(leafs, ray) {
  let closestDistance = Number.MAX_VALUE;
  let closest;
  for (let i2 = 0;i2 < leafs.length; i2++) {
    const hit = leafs[i2].interceptWithRay(ray);
    if (hit && hit[0] < closestDistance) {
      closest = hit;
      closestDistance = hit[0];
    }
  }
  return closest;
};
var rayCache = (gridSize = 0.01, dirGrid = 0.01) => {
  const cache = {};
  cache.table = {};
  function hash(p2) {
    const integerCoord = p2.map((z) => Math.floor(z / gridSize));
    const h2 = integerCoord.x * 92837111 ^ integerCoord.y * 689287499 ^ integerCoord.z * 283923481;
    return Math.abs(h2);
  }
  function dirHash(d2) {
    const integerCoord = d2.map((z) => Math.floor(z / dirGrid));
    const h2 = integerCoord.x * 92837111 ^ integerCoord.y * 689287499 ^ integerCoord.z * 283923481;
    return Math.abs(h2);
  }
  cache.put = (ray, value) => {
    const { init, dir } = ray;
    let h2 = hash(init);
    if (!(h2 in cache.table)) {
      cache.table[h2] = {};
    }
    const dirCache = cache.table[h2];
    h2 = dirHash(dir);
    dirCache[h2] = value;
    return cache;
  };
  cache.get = (ray) => {
    const { init, dir } = ray;
    let h2 = hash(init);
    const dirCache = cache.table[h2];
    if (dirCache) {
      h2 = dirHash(dir);
      return dirCache[h2];
    }
    return;
  };
  return cache;
};
var RAY_CACHE = rayCache();

class RandomScene {
  constructor(k2 = 10) {
    this.k = k2;
    this.id2ElemMap = {};
    this.sceneElements = [];
    this.boundingBoxScene = new Node4(k2);
  }
  add(...elements) {
    return this.addList(elements);
  }
  addList(elements) {
    for (let i2 = 0;i2 < elements.length; i2++) {
      const elem = elements[i2];
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
    this.boundingBoxScene = new Node4(this.k);
  }
  getElements() {
    return this.sceneElements;
  }
  getElementInBox(box) {
    return this.boundingBoxScene.getElemIn(box);
  }
  getElementNear(p2) {
    return this.boundingBoxScene.getElemNear(p2);
  }
  interceptWithRay(ray, level) {
    const nodeCache = RAY_CACHE.get(ray);
    if (nodeCache) {
      return leafsinterceptWithRay(nodeCache.leafs, ray);
    }
    return this.boundingBoxScene.interceptWithRay(ray, level);
  }
  distanceToPoint(p2) {
    if (this.boundingBoxScene.leafs.length > 0) {
      let distance = Number.MAX_VALUE;
      const leafs = this.boundingBoxScene.leafs;
      for (let i2 = 0;i2 < leafs.length; i2++) {
        distance = Math.min(distance, leafs[i2].element.distanceToPoint(p2));
      }
      return distance;
    }
    return this.getElementNear(p2).distanceToPoint(p2);
  }
  normalToPoint(p2) {
    const epsilon = 0.000000001;
    const n = p2.dim;
    const grad = [];
    const d2 = this.distanceToPoint(p2);
    for (let i2 = 0;i2 < n; i2++) {
      grad.push(this.distanceToPoint(p2.add(Vec.e(n)(i2).scale(epsilon))) - d2);
    }
    return Vec.fromArray(grad).scale(Math.sign(d2)).normalize();
  }
  debug(props) {
    const { camera, canvas } = props;
    let { node, level, level2colors, debugScene } = props;
    node = node || this.boundingBoxScene;
    level = level || 0;
    level2colors = level2colors || [];
    debugScene = debugScene || new NaiveScene;
    if (level === 0) {
      let maxLevels = Math.round(Math.log2(node.numberOfLeafs / this.k)) + 1;
      maxLevels = maxLevels === 0 ? 1 : maxLevels;
      for (let i2 = 0;i2 <= maxLevels; i2++)
        level2colors.push(Color.RED.scale(1 - i2 / maxLevels).add(Color.BLUE.scale(i2 / maxLevels)));
    }
    debugScene = drawBox({ box: node.box, color: level2colors[level], debugScene });
    if (!node.isLeaf && node.left) {
      this.debug({ canvas, camera, node: node.left, level: level + 1, level2colors, debugScene });
    }
    if (!node.isLeaf && node.right) {
      this.debug({ canvas, camera, node: node.right, level: level + 1, level2colors, debugScene });
    }
    if (level === 0)
      return camera.reverseShot(debugScene, { clearScreen: false }).to(canvas);
    return canvas;
  }
  rebuild() {
    let groupsQueue = PQueue.ofArray([...clusterLeafs3(this.boundingBoxScene.box, this.sceneElements.map((x2) => new Leaf4(x2)))], (a2, b2) => b2.length - a2.length);
    while (groupsQueue.data.map((x2) => x2.length > this.k).some((x2) => x2)) {
      if (groupsQueue.peek().length > this.k) {
        const groupOfLeafs = groupsQueue.pop();
        const box = groupOfLeafs.reduce((e, x2) => e.add(x2.box), new Box);
        const [left, right] = clusterLeafs3(box, groupOfLeafs);
        groupsQueue.push(left);
        groupsQueue.push(right);
      }
    }
    let nodeOrLeafStack = groupsQueue.data.map((group) => group.reduce((e, x2) => e.add(x2.element), new Node4(this.k)));
    while (nodeOrLeafStack.length > 1) {
      const nodeOrLeaf = nodeOrLeafStack[0];
      nodeOrLeafStack = nodeOrLeafStack.slice(1);
      const minIndex = argmin(nodeOrLeafStack, (x2) => nodeOrLeaf.box.distanceToBox(x2.box));
      const newNode = nodeOrLeaf.join(nodeOrLeafStack[minIndex]);
      nodeOrLeafStack.splice(minIndex, 1);
      nodeOrLeafStack.push(newNode);
    }
    this.boundingBoxScene = nodeOrLeafStack.pop();
    return this;
  }
}

class Node4 {
  isLeaf = false;
  numberOfLeafs = 0;
  constructor(k2) {
    this.k = k2;
    this.box = Box.EMPTY;
    this.leafs = [];
  }
  add(element) {
    this.numberOfLeafs += 1;
    const elemBox = element.getBoundingBox();
    this.box = this.box.add(elemBox);
    if (!this.left && !this.right) {
      this.leafs.push(new Leaf4(element));
      if (this.leafs.length < this.k)
        return this;
      const [lefts, rights] = clusterLeafs3(this.box, this.leafs);
      this.left = new Node4(this.k).addList(lefts.map((x2) => x2.element));
      this.right = new Node4(this.k).addList(rights.map((x2) => x2.element));
      this.leafs = [];
    } else {
      const children = [this.left, this.right];
      const index = argmin(children, (x2) => element.boundingBox.distanceToBox(x2.box));
      children[index].add(element);
    }
    return this;
  }
  addList(elements) {
    for (let i2 = 0;i2 < elements.length; i2++) {
      this.add(elements[i2]);
    }
    return this;
  }
  interceptWithRay(ray) {
    const boxHit = this.box.interceptWithRay(ray);
    if (!boxHit)
      return;
    if (this.leafs.length > 0) {
      RAY_CACHE.put(ray, this);
      return leafsinterceptWithRay(this.leafs, ray);
    }
    const children = [this.left, this.right];
    const hits = [];
    for (let i2 = 0;i2 < children.length; i2++) {
      const hit = children[i2].interceptWithRay(ray);
      if (hit)
        hits.push(hit);
    }
    const minIndex = argmin(hits, ([t]) => t);
    if (minIndex === -1)
      return;
    return hits[minIndex];
  }
  distanceToPoint(p2) {
    return this.getElemNear(p2).distanceToPoint(p2);
  }
  getElemNear(p2) {
    if (this.leafs.length > 0) {
      const minIndex = argmin(this.leafs, (x2) => x2.distanceToPoint(p2));
      return this.leafs[minIndex].element;
    }
    const children = [this.left, this.right];
    const index = argmin(children, (n) => n.box.center.sub(p2).length());
    const coin = RCACHE() < 0.01 ? 1 : 0;
    return children[(index + coin) % 2].getElemNear(p2);
  }
  getElemIn(box) {
    let elements = [];
    if (this.leafs.length > 0) {
      this.leafs.forEach((leaf) => !leaf.box.sub(box).isEmpty && elements.push(leaf.element));
      return elements;
    }
    const children = [this.left, this.right];
    for (let i2 = 0;i2 < children.length; i2++) {
      if (!children[i2].box.sub(box).isEmpty) {
        elements = elements.concat(children[i2].getElemIn(box));
      }
    }
    return elements;
  }
  getRandomLeaf() {
    if (this.leafs.length > 0) {
      const index2 = Math.floor(Math.random() * this.leafs.length);
      return this.leafs[index2];
    }
    const children = [this.left, this.right];
    const index = Math.floor(Math.random() * children.length);
    return children[index].getRandomLeaf();
  }
  join(nodeOrLeaf) {
    if (nodeOrLeaf.isLeaf)
      return this.add(nodeOrLeaf.element);
    const newNode = new Node4(this.k);
    newNode.left = this;
    newNode.right = nodeOrLeaf;
    newNode.box = this.box.add(nodeOrLeaf.box);
    newNode.numberOfLeafs = newNode.left.numberOfLeafs + newNode.right.numberOfLeafs;
    return newNode;
  }
}

class Leaf4 {
  isLeaf = true;
  constructor(element) {
    this.element = element;
    this.box = element.getBoundingBox();
  }
  distanceToPoint(x2) {
    return this.element.distanceToPoint(x2);
  }
  getLeafs() {
    return [this];
  }
  getRandomLeaf() {
    return this;
  }
  getElemIn(box) {
    if (!box.sub(this.box).isEmpty)
      return [this.element];
    return [];
  }
  getElemNear() {
    return this.element;
  }
  interceptWithRay(ray) {
    return this.element.interceptWithRay(ray);
  }
}
var RCACHE = random(100);

// src/Geometry/Path.js
class Path {
  constructor({ name, positions, colors }) {
    this.name = name;
    this.colors = colors;
    this.positions = positions;
  }
  getBoundingBox() {
    if (this.boundingBox)
      return this.boundingBox;
    this.boundingBox = this.positions.reduce((box, x2) => box.add(new Box(x2, x2)), Box.EMPTY);
    return this.boundingBox;
  }
  distanceToPoint() {
    throw Error("No implementation");
  }
  normalToPoint() {
    throw Error("No implementation");
  }
  interceptWithRay(ray) {
    throw Error("No implementation");
  }
  asLines() {
    const lines = [];
    for (let i2 = 0;i2 < this.positions.length - 1; i2++) {
      lines.push(Line.builder().name(`${this.name}_${i2}_${i2 + 1}`).positions(this.positions[i2], this.positions[i2 + 1]).colors(this.colors[i2], this.colors[i2 + 1]).build());
    }
    return lines;
  }
  static builder() {
    return new PathBuilder;
  }
}

class PathBuilder {
  constructor() {
    this._name;
    this._colors;
    this._positions;
  }
  name(name) {
    this._name = name;
    return this;
  }
  positions(positions = []) {
    this._positions = positions;
    return this;
  }
  colors(colors = []) {
    this._colors = colors;
    return this;
  }
  build() {
    const attrs = {
      name: this._name,
      colors: this._colors,
      positions: this._positions
    };
    if (Object.values(attrs).some((x2) => x2 === undefined)) {
      throw new Error("Line is incomplete");
    }
    return new Path({ ...attrs });
  }
}

// src/Utils/SVG.js
var tokens = function(charStream) {
  let s2 = charStream;
  const tokensList = [];
  while (!s2.isEmpty()) {
    const maybeToken = parseToken(s2);
    if (!maybeToken)
      break;
    const { token, nextStream } = maybeToken;
    tokensList.push(token);
    s2 = nextStream;
  }
  return stream(tokensList);
};
var streamIncludes = function(charStream, string) {
  let s2 = charStream;
  let i2 = 0;
  while (!s2.isEmpty() && i2 < string.length) {
    if (string[i2++] !== s2.head())
      return false;
    s2 = s2.tail();
  }
  return true;
};
var parseToken = function(charStream) {
  const TOKENS_PARSER = TOKEN_SYMBOLS.map((s2) => () => symbolParser(s2)(charStream));
  return or(...TOKENS_PARSER, () => defaultToken(charStream));
};
var symbolParser = function(symbol) {
  return (charStream) => {
    let s2 = charStream;
    let i2 = 0;
    while (!s2.isEmpty() && i2 < symbol.length) {
      if (symbol[i2] !== s2.head())
        throw new Error("Fail to parse symbol");
      s2 = s2.tail();
      i2++;
    }
    return { token: { type: symbol, text: symbol }, nextStream: s2 };
  };
};
var parseSVG = function(stream) {
  return or(() => {
    const { left: StartTag, right: nextStream1 } = parseStartTag(stream);
    const { left: InnerSVG, right: nextStream2 } = parseInnerSVG(nextStream1);
    const { left: EndTag, right: nextStream3 } = parseEndTag(eatSpacesTabsAndNewLines(nextStream2));
    return pair({ type: "svg", StartTag, InnerSVG, EndTag }, nextStream3);
  }, () => {
    const { left: EmptyTag, right: nextStream } = parseEmptyTag(stream);
    return pair({ type: "svg", EmptyTag }, nextStream);
  }, () => {
    const { left: CommentTag, right: nextStream } = parseCommentTag(stream);
    return pair({ type: "svg", CommentTag }, nextStream);
  });
};
var parseValue = function(stream) {
  const { left: AnyBut, right: nextStream } = parseAnyBut((t) => t.type === "<" || t.type === "</")(eatSpacesTabsAndNewLines(stream));
  return pair({ type: "value", text: AnyBut.text }, nextStream);
};
var parseSVGTypes = function(stream) {
  return or(() => {
    const cleanStream = eatSpacesTabsAndNewLines(stream);
    const { left: SVG, right: nextStream } = parseSVG(cleanStream);
    return pair({ type: "svgTypes", SVG }, nextStream);
  }, () => {
    const { left: Value, right: nextStream } = parseValue(stream);
    if (Value.text === "")
      throw Error("Fail to parse SVGType");
    return pair({ type: "svgTypes", Value }, nextStream);
  });
};
var parseInnerSVG = function(stream) {
  return or(() => {
    const { left: SVGTypes, right: nextStream } = parseSVGTypes(stream);
    const { left: InnerSVG, right: nextStream1 } = parseInnerSVG(nextStream);
    return pair({
      type: "innerSvg",
      innerSvgs: [SVGTypes, ...InnerSVG.innerSvgs]
    }, nextStream1);
  }, () => {
    return pair({
      type: "innerSvg",
      innerSvgs: []
    }, stream);
  });
};
var parseAnyBut = function(tokenPredicate) {
  return (stream) => {
    let nextStream = stream;
    const textArray = [];
    while (!nextStream.isEmpty() && !tokenPredicate(nextStream.head())) {
      textArray.push(nextStream.head().text);
      nextStream = nextStream.tail();
    }
    return pair({ type: "anyBut", text: textArray.join("") }, nextStream);
  };
};
var parseEndTag = function(stream) {
  const filteredStream = eatSpacesTabsAndNewLines(stream);
  const token = filteredStream.head();
  if (token.type === "</") {
    const nextStream1 = eatSpaces(filteredStream.tail());
    const { left: tagName, right: nextStream2 } = parseAlphaNumName(nextStream1);
    const nextStream3 = eatSpaces(nextStream2);
    if (nextStream3.head().type === ">") {
      return pair({ type: "endTag", tag: tagName.text }, nextStream3.tail());
    }
  }
  throw new Error("Fail to parse End Tag");
};
var parseEmptyTag = function(stream) {
  const token = stream.head();
  if (token.type === "<") {
    const nextStream1 = eatSpaces(stream.tail());
    const { left: tagName, right: nextStream2 } = parseAlphaNumName(nextStream1);
    const nextStream3 = eatSpacesTabsAndNewLines(nextStream2);
    const { left: Attrs, right: nextStream4 } = parseAttrs(nextStream3);
    const nextStream5 = eatSpacesTabsAndNewLines(nextStream4);
    if (nextStream5.head().type === "/>") {
      return pair({ type: "emptyTag", tag: tagName.text, Attrs }, nextStream5.tail());
    }
  }
  throw new Error("Fail to parse EmptyTag");
};
var parseCommentTag = function(stream) {
  if (stream.head().type === "<!--") {
    const nextStream = stream.tail();
    const { left: AnyBut, right: nextStream1 } = parseAnyBut((token) => token.type === "-->")(nextStream);
    if (AnyBut.text !== "")
      return pair({ type: "commentTag" }, nextStream1.tail());
  }
  throw new Error("Fail to parse CommentTag");
};
var parseStartTag = function(stream) {
  const token = stream.head();
  if (token.type === "<") {
    const nextStream1 = eatSpaces(stream.tail());
    const { left: tagName, right: nextStream2 } = parseAlphaNumName(nextStream1);
    const nextStream3 = eatSpacesTabsAndNewLines(nextStream2);
    const { left: Attrs, right: nextStream4 } = parseAttrs(nextStream3);
    const nextStream5 = eatSpacesTabsAndNewLines(nextStream4);
    if (nextStream5.head().type === ">") {
      return pair({ type: "startTag", tag: tagName.text, Attrs }, nextStream5.tail());
    }
  }
  throw new Error("Fail to parse StartTag");
};
var parseAlphaNumName = function(stream) {
  const token = stream.head();
  if (token.type === "text")
    return pair({ type: "alphaNumName", text: token.text }, stream.tail());
  throw new Error("Fail to parse AlphaNumName");
};
var parseAttr = function(stream) {
  return or(() => {
    const { left: AlphaNumName, right: nextStream1 } = parseAlphaNumName(stream);
    if (nextStream1.head().type === "=" && (nextStream1.tail().head().type === "\"" || nextStream1.tail().head().type === "'")) {
      const tokenType = nextStream1.tail().head().type;
      const { left: AnyBut, right: nextStream2 } = parseAnyBut((token) => tokenType === token.type)(nextStream1.tail().tail());
      return pair({
        type: "attr",
        attributeName: AlphaNumName.text,
        attributeValue: AnyBut.text
      }, nextStream2.tail());
    }
  }, () => {
    const { left: AlphaNumName, right: nextStream1 } = parseAlphaNumName(stream);
    return pair({
      type: "attr",
      attributeName: AlphaNumName.text,
      attributeValue: '"true"'
    }, nextStream1);
  });
};
var parseAttrs = function(stream) {
  return or(() => {
    const { left: Attr, right: nextStream } = parseAttr(stream);
    const nextStreamNoSpaces = eatSpacesTabsAndNewLines(nextStream);
    const { left: Attrs, right: nextStream1 } = parseAttrs(nextStreamNoSpaces);
    return pair({
      type: "attrs",
      attributes: [Attr, ...Attrs.attributes]
    }, nextStream1);
  }, () => {
    return pair({
      type: "attrs",
      attributes: []
    }, stream);
  });
};
var eatSpaces = function(stream) {
  let s2 = stream;
  while (!s2.isEmpty()) {
    if (s2.head().type !== " ")
      break;
    s2 = s2.tail();
  }
  return s2;
};
var eatSpacesTabsAndNewLines = function(stream) {
  let s2 = stream;
  while (!s2.isEmpty()) {
    const symbol = s2.head().type;
    if (symbol !== " " && symbol !== "\t" && symbol !== "\n")
      break;
    s2 = s2.tail();
  }
  return s2;
};
var pair = function(a2, b2) {
  return { left: a2, right: b2 };
};
var or = function(...rules) {
  let accError = null;
  for (let i2 = 0;i2 < rules.length; i2++) {
    try {
      return rules[i2]();
    } catch (error) {
      accError = error;
    }
  }
  throw accError;
};
var stream = function(stringOrArray) {
  const array = [...stringOrArray];
  return {
    head: () => array[0],
    tail: () => stream(array.slice(1)),
    take: (n) => stream(array.slice(n)),
    isEmpty: () => array.length === 0,
    toString: () => array.map((s2) => typeof s2 === "string" ? s2 : JSON.stringify(s2)).join(""),
    filter: (predicate) => stream(array.filter(predicate)),
    log: () => {
      let s2 = stream(array);
      while (!s2.isEmpty()) {
        console.log(s2.head());
        s2 = s2.tail();
      }
    }
  };
};
function parse(text) {
  const { left: SVG } = parseSVG(eatSpacesTabsAndNewLines(tokens(stream(text))));
  return SVG;
}
var TOKEN_SYMBOLS = [
  "<!--",
  "-->",
  "\n",
  "\t",
  " ",
  "</",
  "/>",
  "<",
  ">",
  "=",
  '"',
  "'"
];
var defaultToken = (charStream) => {
  let s2 = charStream;
  let stringStack = [];
  while (!s2.isEmpty()) {
    const char = s2.head();
    if (TOKEN_SYMBOLS.some((symbol) => streamIncludes(s2, symbol)))
      break;
    stringStack.push(char);
    s2 = s2.tail();
  }
  if (stringStack.length)
    return { token: { type: "text", text: stringStack.join("") }, nextStream: s2 };
  throw new Error("Fail to parse default token");
};
// src/Utils/Monads.js
function some(x2) {
  const object = {
    map: (f2) => maybe(f2(x2)),
    filter: (f2) => f2(x2) ? object : none(),
    orElse: () => x2,
    forEach: (f2) => f2(x2),
    flatMap: (f2) => f2(x2),
    isSome: () => true
  };
  return object;
}
function none() {
  const object = {
    map: () => object,
    filter: () => object,
    orElse: (f2 = () => {
    }) => f2(),
    forEach: () => {
    },
    flatMap: () => object,
    isSome: () => false
  };
  return object;
}
function maybe(x2) {
  if (x2) {
    return some(x2);
  }
  return none(x2);
}
export {
  some,
  smin,
  randomPointInSphere,
  parse as parseSVG,
  none,
  mod,
  memoize,
  measureTimeWithResult,
  measureTimeWithAsyncResult,
  measureTime,
  maybe,
  loop,
  lerp,
  hashStr,
  groupBy,
  fRandom,
  clamp,
  argmin,
  VoxelScene,
  Vec3,
  Vec2,
  Vec,
  Triangle,
  Stream,
  Sphere_default as Sphere,
  Scene,
  Ray,
  RandomScene,
  RAD2DEG,
  Path,
  NaiveScene,
  NUMBER_OF_CORES,
  Metallic,
  Mesh,
  MAX_8BIT,
  MATERIALS,
  Line,
  KScene,
  IS_NODE,
  Diffuse,
  DiElectric,
  DomBuilder_default as DOM,
  Color,
  Canvas,
  Camera,
  Box,
  BScene,
  Alpha
};
