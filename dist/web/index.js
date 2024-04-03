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

// src/Stream/Stream.js
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

// src/Animation/Animation.js
class Animation {
  constructor(state, next, doWhile) {
    this.animation = new Stream(state, next);
    this.while = doWhile;
    this.requestAnimeId = null;
  }
  play(stream = this.animation) {
    const timeout = typeof window === "undefined" ? setTimeout : requestAnimationFrame;
    this.requestAnimeId = timeout(() => {
      if (!this.while(stream.head))
        return this.stop();
      this.play(stream.tail);
    });
    Animation.globalAnimationIds.push(this.requestAnimeId);
    return this;
  }
  stop() {
    const cancel = typeof window === "undefined" ? clearTimeout : cancelAnimationFrame;
    cancel(this.requestAnimeId);
    return this;
  }
  static globalAnimationIds = [];
  static builder() {
    return new AnimationBuilder;
  }
}

class AnimationBuilder {
  constructor() {
    this._state = {};
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

// src/Vector/Vector.js
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
var BUILD_VEC = (n) => new Float64Array(n);
var COPY_VEC = (array) => Float64Array.from(array);
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
  cross(v) {
    const u = this;
    return Vec3(u.y * v.z - u.z * v.y, u.z * v.x - u.x * v.z, u.x * v.y - u.y * v.x);
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
  cross(v) {
    const u = this;
    return u.x * v.y - u.y * v.x;
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

// src/Utils/Constants.js
var MAX_8BIT = 256;
var UNIT_BOX_VERTEX2 = [
  Vec3(),
  Vec3(1, 0, 0),
  Vec3(1, 1, 0),
  Vec3(0, 1, 0),
  Vec3(0, 0, 1),
  Vec3(1, 0, 1),
  Vec3(1, 1, 1),
  Vec3(0, 1, 1)
];

// src/Utils/Math.js
function smin(a, b, k = 32) {
  const res = Math.exp(-k * a) + Math.exp(-k * b);
  return -Math.log(res) / k;
}
function mod(n, m) {
  return (n % m + m) % m;
}
function clamp(min = 0, max = 1) {
  return (x) => Math.max(min, Math.min(max, x));
}
function lerp(a, b) {
  if (typeof a === "number" && typeof b === "number")
    return (t) => a + (b - a) * t;
  return (t) => a.scale(1 - t).add(b.scale(t));
}
function isInsideConvex(positions) {
  const m = positions.length;
  const v = [];
  const n = [];
  for (let i = 0;i < m; i++) {
    const p1 = positions[(i + 1) % m];
    const p0 = positions[i];
    v[i] = p1.sub(p0);
    n[i] = Vec2(-v[i].y, v[i].x);
  }
  const orientation = v[0].x * v[1].y - v[0].y * v[1].x >= 0 ? 1 : -1;
  return (x) => {
    for (let i = 0;i < m; i++) {
      const r = x.sub(positions[i]);
      const myDot = r.dot(n[i]) * orientation;
      if (myDot < 0)
        return false;
    }
    return true;
  };
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
function randomPointInSphere(dim) {
  let randomInSphere;
  while (true) {
    const random = Vec.RANDOM(dim).map((x) => 2 * x - 1);
    if (random.squareLength() >= 1)
      continue;
    randomInSphere = random.normalize();
    break;
  }
  return randomInSphere;
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
      const solution = solveLowTriMatrix(v, -d.y, s.sub(start));
      solution !== undefined && intersectionSolutions.push(solution);
    } else {
      const solution = solveUpTriMatrix(v, -d.x, s.sub(start));
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
var solveLowTriMatrix = function(v, a, f) {
  const v1 = v.x;
  const v2 = v.y;
  const av1 = a * v1;
  if (av1 === 0 || v1 === 0)
    return;
  const f1 = f.x;
  const f2 = f.y;
  return Vec2(f1 / v1, (f2 * v1 - v2 * f1) / av1);
};
var solveUpTriMatrix = function(v, a, f) {
  const v1 = v.x;
  const v2 = v.y;
  const av2 = a * v2;
  if (av2 === 0 || v2 === 0)
    return;
  const f1 = f.x;
  const f2 = f.y;
  return Vec2(f2 / v2, (f1 * v2 - v1 * f2) / av2);
};

// src/Color/Color.js
class Color {
  constructor(rbg) {
    const rgbClamp = clamp();
    this.rgb = rbg.map((c) => rgbClamp(c));
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
    return Color.ofRGB(r * this.red, r * this.green, r * this.blue);
  }
  mul(color) {
    return Color.ofRGB(this.rgb[0] * color.red, this.rgb[1] * color.green, this.rgb[2] * color.blue);
  }
  equals(color) {
    return this.rgb[0] === color.rgb[0] && this.rgb[1] === color.rgb[1] && this.rgb[2] === color.rgb[2];
  }
  toString() {
    return `red: ${this.red}, green: ${this.green}, blue: ${this.blue}`;
  }
  toGamma(alpha = 0.5) {
    const r = this.rgb[0] > 0 ? this.rgb[0] ** alpha : this.rgb[0];
    const g = this.rgb[1] > 0 ? this.rgb[1] ** alpha : this.rgb[1];
    const b = this.rgb[2] > 0 ? this.rgb[2] ** alpha : this.rgb[2];
    return Color.ofRGB(r, g, b);
  }
  static ofRGB(red = 0, green = 0, blue = 0) {
    const rgb = [];
    rgb[0] = red;
    rgb[1] = green;
    rgb[2] = blue;
    return new Color(rgb);
  }
  static ofRGBRaw(red = 0, green = 0, blue = 0) {
    const rgb = [];
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
  static GRAY = Color.ofRGB(0.5, 0.5, 0.5);
  static GREY = Color.ofRGB(0.5, 0.5, 0.5);
}

// src/Monads/Monads.js
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
    filter: (f) => f(x) ? object : none(),
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
    filter: () => object,
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

// src/Box/Box.js
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
    this.dim = min.dim;
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
    const isAllPositive = newDiag.fold((e, x) => e && x >= 0, true);
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
        return some([t, p]);
      }
      if (d > minT) {
        break;
      }
      minT = d;
    }
    return none();
  }
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
    const vectorCollision = () => !this.sub(new Box(box, box)).isEmpty;
    const type2action = {
      [Box.name]: () => !this.sub(box).isEmpty,
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
  sample() {
    return this.min.add(Vec.RANDOM(this.dim).mul(this.diagonal));
  }
  static EMPTY = new Box;
}

// src/Utils/Utils.js
var exports_Utils = {};
__export(exports_Utils, {
  shuffle: () => {
    {
      return shuffle;
    }
  },
  or: () => {
    {
      return or;
    }
  },
  memoize: () => {
    {
      return memoize;
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
  arrayIsEqual: () => {
    {
      return arrayIsEqual;
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
    const newCost = costFunction(array[i], i);
    if (newCost < cost) {
      cost = newCost;
      argminIndex = i;
    }
  }
  return argminIndex;
}
function shuffle(elements) {
  for (let i = elements.length - 1;i > 0; i--) {
    const r = Math.floor(Math.random() * (i + 1));
    const temp = elements[i];
    elements[i] = elements[r];
    elements[r] = temp;
  }
  return elements;
}
function arrayIsEqual(a, b) {
  if (a.length !== b.length)
    return false;
  for (let i = 0;i < a.length; i++) {
    if (a[i] !== b[i])
      return false;
  }
  return true;
}
function memoize(func) {
  const cache = {};
  return (...args) => {
    const key = JSON.stringify(args.map((x) => x.toString()));
    if (key in cache)
      return cache[key];
    const ans = func(...args);
    cache[key] = ans;
    return ans;
  };
}

// src/Canvas/Canvas.js
var drawConvexPolygon = function(canvas, positions, shader) {
  const { width, height } = canvas;
  const canvasBox = new Box(Vec2(), Vec2(width, height));
  let boundingBox = Box.EMPTY;
  positions.forEach((x) => {
    boundingBox = boundingBox.add(new Box(x, x));
  });
  const finalBox = canvasBox.intersection(boundingBox);
  if (finalBox.isEmpty)
    return canvas;
  const [xMin, yMin] = finalBox.min.toArray();
  const [xMax, yMax] = finalBox.max.toArray();
  const isInsideFunc = isInsideConvex(positions);
  for (let x = xMin;x < xMax; x++) {
    for (let y = yMin;y < yMax; y++) {
      if (isInsideFunc(Vec2(x, y))) {
        const j = x;
        const i = height - 1 - y;
        const color = shader(x, y);
        if (!color)
          continue;
        const index = 4 * (i * width + j);
        canvas._image[index] = color.red * MAX_8BIT;
        canvas._image[index + 1] = color.green * MAX_8BIT;
        canvas._image[index + 2] = color.blue * MAX_8BIT;
        canvas._image[index + 3] = MAX_8BIT;
      }
    }
  }
  return canvas;
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
      this._image[k] = color.red * MAX_8BIT;
      this._image[k + 1] = color.green * MAX_8BIT;
      this._image[k + 2] = color.blue * MAX_8BIT;
      this._image[k + 3] = MAX_8BIT;
    }
    return this.paint();
  }
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
        for (let k = _start_;k < _end_; k += 4) {
          const i = Math.floor(k / (4 * _width_));
          const j = Math.floor(k / 4 % _width_);
          const x = j;
          const y = _height_ - 1 - i;
          const color = lambda(x, y, { ..._vars_ });
          if (!color)
            return;
          image[index] = color.red;
          image[index + 1] = color.green;
          image[index + 2] = color.blue;
          image[index + 3] = 1;
          index += 4;
        }
        return { image, _start_, _end_, _worker_id_ };
      };
      const worker = createWorker(fun, lambda, dependencies);
      const workers = [...Array(N)].map(() => worker);
      const allWorkersDone = [...Array(N)].fill(false);
      workers.forEach((worker2, k) => {
        const ratio = Math.floor(n / N);
        worker2.postMessage({
          _start_: k * ratio,
          _end_: Math.min(n, (k + 1) * ratio) - 1,
          _width_: w,
          _height_: h,
          _worker_id_: k,
          _vars_: vars
        });
        worker2.onmessage = (event) => {
          const { image, _start_, _end_, _worker_id_ } = event.data;
          let index = 0;
          for (let i = _start_;i < _end_; i++) {
            this._image[i] = Math.floor(image[index] * MAX_8BIT);
            index++;
          }
          allWorkersDone[_worker_id_] = true;
          if (allWorkersDone.every((x) => x)) {
            return resolve(this.paint());
          }
        };
      });
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
  grid2canvas(i, j) {
    const h = this.height;
    const x = j;
    const y = h - 1 - i;
    return [x, y];
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
          continue;
        this._image[k] = this._image[k] + (color.red * MAX_8BIT - this._image[k]) / it;
        this._image[k + 1] = this._image[k + 1] + (color.green * MAX_8BIT - this._image[k + 1]) / it;
        this._image[k + 2] = this._image[k + 2] + (color.blue * MAX_8BIT - this._image[k + 2]) / it;
        this._image[k + 3] = MAX_8BIT;
      }
      if (it < time)
        it++;
      return this.paint();
    };
    return ans;
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
}
var createWorker = memoize((main, lambda, dependencies, worker_id) => {
  const workerFile = `
  ${clamp.toString()}
  ${Color.toString()}
  ${dependencies.map((d) => d.toString()).join("\n")}
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

// src/DomBuilder/DomBuilder.js
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

// src/Parallel/Parallel.js
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

// src/Ray/Ray.js
function Ray(init, dir) {
  const ans = {};
  ans.init = init;
  ans.dir = dir;
  ans.trace = (t) => init.add(dir.scale(t));
  return ans;
}

// src/Material/Material.js
function Diffuse() {
  return {
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
  return {
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
    scatter(inRay, point, element) {
      const p = point.sub(inRay.init);
      let t = undefined;
      if (inRay.dir.x !== 0)
        t = p.x / inRay.dir.x;
      if (inRay.dir.y !== 0)
        t = p.y / inRay.dir.y;
      if (inRay.dir.z !== 0)
        t = p.z / inRay.dir.z;
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

// src/Scene/Point.js
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
  const tM = Math.max(t1, t2);
  if (t1 * t2 < 0)
    return some(tM);
  return t1 >= 0 && t2 >= 0 ? some(t) : none();
};

class Point {
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
  distanceToPoint(p) {
    return this.position.sub(p).length() - this.radius;
  }
  normalToPoint(p) {
    const r = p.sub(this.position);
    const length = r.length();
    return length > this.radius ? r.normalize() : r.scale(-1).normalize();
  }
  interceptWith(ray) {
    const epsilon = 0.000000001;
    return sphereInterception(this, ray).map((t) => {
      const pointOnSphere = ray.trace(t - epsilon);
      return [t, pointOnSphere, this];
    });
  }
  getBoundingBox() {
    if (this.boundingBox)
      return this.boundingBox;
    const n = this.position.dim;
    this.boundingBox = new Box(this.position.add(Vec.ONES(n).scale(-this.radius)), this.position.add(Vec.ONES(n).scale(this.radius)));
    return this.boundingBox;
  }
  sample() {
    return randomPointInSphere(this.position.dim).scale(this.radius).add(this.position);
  }
  isInside(p) {
    return p.sub(this.position).length() < this.radius;
  }
  static builder() {
    return new PointBuilder;
  }
}

class PointBuilder {
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
    if (Object.values(attrs).some((x) => x === undefined)) {
      throw new Error("Point is incomplete");
    }
    return new Point({ ...attrs, texture: this._texture });
  }
}
var Point_default = Point;

// src/Scene/Line.js
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
  distanceToPoint(p) {
    const l = this.edge;
    const v = p.sub(this.positions[0]);
    const h = clamp()(l.dot(v) / l.dot(l));
    return p.sub(this.positions[0].add(l.scale(h))).length() - this.radius;
  }
  normalToPoint = (p) => {
    const epsilon = 0.001;
    const f = this.distanceToPoint(p);
    const sign = Math.sign(f);
    const grad = Vec3(this.distanceToPoint(p.add(Vec3(epsilon, 0, 0))) - f, this.distanceToPoint(p.add(Vec3(0, epsilon, 0))) - f, this.distanceToPoint(p.add(Vec3(0, 0, epsilon))) - f).normalize();
    return grad.scale(sign);
  };
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
        return some([p, this]);
      }
      if (d > minT) {
        break;
      }
      minT = d;
    }
    return none();
  }
  getBoundingBox() {
    if (this.boundingBox)
      return this.boundingBox;
    const size = Vec3(this.radius, this.radius, this.radius);
    this.boundingBox = this.positions.reduce((box, x) => box.add(new Box(x.sub(size), x.add(size))), Box.EMPTY);
    return this.boundingBox;
  }
  sample() {
    return this.edge.scale(Math.random());
  }
  isInside(p) {
    return this.distanceToPoint(p) < 0;
  }
  static builder() {
    return new LineBuilder;
  }
}
var indx = [1, 2];

class LineBuilder {
  constructor() {
    this._name;
    this._texture;
    this._radius = 1;
    this._normals = indx.map(() => Vec3());
    this._colors = indx.map(() => Color.BLACK);
    this._positions = indx.map(() => Vec3());
    this._texCoords = indx.map(() => Vec2());
    this._emissive = false;
    this._material = Diffuse();
  }
  name(name) {
    this._name = name;
    return this;
  }
  positions(v1, v2) {
    if ([v1, v2].some((x) => !x))
      return this;
    this._positions = [v1, v2];
    return this;
  }
  colors(c1, c2) {
    if ([c1, c2].some((x) => !x))
      return this;
    this._colors = [c1, c2];
    return this;
  }
  texCoords(t1, t2) {
    if ([t1, t2].some((x) => !x))
      return this;
    this._texCoords = [t1, t2];
    return this;
  }
  normals(n1, n2) {
    if ([n1, n2].some((x) => !x))
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
    if (Object.values(attrs).some((x) => x === undefined)) {
      throw new Error("Line is incomplete");
    }
    return new Line({ ...attrs, texture: this._texture });
  }
}

// src/Scene/Triangle.js
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
    for (let i = 0;i < n; i++) {
      this.edges.push(this.positions[(i + 1) % n].sub(this.positions[i]));
    }
    this.tangents = [this.edges[0], this.edges.at(-1).scale(-1)];
    const u = this.tangents[0];
    const v = this.tangents[1];
    this.faceNormal = u.cross(v).normalize();
  }
  distanceToPoint(p) {
    return Number.MAX_VALUE;
  }
  normalToPoint(p) {
    const r = p.sub(this.positions[0]);
    const dot = this.faceNormal.dot(r);
    return dot >= 0 ? this.faceNormal : this.faceNormal.scale(-1);
  }
  interceptWith(ray) {
    const epsilon = 0.000000001;
    const v = ray.dir;
    const p = ray.init.sub(this.positions[0]);
    const n = this.faceNormal;
    const t = -n.dot(p) / n.dot(v);
    if (t <= epsilon)
      return none();
    const x = ray.trace(t);
    for (let i = 0;i < this.positions.length; i++) {
      const xi = this.positions[i];
      const u = x.sub(xi);
      const ni = n.cross(this.edges[i]).normalize();
      const dot = ni.dot(u);
      if (dot <= epsilon)
        return none();
    }
    return some([t, x, this]);
  }
  getBoundingBox() {
    if (this.boundingBox)
      return this.boundingBox;
    this.boundingBox = this.positions.reduce((box, x) => box.add(new Box(x, x)), Box.EMPTY);
    return this.boundingBox;
  }
  sample() {
    return this.tangents[0].scale(Math.random()).add(this.tangents[1].scale(Math.random())).add(this.positions[0]);
  }
  isInside(p) {
    return this.faceNormal.dot(p.sub(this.positions[0])) >= 0;
  }
  static builder() {
    return new TriangleBuilder;
  }
}
var indx2 = [1, 2, 3];

class TriangleBuilder {
  constructor() {
    this._name;
    this._texture;
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
  positions(v1, v2, v3) {
    if ([v1, v2, v3].some((x) => !x))
      return this;
    this._positions = [v1, v2, v3];
    return this;
  }
  colors(c1, c2, c3) {
    if ([c1, c2, c3].some((x) => !x))
      return this;
    this._colors = [c1, c2, c3];
    return this;
  }
  texCoords(t1, t2, t3) {
    if ([t1, t2, t3].some((x) => !x))
      return this;
    this._texCoords = [t1, t2, t3];
    return this;
  }
  normals(n1, n2, n3) {
    if ([n1, n2, n3].some((x) => !x))
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
    if (Object.values(attrs).some((x) => x === undefined)) {
      throw new Error("Triangle is incomplete");
    }
    return new Triangle({ ...attrs, texture: this._texture });
  }
}

// src/Camera/Camera.js
var trace = function(ray, scene, options) {
  const { bounces } = options;
  if (bounces < 0)
    return Color.BLACK;
  return scene.interceptWith(ray).map((interception) => {
    const [, p, e] = interception;
    const color = e.color ?? e.colors[0];
    if (e.emissive)
      return color;
    const mat = e.material;
    let r = mat.scatter(ray, p, e);
    let finalC = trace(r, scene, { bounces: bounces - 1 });
    return color.mul(finalC);
  }).orElse(() => Color.BLACK);
};
var rasterPoint = function({ canvas, camera, elem, w, h, zBuffer }) {
  const point = elem;
  const { distanceToPlane } = camera;
  const { texCoord, texture, position, color, radius } = point;
  let pointInCamCoord = camera.toCameraCoord(position);
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
  const intRadius = Math.ceil(radius * (distanceToPlane / z) * w);
  let finalColor = color;
  if (texture && texCoord) {
    const texColor = getTexColor(texCoord, texture);
    finalColor = finalColor.add(texColor).scale(1 / 2);
  }
  for (let k = -intRadius;k < intRadius; k++) {
    for (let l = -intRadius;l < intRadius; l++) {
      const xl = Math.max(0, Math.min(w - 1, x + k));
      const yl = Math.floor(y + l);
      const [i, j] = canvas.canvas2grid(xl, yl);
      const zBufferIndex = Math.floor(w * i + j);
      if (z < zBuffer[zBufferIndex]) {
        zBuffer[zBufferIndex] = z;
        canvas.setPxl(xl, yl, finalColor);
      }
    }
  }
};
var rasterLine = function({ canvas, camera, elem, w, h, zBuffer, params }) {
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
  if (params.clipCameraPlane && outFrustum.length === 2)
    return;
  if (outFrustum.length === 1) {
    const inVertex = inFrustum[0];
    const outVertex = outFrustum[0];
    const inter = lineCameraPlaneIntersection(pointsInCamCoord[outVertex], pointsInCamCoord[inVertex], camera);
    pointsInCamCoord[outVertex] = inter;
  }
  const projectedPoints = pointsInCamCoord.map((p) => p.scale(distanceToPlane / p.z));
  const intPoints = projectedPoints.map((p) => {
    let x = w / 2 + p.x * w;
    let y = h / 2 + p.y * h;
    x = Math.floor(x);
    y = Math.floor(y);
    return Vec2(x, y);
  });
  const v = intPoints[1].sub(intPoints[0]);
  const vSquared = v.squareLength();
  const shader = (x, y) => {
    const p = Vec2(x, y).sub(intPoints[0]);
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
  canvas.drawLine(intPoints[0], intPoints[1], shader);
};
var rasterTriangle = function({ canvas, camera, elem, w, h, zBuffer, params }) {
  const triangleElem = elem;
  const { distanceToPlane } = camera;
  const { colors, positions, texCoords, texture } = triangleElem;
  const pointsInCamCoord = positions.map((p) => camera.toCameraCoord(p));
  if (params.cullBackFaces) {
    const du = pointsInCamCoord[1].sub(pointsInCamCoord[0]);
    const dv = pointsInCamCoord[2].sub(pointsInCamCoord[0]);
    const n = Vec3(du.y * dv.z - du.z * dv.y, du.x * dv.z - du.z * dv.x, du.x * dv.y - du.y * dv.x);
    const triangleDot = Vec3(0, 0, 1).dot(n);
    if (triangleDot < 0)
      return;
  }
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
  if (params.clipCameraPlane && outFrustum.length >= 1)
    return;
  const projectedPoints = pointsInCamCoord.map((p) => p.scale(distanceToPlane / p.z));
  const intPoints = projectedPoints.map((p) => {
    let x = w / 2 + p.x * w;
    let y = h / 2 + p.y * h;
    x = Math.floor(x);
    y = Math.floor(y);
    return Vec2(x, y);
  });
  const u = intPoints[1].sub(intPoints[0]);
  const v = intPoints[2].sub(intPoints[0]);
  const det = u.x * v.y - u.y * v.x;
  if (det === 0)
    return;
  const shader = (x, y) => {
    const p = Vec2(x, y).sub(intPoints[0]);
    const alpha = -(v.x * p.y - v.y * p.x) / det;
    const beta = (u.x * p.y - u.y * p.x) / det;
    const gamma = 1 - alpha - beta;
    const z = pointsInCamCoord[0].z * gamma + pointsInCamCoord[1].z * alpha + pointsInCamCoord[2].z * beta;
    let c = colors[0].scale(gamma).add(colors[1].scale(alpha)).add(colors[2].scale(beta));
    if (texture && texCoords && texCoords.length > 0 && !texCoords.some((x2) => x2 === undefined)) {
      const texUV = texCoords[0].scale(gamma).add(texCoords[1].scale(alpha)).add(texCoords[2].scale(beta));
      const texColor = params.bilinearTexture ? getBiLinearTexColor(texUV, texture) : getTexColor(texUV, texture);
      c = c.add(texColor).scale(1 / 2);
    }
    const [i, j] = canvas.canvas2grid(x, y);
    const zBufferIndex = Math.floor(w * i + j);
    if (z < zBuffer[zBufferIndex]) {
      zBuffer[zBufferIndex] = z;
      return c;
    }
  };
  canvas.drawTriangle(intPoints[0], intPoints[1], intPoints[2], shader);
};
var lineCameraPlaneIntersection = function(vertexOut, vertexIn, camera) {
  const { distanceToPlane } = camera;
  const v = vertexIn.sub(vertexOut);
  const alpha = (distanceToPlane - vertexOut.z) / v.z;
  const p = vertexOut.add(v.scale(alpha));
  return p;
};
var getBiLinearTexColor = function(texUV, texture) {
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
  const x = texInt.sub(texInt0);
  const bottomX = lerp(color0, color1)(x.x);
  const topX = lerp(color2, color3)(x.x);
  return lerp(bottomX, topX)(x.y);
};
var getTexColor = function(texUV, texture) {
  return texture.getPxl(texUV.x * texture.width, texUV.y * texture.height);
};

class Camera {
  constructor(props = {}) {
    const { sphericalCoords, focalPoint, distanceToPlane } = props;
    this.sphericalCoords = sphericalCoords ?? Vec3(2, 0, 0);
    this.focalPoint = focalPoint ?? Vec3(0, 0, 0);
    this.distanceToPlane = distanceToPlane ?? 1;
    this.orbit();
  }
  clone() {
    return new Camera({
      sphericalCoordinates: this.sphericalCoords,
      focalPoint: this.focalPoint,
      distanceToPlane: this.distanceToPlane
    });
  }
  orient() {
    const [, theta, phi] = this.sphericalCoords.toArray();
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
  orbit() {
    this.orient();
    const [rho, theta, phi] = this.sphericalCoords.toArray();
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    const cosP = Math.cos(phi);
    const sinP = Math.sin(phi);
    const sphereCoordinates = Vec3(rho * cosP * cosT, rho * cosP * sinT, rho * sinP);
    this.eye = sphereCoordinates.add(this.focalPoint);
    return this;
  }
  rayMap(lambdaWithRays, params) {
    return {
      to: (canvas) => {
        const w = canvas.width;
        const h = canvas.height;
        const ans = canvas.map((x, y) => {
          const dirInLocal = [
            x / w - 0.5,
            y / h - 0.5,
            1
          ];
          const dir = Vec3(this.basis[0].x * dirInLocal[0] + this.basis[1].x * dirInLocal[1] + this.basis[2].x * dirInLocal[2], this.basis[0].y * dirInLocal[0] + this.basis[1].y * dirInLocal[1] + this.basis[2].y * dirInLocal[2], this.basis[0].z * dirInLocal[0] + this.basis[1].z * dirInLocal[1] + this.basis[2].z * dirInLocal[2]).normalize();
          return lambdaWithRays(Ray(this.eye, dir), params);
        });
        return ans;
      }
    };
  }
  sceneShot(scene, params = {}) {
    let { samplesPerPxl, bounces, variance, gamma } = params;
    bounces = bounces ?? 10;
    variance = variance ?? 0.001;
    samplesPerPxl = samplesPerPxl ?? 1;
    gamma = gamma ?? 0.01;
    const lambda = (ray) => {
      let c = Color.BLACK;
      for (let i = 0;i < samplesPerPxl; i++) {
        const epsilon = Vec.RANDOM(3).scale(variance);
        const epsilonOrto = epsilon.sub(ray.dir.scale(epsilon.dot(ray.dir)));
        const r = Ray(ray.init, ray.dir.add(epsilonOrto).normalize());
        c = c.add(trace(r, scene, { bounces }));
      }
      return c.scale(1 / samplesPerPxl).toGamma(gamma);
    };
    return this.rayMap(lambda, params);
  }
  reverseShot(scene, params = {}) {
    const type2render = {
      [Point_default.name]: rasterPoint,
      [Line.name]: rasterLine,
      [Triangle.name]: rasterTriangle
    };
    const {
      cullBackFaces,
      bilinearTexture,
      clipCameraPlane,
      clearScreen
    } = params;
    params.cullBackFaces = cullBackFaces ?? true;
    params.bilinearTexture = bilinearTexture ?? false;
    params.clipCameraPlane = clipCameraPlane ?? true;
    params.clearScreen = clearScreen ?? true;
    return {
      to: (canvas) => {
        params.clearScreen && canvas.fill(Color.BLACK);
        const w = canvas.width;
        const h = canvas.height;
        const zBuffer = new Float64Array(w * h).fill(Number.MAX_VALUE);
        const elements = scene.getElements();
        for (let i = 0;i < elements.length; i++) {
          const elem = elements[i];
          if (elem.constructor.name in type2render) {
            type2render[elem.constructor.name]({
              w,
              h,
              elem,
              canvas,
              params,
              zBuffer,
              camera: this
            });
          }
        }
        canvas.paint();
        return canvas;
      }
    };
  }
  sdfShot(scene) {
    const lambda = (ray) => {
      const maxIte = 100;
      const epsilon = 0.000001;
      let p = ray.init;
      let t = scene.distanceToPoint(p);
      let minT = t;
      for (let i = 0;i < maxIte; i++) {
        p = ray.trace(t);
        const d = scene.distanceToPoint(p);
        t += d;
        if (d < epsilon) {
          const normal = scene.estimateNormal(p);
          return Color.ofRGB((normal.x + 1) / 2, (normal.y + 1) / 2, (normal.z + 1) / 2);
        }
        if (d > 2 * minT) {
          return Color.ofRGB(0, 0, i / maxIte);
        }
        minT = d;
      }
      return Color.BLACK;
    };
    return this.rayMap(lambda);
  }
  normalShot(scene, params = {}) {
    const lambda = (ray) => {
      return scene.interceptWith(ray).map(([, point, element]) => {
        const normal = element.normalToPoint(point);
        return Color.ofRGB((normal.get(0) + 1) / 2, (normal.get(1) + 1) / 2, (normal.get(2) + 1) / 2);
      }).orElse(() => {
        return Color.BLACK;
      });
    };
    return this.rayMap(lambda);
  }
  toCameraCoord(x) {
    let pointInCamCoord = x.sub(this.eye);
    pointInCamCoord = Vec3(this.basis[0].dot(pointInCamCoord), this.basis[1].dot(pointInCamCoord), this.basis[2].dot(pointInCamCoord));
    return pointInCamCoord;
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
      distance = Math.min(distance, elements[i].distanceToPoint(p));
    }
    return distance;
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
  getElementNear(p) {
    return this.sceneElements[argmin(this.sceneElements, (x) => x.distanceToPoint(p))];
  }
  debug(params) {
    return params.canvas;
  }
}

// src/PQueue/PQueue.js
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
  constructor(comparator = (a, b) => a - b) {
    this.data = [];
    this.comparator = comparator;
  }
  get length() {
    return this.data.length;
  }
  push(element) {
    this.data.push(element);
    if (this.data.length <= 1)
      return this;
    let i = this.data.length - 1;
    while (i > 0) {
      const parentIndex = i % 2 !== 0 ? Math.floor(i / 2) : i / 2 - 1;
      if (this.comparator(this.data[parentIndex], this.data[i]) <= 0)
        break;
      const temp = this.data[parentIndex];
      this.data[parentIndex] = this.data[i];
      this.data[i] = temp;
      i = parentIndex;
    }
    return this;
  }
  pop() {
    if (!this.data.length)
      return;
    const v = this.data[0];
    if (this.data.length <= 1)
      return v;
    this.data[0] = this.data[this.data.length - 1];
    this.data = this.data.slice(0, -1);
    this.data = heapifyBuilder(this.data, this.comparator)(0);
    return v;
  }
  static ofArray(array, comparator) {
    const queue = new PQueue(comparator);
    for (let i = 0;i < array.length; i++) {
      queue.push(array[i]);
    }
    return queue;
  }
}

// src/Utils/Utils3D.js
function drawBox({ box, color, debugScene }) {
  if (box.isEmpty)
    return;
  const vertices = UNIT_BOX_VERTEX3.map((v) => v.mul(box.diagonal).add(box.min));
  const lines = UNIT_BOX_FACES2.map(([i, j]) => Line.builder().name(`debug_box_${i}_${j}`).positions(vertices[i], vertices[j]).colors(color, color).build());
  debugScene.addList(lines);
  return debugScene;
}
var UNIT_BOX_VERTEX3 = [
  Vec3(),
  Vec3(1, 0, 0),
  Vec3(1, 1, 0),
  Vec3(0, 1, 0),
  Vec3(0, 0, 1),
  Vec3(1, 0, 1),
  Vec3(1, 1, 1),
  Vec3(0, 1, 1)
];
var UNIT_BOX_FACES2 = [
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

// src/Scene/Scene.js
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
  getElementInBox(box) {
    return this.boundingBoxScene.getElemIn(box);
  }
  interceptWith(ray, level) {
    return this.boundingBoxScene.interceptWith(ray, level);
  }
  distanceToPoint(p) {
    return this.getElementNear(p).distanceToPoint(p);
  }
  getElementNear(p) {
    if (this.boundingBoxScene.numberOfLeafs < 2) {
      return this.boundingBoxScene.getElemNear(p);
    }
    const initial = [this.boundingBoxScene.left, this.boundingBoxScene.right].map((x) => ({ node: x, distance: x.box.distanceToPoint(p) }));
    let stack = PQueue.ofArray(initial, (a, b) => a.distance - b.distance);
    while (stack.length) {
      const { node } = stack.pop();
      if (node.isLeaf)
        return node.getElemNear(p);
      const children = [node.left, node.right].filter((x) => x).map((x) => ({ node: x, distance: x.box.distanceToPoint(p) }));
      children.forEach((c) => stack.push(c));
    }
  }
  estimateNormal(p) {
    const epsilon = 0.000000001;
    const n = p.dim;
    const grad = [];
    const d = this.distanceToPoint(p);
    for (let i = 0;i < n; i++) {
      grad.push(this.distanceToPoint(p.add(Vec.e(n)(i).scale(epsilon))) - d);
    }
    return Vec.fromArray(grad).scale(Math.sign(d)).normalize();
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
      for (let i = 0;i <= maxLevels; i++)
        level2colors.push(Color.RED.scale(1 - i / maxLevels).add(Color.BLUE.scale(i / maxLevels)));
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
    let nodeOrLeafStack = this.sceneElements.map((x) => new Leaf(x));
    while (nodeOrLeafStack.length > 1) {
      const nodeOrLeaf = nodeOrLeafStack[0];
      nodeOrLeafStack = nodeOrLeafStack.slice(1);
      const minIndex = argmin(nodeOrLeafStack, (x) => nodeOrLeaf.box.distanceToBox(x.box));
      const newNode = nodeOrLeaf.join(nodeOrLeafStack[minIndex]);
      nodeOrLeafStack.splice(minIndex, 1);
      nodeOrLeafStack.push(newNode);
    }
    this.boundingBoxScene = nodeOrLeafStack.pop();
    return this;
  }
}

class Node {
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
      this.left = new Leaf(element);
    } else if (!this.right) {
      this.right = new Leaf(element);
    } else {
      this._addElementWhenTreeIsFull(element, elemBox);
    }
    return this;
  }
  interceptWith(ray) {
    return this.box.interceptWith(ray).flatMap(() => {
      const leftT = this.left.box.interceptWith(ray).map(([t]) => t).orElse(() => Number.MAX_VALUE);
      const rightT = this.right.box.interceptWith(ray).map(([t]) => t).orElse(() => Number.MAX_VALUE);
      if (leftT === Number.MAX_VALUE && rightT === Number.MAX_VALUE)
        return none();
      const first = leftT <= rightT ? this.left : this.right;
      const second = leftT > rightT ? this.left : this.right;
      const firstT = Math.min(leftT, rightT);
      const secondT = Math.max(leftT, rightT);
      return first.interceptWith(ray).map((hit) => {
        if (hit[0] > secondT) {
          const maybeHit = second.interceptWith(ray);
          if (maybeHit.filter((x) => x[0] < hit[0]).isSome())
            return maybeHit;
        }
        return some(hit);
      }).orElse(() => second.interceptWith(ray, secondT));
    });
  }
  distanceToPoint(p) {
    const children = [this.left, this.right].filter((x) => x);
    const index = argmin(children, (n) => n.box.center.sub(p).length());
    return children[index].distanceToPoint(p);
  }
  getElemNear(p) {
    const children = [this.left, this.right].filter((x) => x);
    const index = argmin(children, (n) => n.box.center.sub(p).length());
    return children[index].getElemNear(p);
  }
  getElemIn(box) {
    const children = [this.left, this.right].filter((x) => x);
    for (let i = 0;i < children.length; i++) {
      if (!children[i].box.sub(box).isEmpty) {
        return children[i].getElemIn(box);
      }
    }
  }
  getRandomLeaf() {
    return Math.random() < 0.5 ? this.left.getRandomLeaf() : this.right.getRandomLeaf();
  }
  join(nodeOrLeaf) {
    if (nodeOrLeaf.isLeaf)
      return this.add(nodeOrLeaf.element);
    const newNode = new Node;
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
    this.numberOfLeafs = 1;
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
  getElemIn(box) {
    if (!box.sub(this.box).isEmpty)
      return some(this.element);
    return none();
  }
  getElemNear() {
    return this.element;
  }
  interceptWith(ray) {
    return this.element.interceptWith(ray);
  }
  join(nodeOrLeaf) {
    if (nodeOrLeaf.isLeaf)
      return new Node().add(this.element).add(nodeOrLeaf.element);
    return nodeOrLeaf.join(this);
  }
}

// src/Scene/BScene.js
class BScene {
  constructor() {
    this.id2ElemMap = {};
    this.sceneElements = [];
    this.boundingBoxScene = new Node2;
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
    this.boundingBoxScene = new Node2;
  }
  getElements() {
    return this.sceneElements;
  }
  getElementInBox(box) {
    return this.boundingBoxScene.getElemIn(box);
  }
  getElementNear(p) {
    if (this.boundingBoxScene.numberOfLeafs < 2) {
      return this.boundingBoxScene.getElemNear(p);
    }
    const initial = [this.boundingBoxScene.left, this.boundingBoxScene.right].map((x) => ({ node: x, distance: x.box.distanceToPoint(p) }));
    let stack = PQueue.ofArray(initial, (a, b) => a.distance - b.distance);
    while (stack.length) {
      const { node } = stack.pop();
      if (node.isLeaf)
        return node.getElemNear(p);
      const children = [node.left, node.right].filter((x) => x).map((x) => ({ node: x, distance: x.box.distanceToPoint(p) }));
      children.forEach((c) => stack.push(c));
    }
  }
  interceptWith(ray, level) {
    return this.boundingBoxScene.interceptWith(ray, level);
  }
  distanceToPoint(p) {
    return this.getElementNear(p).distanceToPoint(p);
  }
  estimateNormal(p) {
    const epsilon = 0.000000001;
    const n = p.dim;
    const grad = [];
    const d = this.distanceToPoint(p);
    for (let i = 0;i < n; i++) {
      grad.push(this.distanceToPoint(p.add(Vec.e(n)(i).scale(epsilon))) - d);
    }
    return Vec.fromArray(grad).scale(Math.sign(d)).normalize();
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
      for (let i = 0;i <= maxLevels; i++)
        level2colors.push(Color.RED.scale(1 - i / maxLevels).add(Color.BLUE.scale(i / maxLevels)));
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
    let nodeOrLeafStack = this.sceneElements.map((x) => new Leaf2(x));
    while (nodeOrLeafStack.length > 1) {
      const nodeOrLeaf = nodeOrLeafStack[0];
      nodeOrLeafStack = nodeOrLeafStack.slice(1);
      const minIndex = argmin(nodeOrLeafStack, (x) => nodeOrLeaf.box.distanceToBox(x.box));
      const newNode = nodeOrLeaf.join(nodeOrLeafStack[minIndex]);
      nodeOrLeafStack.splice(minIndex, 1);
      nodeOrLeafStack.push(newNode);
    }
    this.boundingBoxScene = nodeOrLeafStack.pop();
    return this;
  }
}

class Node2 {
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
      this.left = new Leaf2(element);
    } else if (!this.right) {
      this.right = new Leaf2(element);
    } else {
      this._addElementWhenTreeIsFull(element, elemBox);
    }
    return this;
  }
  interceptWith(ray, depth = 1) {
    return this.box.interceptWith(ray).flatMap(() => {
      const children = [this.left, this.right].filter((x) => x);
      const hits = [];
      for (let i = 0;i < children.length; i++) {
        children[i].interceptWith(ray, depth + 1).forEach((hit) => hits.push(hit));
      }
      const minIndex = argmin(hits, ([t]) => t);
      if (minIndex === -1)
        return none();
      return some(hits[minIndex]);
    });
  }
  distanceToPoint(p) {
    const children = [this.left, this.right].filter((x) => x);
    const index = argmin(children, (n) => n.box.center.sub(p).length());
    return children[index].distanceToPoint(p);
  }
  getElemNear(p) {
    const children = [this.left, this.right].filter((x) => x);
    const index = argmin(children, (n) => n.box.center.sub(p).length());
    return children[index].getElemNear(p);
  }
  getElemIn(box) {
    let elements = [];
    const children = [this.left, this.right].filter((x) => x);
    for (let i = 0;i < children.length; i++) {
      if (!children[i].box.sub(box).isEmpty) {
        elements = elements.concat(children[i].getElemIn(box));
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
    const newNode = new Node2;
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
        this.left = new Node2().add(aux).add(element);
      if (minIndex === 1)
        this.right = new Node2().add(aux).add(element);
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
        this.left = new Node2;
        this.left.add(aux.element).add(element);
      },
      1: () => {
        const aux = this.right;
        this.right = new Node2;
        this.right.add(aux.element).add(element);
      },
      2: () => {
        const aux = this.left;
        this.left = new Node2;
        this.left.add(aux.element).add(this.right.element);
        this.right = new Leaf2(element);
      }
    };
    index2Action[index]();
  }
}

class Leaf2 {
  isLeaf = true;
  constructor(element) {
    this.element = element;
    this.box = element.getBoundingBox();
    this.numberOfLeafs = 1;
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
  getElemIn(box) {
    if (!box.sub(this.box).isEmpty)
      return [this.element];
    return [];
  }
  getElemNear() {
    return this.element;
  }
  interceptWith(ray) {
    return this.element.interceptWith(ray);
  }
  join(nodeOrLeaf) {
    if (nodeOrLeaf.isLeaf)
      return new Node2().add(this.element).add(nodeOrLeaf.element);
    return nodeOrLeaf.join(this);
  }
}

// src/Scene/KScene.js
var clusterLeafs = function(box, leafs, it = 10) {
  const clusters = [box.sample(), box.sample()];
  const clusterIndexes = [];
  for (let i = 0;i < it; i++) {
    for (let i2 = 0;i2 < clusters.length; i2++) {
      clusterIndexes[i2] = [];
    }
    for (let j = 0;j < leafs.length; j++) {
      const leafPosition = leafs[j].box.center;
      const kIndex = argmin(clusters, (c) => c.sub(leafPosition).squareLength());
      clusterIndexes[kIndex].push(j);
    }
    for (let j = 0;j < clusters.length; j++) {
      if (clusterIndexes[j].length === 0) {
        const dataPoints = clusterIndexes[(j + 1) % clusters.length];
        clusterIndexes[j].push(dataPoints[Math.floor(Math.random() * dataPoints.length)]);
      }
    }
    for (let j = 0;j < clusters.length; j++) {
      let acc = Vec.ZERO(box.dim);
      for (let k = 0;k < clusterIndexes[j].length; k++) {
        const leafPosition = leafs[clusterIndexes[j][k]].box.center;
        acc = acc.add(leafPosition);
      }
      clusters[j] = acc.scale(1 / clusterIndexes[j].length);
    }
  }
  return [...clusterIndexes].map((indxs) => indxs.map((indx3) => leafs[indx3]));
};
var leafsInterceptWith = function(leafs, ray) {
  let closestDistance = Number.MAX_VALUE;
  let closest = none();
  for (let i = 0;i < leafs.length; i++) {
    leafs[i].interceptWith(ray).map(([pos, normal]) => {
      const distance = ray.init.sub(pos).length();
      if (distance < closestDistance) {
        closest = some([pos, normal]);
        closestDistance = distance;
      }
    });
  }
  return closest;
};

class KScene {
  constructor(k = 10) {
    this.k = k;
    this.id2ElemMap = {};
    this.sceneElements = [];
    this.boundingBoxScene = new Node3(k);
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
    this.boundingBoxScene = new Node3(this.k);
  }
  getElements() {
    return this.sceneElements;
  }
  getElementInBox(box) {
    return this.boundingBoxScene.getElemIn(box);
  }
  getElementNear(p) {
    if (this.boundingBoxScene.leafs.length > 0) {
      return this.boundingBoxScene.getElemNear(p);
    }
    const initial = [this.boundingBoxScene.left, this.boundingBoxScene.right].map((x) => ({ node: x, distance: x.box.distanceToPoint(p) }));
    let stack = PQueue.ofArray(initial, (a, b) => a.distance - b.distance);
    while (stack.length) {
      const { leaf, node } = stack.pop();
      if (leaf)
        return leaf.getElemNear(p);
      if (node.leafs.length > 0) {
        for (let i = 0;i < node.leafs.length; i++) {
          const leaf2 = node.leafs[i];
          stack.push({ leaf: leaf2, distance: leaf2.box.distanceToPoint(p) });
        }
      }
      const children = [node.left, node.right].filter((x) => x).map((x) => ({ node: x, distance: x.box.distanceToPoint(p) }));
      children.forEach((c) => stack.push(c));
    }
  }
  interceptWith(ray, level) {
    return this.boundingBoxScene.interceptWith(ray, level);
  }
  distanceToPoint(p) {
    if (this.boundingBoxScene.leafs.length > 0) {
      let distance = Number.MAX_VALUE;
      const leafs = this.boundingBoxScene.leafs;
      for (let i = 0;i < leafs.length; i++) {
        distance = Math.min(distance, leafs[i].element.distanceToPoint(p));
      }
      return distance;
    }
    return this.getElementNear(p).distanceToPoint(p);
  }
  estimateNormal(p) {
    const epsilon = 0.000000001;
    const n = p.dim;
    const grad = [];
    const d = this.distanceToPoint(p);
    for (let i = 0;i < n; i++) {
      grad.push(this.distanceToPoint(p.add(Vec.e(n)(i).scale(epsilon))) - d);
    }
    return Vec.fromArray(grad).scale(Math.sign(d)).normalize();
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
      for (let i = 0;i <= maxLevels; i++)
        level2colors.push(Color.RED.scale(1 - i / maxLevels).add(Color.BLUE.scale(i / maxLevels)));
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
    let groupsStack = clusterLeafs(this.boundingBoxScene.box, this.sceneElements.map((x) => new Leaf3(x)));
    while (groupsStack.map((x) => x.length > this.k).some((x) => x)) {
      const groupOfLeafs = groupsStack.pop();
      if (groupOfLeafs.length > this.k) {
        const box = groupOfLeafs.reduce((e, x) => e.add(x.box), new Box);
        const [left, right] = clusterLeafs(box, groupOfLeafs);
        groupsStack.push(left);
        groupsStack.push(right);
      }
    }
    let nodeOrLeafStack = groupsStack.map((group) => group.reduce((e, x) => e.add(x.element), new Node3(this.k)));
    while (nodeOrLeafStack.length > 1) {
      const nodeOrLeaf = nodeOrLeafStack[0];
      nodeOrLeafStack = nodeOrLeafStack.slice(1);
      const minIndex = argmin(nodeOrLeafStack, (x) => nodeOrLeaf.box.distanceToBox(x.box));
      const newNode = nodeOrLeaf.join(nodeOrLeafStack[minIndex]);
      nodeOrLeafStack.splice(minIndex, 1);
      nodeOrLeafStack.push(newNode);
    }
    this.boundingBoxScene = nodeOrLeafStack.pop();
    return this;
  }
}

class Node3 {
  isLeaf = false;
  numberOfLeafs = 0;
  constructor(k) {
    this.k = k;
    this.box = Box.EMPTY;
    this.leafs = [];
  }
  add(element) {
    this.numberOfLeafs += 1;
    const elemBox = element.getBoundingBox();
    this.box = this.box.add(elemBox);
    if (!this.left && !this.right) {
      this.leafs.push(new Leaf3(element));
      if (this.leafs.length < this.k)
        return this;
      const [lefts, rights] = clusterLeafs(this.box, this.leafs);
      this.left = new Node3(this.k).addList(lefts.map((x) => x.element));
      this.right = new Node3(this.k).addList(rights.map((x) => x.element));
      this.leafs = [];
    } else {
      const children = [this.left, this.right];
      const index = argmin(children, (x) => element.boundingBox.distanceToBox(x.box));
      children[index].add(element);
    }
    return this;
  }
  addList(elements) {
    for (let i = 0;i < elements.length; i++) {
      this.add(elements[i]);
    }
    return this;
  }
  interceptWith(ray, depth = 1) {
    if (this.leafs.length > 0) {
      return leafsInterceptWith(this.leafs, ray);
    }
    return this.box.interceptWith(ray).flatMap(() => {
      const children = [this.left, this.right];
      const hits = [];
      for (let i = 0;i < children.length; i++) {
        children[i].interceptWith(ray, depth + 1).forEach((hit) => hits.push(hit));
      }
      const minIndex = argmin(hits, ([point]) => point.sub(ray.init).length());
      if (minIndex === -1)
        return none();
      return some(hits[minIndex]);
    });
  }
  distanceToPoint(p) {
    return this.getElemNear(p).distanceToPoint(p);
  }
  getElemNear(p) {
    if (this.leafs.length > 0) {
      const minIndex = argmin(this.leafs, (x) => x.distanceToPoint(p));
      return this.leafs[minIndex].element;
    }
    const children = [this.left, this.right];
    const index = argmin(children, (n) => n.box.center.sub(p).length());
    return children[index].getElemNear(p);
  }
  getElemIn(box) {
    let elements = [];
    if (this.leafs.length > 0) {
      this.leafs.forEach((leaf) => !leaf.box.sub(box).isEmpty && elements.push(leaf.element));
      return elements;
    }
    const children = [this.left, this.right];
    for (let i = 0;i < children.length; i++) {
      if (!children[i].box.sub(box).isEmpty) {
        elements = elements.concat(children[i].getElemIn(box));
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
    const newNode = new Node3(this.k);
    newNode.left = this;
    newNode.right = nodeOrLeaf;
    newNode.box = this.box.add(nodeOrLeaf.box);
    newNode.numberOfLeafs = newNode.left.numberOfLeafs + newNode.right.numberOfLeafs;
    return newNode;
  }
}

class Leaf3 {
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
  getElemIn(box) {
    if (!box.sub(this.box).isEmpty)
      return [this.element];
    return [];
  }
  getElemNear() {
    return this.element;
  }
  interceptWith(ray) {
    return this.element.interceptWith(ray);
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
  hash(p) {
    const integerCoord = p.map((z) => Math.floor(z / this.gridSpace));
    const h = integerCoord.x * 92837111 ^ integerCoord.y * 689287499 ^ integerCoord.z * 283923481;
    return Math.abs(h);
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
      const binary = [0, 1];
      const n = binary.length ** 3;
      const powers = [binary.length ** 2, binary.length];
      const pivot = elem.getBoundingBox().min;
      const points = [];
      for (let k = 0;k < n; k++) {
        const i0 = Math.floor(k / powers[0]);
        const i1 = Math.floor(k / powers[1]) % powers[1];
        const i2 = k % powers[1];
        points.push(pivot.add(Vec3(i0, i1, i2).mul(elem.getBoundingBox().diagonal)));
      }
      points.forEach((p) => {
        const h = this.hash(p);
        if (!(h in this.gridMap)) {
          this.gridMap[h] = {};
        }
        let cell = this.gridMap[h];
        cell[elem.name] = elem;
      });
    }
    return this;
  }
  clear() {
    this.id2ElemMap = {};
    this.sceneElements = [];
    this.gridMap = {};
  }
  getElements() {
    return this.sceneElements;
  }
  getElementInBox(box) {
  }
  getElementNear(p) {
  }
  interceptWith(ray) {
    const maxDist = 10;
    const maxIte = maxDist / this.gridSpace;
    let t = 0;
    let elements = [];
    for (let n = 0;n < maxIte; n++) {
      let p = ray.trace(t);
      const newElements = Object.values(this.gridMap[this.hash(p)] || {});
      if (newElements?.length) {
        elements = elements.concat(newElements);
      }
      t += this.gridSpace;
    }
    if (elements?.length) {
      let closestDistance = Number.MAX_VALUE;
      let closest = none();
      for (let i = 0;i < elements.length; i++) {
        elements[i].interceptWith(ray).map(([pos, normal]) => {
          const distance = ray.init.sub(pos).length();
          if (distance < closestDistance) {
            closest = some([pos, normal]);
            closestDistance = distance;
          }
        });
      }
      return closest;
    }
    return none();
  }
  distanceToPoint(p) {
  }
  estimateNormal(p) {
    const epsilon = 0.000000001;
    const n = p.dim;
    const grad = [];
    const d = this.distanceToPoint(p);
    for (let i = 0;i < n; i++) {
      grad.push(this.distanceToPoint(p.add(Vec.e(n)(i).scale(epsilon))) - d);
    }
    return Vec.fromArray(grad).scale(Math.sign(d)).normalize();
  }
  debug(props) {
    const { camera, canvas } = props;
    const debugScene = new NaiveScene;
    Object.keys(this.gridMap).forEach((k) => {
      const elemsMap = this.gridMap[k] || {};
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
  rebuild() {
    return this;
  }
}

// src/Scene/RandomScene.js
var clusterLeafs2 = function(box, leafs, it = 10) {
  const clusters = [box.sample(), box.sample()];
  const clusterIndexes = [];
  for (let i = 0;i < it; i++) {
    for (let i2 = 0;i2 < clusters.length; i2++) {
      clusterIndexes[i2] = [];
    }
    for (let j = 0;j < leafs.length; j++) {
      const leafPosition = leafs[j].box.center;
      const kIndex = argmin(clusters, (c) => c.sub(leafPosition).squareLength());
      clusterIndexes[kIndex].push(j);
    }
    for (let j = 0;j < clusters.length; j++) {
      if (clusterIndexes[j].length === 0) {
        const dataPoints = clusterIndexes[(j + 1) % clusters.length];
        clusterIndexes[j].push(dataPoints[Math.floor(Math.random() * dataPoints.length)]);
      }
    }
    for (let j = 0;j < clusters.length; j++) {
      let acc = Vec.ZERO(box.dim);
      for (let k = 0;k < clusterIndexes[j].length; k++) {
        const leafPosition = leafs[clusterIndexes[j][k]].box.center;
        acc = acc.add(leafPosition);
      }
      clusters[j] = acc.scale(1 / clusterIndexes[j].length);
    }
  }
  return [...clusterIndexes].map((indxs) => indxs.map((indx3) => leafs[indx3]));
};
var random = function(n) {
  let index = 0;
  const numbers = new Float64Array(n).map(() => Math.random());
  return () => numbers[index++ % n];
};
var leafsInterceptWith2 = function(leafs, ray) {
  let closestDistance = Number.MAX_VALUE;
  let closest = none();
  for (let i = 0;i < leafs.length; i++) {
    leafs[i].interceptWith(ray).map(([pos, normal]) => {
      const distance = ray.init.sub(pos).length();
      if (distance < closestDistance) {
        closest = some([pos, normal]);
        closestDistance = distance;
      }
    });
  }
  return closest;
};

class RandomScene {
  constructor(k = 10) {
    this.k = k;
    this.id2ElemMap = {};
    this.sceneElements = [];
    this.boundingBoxScene = new Node4(k);
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
    this.boundingBoxScene = new Node4(this.k);
  }
  getElements() {
    return this.sceneElements;
  }
  getElementInBox(box) {
    return this.boundingBoxScene.getElemIn(box);
  }
  getElementNear(p) {
    return this.boundingBoxScene.getElemNear(p);
  }
  interceptWith(ray, level) {
    return this.boundingBoxScene.interceptWith(ray, level);
  }
  distanceToPoint(p) {
    if (this.boundingBoxScene.leafs.length > 0) {
      let distance = Number.MAX_VALUE;
      const leafs = this.boundingBoxScene.leafs;
      for (let i = 0;i < leafs.length; i++) {
        distance = Math.min(distance, leafs[i].element.distanceToPoint(p));
      }
      return distance;
    }
    return this.getElementNear(p).distanceToPoint(p);
  }
  estimateNormal(p) {
    const epsilon = 0.000000001;
    const n = p.dim;
    const grad = [];
    const d = this.distanceToPoint(p);
    for (let i = 0;i < n; i++) {
      grad.push(this.distanceToPoint(p.add(Vec.e(n)(i).scale(epsilon))) - d);
    }
    return Vec.fromArray(grad).scale(Math.sign(d)).normalize();
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
      for (let i = 0;i <= maxLevels; i++)
        level2colors.push(Color.RED.scale(1 - i / maxLevels).add(Color.BLUE.scale(i / maxLevels)));
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
    let groupsStack = clusterLeafs2(this.boundingBoxScene.box, this.sceneElements.map((x) => new Leaf4(x)));
    while (groupsStack.map((x) => x.length > this.k).some((x) => x)) {
      const groupOfLeafs = groupsStack.pop();
      if (groupOfLeafs.length > this.k) {
        const box = groupOfLeafs.reduce((e, x) => e.add(x.box), new Box);
        const [left, right] = clusterLeafs2(box, groupOfLeafs);
        groupsStack.push(left);
        groupsStack.push(right);
      }
    }
    let nodeOrLeafStack = groupsStack.map((group) => group.reduce((e, x) => e.add(x.element), new Node4(this.k)));
    while (nodeOrLeafStack.length > 1) {
      const nodeOrLeaf = nodeOrLeafStack[0];
      nodeOrLeafStack = nodeOrLeafStack.slice(1);
      const minIndex = argmin(nodeOrLeafStack, (x) => nodeOrLeaf.box.distanceToBox(x.box));
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
  constructor(k) {
    this.k = k;
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
      const [lefts, rights] = clusterLeafs2(this.box, this.leafs);
      this.left = new Node4(this.k).addList(lefts.map((x) => x.element));
      this.right = new Node4(this.k).addList(rights.map((x) => x.element));
      this.leafs = [];
    } else {
      const children = [this.left, this.right];
      const index = argmin(children, (x) => element.boundingBox.distanceToBox(x.box));
      children[index].add(element);
    }
    return this;
  }
  addList(elements) {
    for (let i = 0;i < elements.length; i++) {
      this.add(elements[i]);
    }
    return this;
  }
  interceptWith(ray, depth = 1) {
    if (this.leafs.length > 0) {
      return leafsInterceptWith2(this.leafs, ray);
    }
    return this.box.interceptWith(ray).flatMap(() => {
      const children = [this.left, this.right];
      const hits = [];
      for (let i = 0;i < children.length; i++) {
        children[i].interceptWith(ray, depth + 1).forEach((hit) => hits.push(hit));
      }
      const minIndex = argmin(hits, ([point]) => point.sub(ray.init).length());
      if (minIndex === -1)
        return none();
      return some(hits[minIndex]);
    });
  }
  distanceToPoint(p) {
    return this.getElemNear(p).distanceToPoint(p);
  }
  getElemNear(p) {
    if (this.leafs.length > 0) {
      const minIndex = argmin(this.leafs, (x) => x.distanceToPoint(p));
      return this.leafs[minIndex].element;
    }
    const children = [this.left, this.right];
    const index = argmin(children, (n) => n.box.center.sub(p).length());
    const coin = RCACHE() < 0.01 ? 1 : 0;
    return children[(index + coin) % 2].getElemNear(p);
  }
  getElemIn(box) {
    let elements = [];
    if (this.leafs.length > 0) {
      this.leafs.forEach((leaf) => !leaf.box.sub(box).isEmpty && elements.push(leaf.element));
      return elements;
    }
    const children = [this.left, this.right];
    for (let i = 0;i < children.length; i++) {
      if (!children[i].box.sub(box).isEmpty) {
        elements = elements.concat(children[i].getElemIn(box));
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
  distanceToPoint(x) {
    return this.element.distanceToPoint(x);
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
  interceptWith(ray) {
    return this.element.interceptWith(ray);
  }
}
var RCACHE = random(100);

// src/Scene/Path.js
class Path {
  constructor({ name, positions, colors }) {
    this.name = name;
    this.colors = colors;
    this.positions = positions;
  }
  getBoundingBox() {
    if (this.boundingBox)
      return this.boundingBox;
    this.boundingBox = this.positions.reduce((box, x) => box.add(new Box(x, x)), Box.EMPTY);
    return this.boundingBox;
  }
  asLines() {
    const lines = [];
    for (let i = 0;i < this.positions.length - 1; i++) {
      lines.push(Line.builder().name(`${this.name}_${i}_${i + 1}`).positions(this.positions[i], this.positions[i + 1]).colors(this.colors[i], this.colors[i + 1]).build());
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
    if (Object.values(attrs).some((x) => x === undefined)) {
      throw new Error("Line is incomplete");
    }
    return new Path({ ...attrs });
  }
}

// src/Scene/Mesh.js
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
  const facesInfo = vertexInfo.flatMap((x) => x.split("/")).map((x) => Number.parseFloat(x));
  const length = facesInfo.length;
  const lengthDiv3 = Math.floor(length / 3);
  const group = groupBy(facesInfo, (_, i) => i % lengthDiv3);
  const face = { vertices: [], textures: [], normals: [] };
  Object.keys(group).map((k) => {
    k = Number.parseInt(k);
    const indices = group[k].map((x) => x - 1);
    if (k === 0)
      face.vertices = indices;
    if (k === 1)
      face.textures = indices;
    if (k === 2)
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
  setName(name) {
    this.name = name;
    return this;
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
    for (let i = 0;i < this.vertices.length; i++) {
      newColors.push(lambda(this.vertices[i]));
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
    for (let i = 0;i < this.faces.length; i++) {
      newMaterials.push(lambda(this.faces[i]));
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
  getBoundingBox() {
    if (this.boundingBox)
      return this.boundingBox;
    this.boundingBox = new Box;
    for (let i = 0;i < this.vertices.length; i++) {
      this.boundingBox = this.boundingBox.add(new Box(this.vertices[i].add(Vec3(1, 1, 1).scale(RADIUS)), this.vertices[i].add(Vec3(1, 1, 1).scale(RADIUS))));
    }
    return this.boundingBox;
  }
  asPoints(radius = RADIUS) {
    const points = {};
    for (let i = 0;i < this.faces.length; i++) {
      const texCoordIndexes = this.faces[i].textures;
      const normalIndexes = this.faces[i].normals;
      const verticesIndexes = this.faces[i].vertices;
      for (let j = 0;j < 3; j++) {
        const pointName = `${this.name}_${verticesIndexes[j]}`;
        if (!(pointName in points)) {
          points[pointName] = Point_default.builder().name(pointName).radius(radius).texture(this.texture).color(this.colors[verticesIndexes[j]]).normal(this.normals[normalIndexes[j]]).position(this.vertices[verticesIndexes[j]]).texCoord(this.textureCoords[texCoordIndexes[j]]).build();
        }
      }
    }
    return Object.values(points);
  }
  asLines() {
    const lines = {};
    for (let i = 0;i < this.faces.length; i++) {
      const indices = this.faces[i].vertices;
      for (let j = 0;j < indices.length; j++) {
        const vi = indices[j];
        const vj = indices[(j + 1) % indices.length];
        const edge_id = [vi, vj].sort().join("_");
        const edge_name = `${this.name}_${edge_id}`;
        lines[edge_id] = Line.builder().name(edge_name).positions(this.vertices[vi], this.vertices[vj]).colors(this.colors[vi], this.colors[vj]).build();
      }
    }
    return Object.values(lines);
  }
  asTriangles() {
    const triangles = [];
    for (let i = 0;i < this.faces.length; i++) {
      let texCoordIndexes = this.faces[i].textures;
      const normalIndexes = this.faces[i].normals;
      const verticesIndexes = this.faces[i].vertices;
      const material = this.materials?.[i] ?? Diffuse();
      const edge_id = verticesIndexes.join("_");
      const edge_name = `${this.name}_${edge_id}`;
      triangles.push(Triangle.builder().name(edge_name).texture(this.texture).colors(...verticesIndexes.map((j) => this.colors[j])).normals(...normalIndexes.map((j) => this.normals[j])).positions(...verticesIndexes.map((j) => this.vertices[j])).texCoords(...texCoordIndexes.map((j) => this.textureCoords[j])).material(material).build());
    }
    return Object.values(triangles);
  }
  static readObj(objFile, name = `Mesh_${MESH_COUNTER++}`) {
    const vertices = [];
    const normals = [];
    const textureCoords = [];
    const faces = [];
    const lines = objFile.split(/\n|\r/);
    for (let i = 0;i < lines.length; i++) {
      const line = lines[i];
      const spaces = line.split(" ").filter((x) => x !== "");
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
    return new Mesh({ name, vertices, faces: UNIT_BOX_FACES.map((indx3) => ({ vertices: indx3 })) });
  }
}
export {
  smin,
  randomPointInSphere,
  mod,
  lerp,
  isInsideConvex,
  clipLine,
  clamp,
  VoxelScene,
  Vec3,
  Vec2,
  Vec,
  exports_Utils as Utils,
  Triangle,
  Stream,
  Scene,
  Ray,
  RandomScene,
  Point_default as Point,
  Path,
  Parallel,
  NaiveScene,
  exports_Monads as Monads,
  Metallic,
  Mesh,
  Line,
  KScene,
  Diffuse,
  DiElectric,
  DomBuilder_default as DOM,
  Color,
  Canvas,
  Camera,
  Box,
  BScene,
  Animation,
  Alpha
};
