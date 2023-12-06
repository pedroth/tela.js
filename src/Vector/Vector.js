//========================================================================================
/*                                                                                      *
 *                                         UTILS                                        *
 *                                                                                      */
//========================================================================================

const ARRAY_TYPES = {
  Float32Array: Float32Array,
  Float64Array: Float64Array,
};
//stateful function
function _sanitize_input(arrayIn, arrayOut) {
  for (let i = 0; i < arrayIn.length; i++) {
    const z = arrayIn[i];
    const zIsNumber = z !== null && z !== undefined && typeof z === "number";
    arrayOut[i] = zIsNumber ? z : 0;
  }
  return arrayOut;
}

function sameSizeOrError(a, b) {
  if (a.n === b.n) {
    return true;
  }
  throw new VectorException("Vector must have same size");
}

//========================================================================================
/*                                                                                      *
 *                                        VECTOR                                        *
 *                                                                                      */
//========================================================================================

/** Dense Vector data structure
 *
 * Immutable class, not managing exceptions
 * For is faster than reduce, forEach, maps, perf here: https://replit.com/@pedroth/forVsForEach#index.js
 * Didn't use private vars because of performance
 */
export default class Vec {
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

  /**index starts at zero */
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
    // didn't use reduce because this is faster
    let acc = 0;
    for (let i = 0; i < this._n; i++) {
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
    for (let i = 0; i < this._n; i++) {
      ans[i] = lambda(this._vec[i], i);
    }
    return new Vec(ans);
  }

  /**
   *
   * @param {*} u: Vec
   * @param {*} operation: (a,b) => op(a,b)
   */
  op(u, operation) {
    sameSizeOrError(this, u);
    const ans = BUILD_VEC(this._n);
    for (let i = 0; i < this._n; i++) {
      ans[i] = operation(this._vec[i], u._vec[i]);
    }
    return new Vec(ans);
  }

  reduce(fold, init = 0) {
    let acc = init;
    for (let i = 0; i < this._n; i++) {
      acc = fold(acc, this._vec[i], i);
    }
    return acc;
  }

  fold = this.reduce;
  foldLeft = this.fold;

  equals(u, precision = 1e-5) {
    if (!(u instanceof Vec)) return false;
    return this.sub(u).length() < precision;
  }

  take(n = 0, m = this._vec.length) {
    return new Vec(this._vec.slice(n, m));
  }

  findIndex(predicate) {
    for (let i = 0; i < this._n; i++) {
      if (predicate(this._vec[i])) return i;
    }
    return -1;
  }

  static fromArray(array) {
    if (array.length === 2) return Vector2.fromArray(array);
    if (array.length === 3) return Vector3.fromArray(array);
    return new Vec(_sanitize_input(array, BUILD_VEC(array.length)));
  }

  static of(...values) {
    if (values.length === 2) return Vector2.of(...values);
    if (values.length === 3) return Vector3.of(...values);
    return new Vec(_sanitize_input(values, BUILD_VEC(values.length)));
  }

  static ZERO = (n) =>
    n === 3 ? new Vector3() : n === 2 ? new Vector2() : new Vec(BUILD_VEC(n));

  static ONES = (n) => {
    if (n === 2) return Vector2.ONES;
    if (n === 3) return Vector3.ONES;
    return Vec.ZERO(n).map(() => 1);
  };

  static e = (n) => (i) => {
    if (n === 2) return Vector2.e(i);
    if (n === 3) return Vector3.e(i);
    const vec = BUILD_VEC(n);
    if (i >= 0 && i < n) {
      vec[i] = 1;
    }
    return new Vec(vec);
  };

  static RANDOM = (n) => {
    if (n === 2) return Vector2.RANDOM();
    if (n === 3) return Vector3.RANDOM();
    const v = BUILD_VEC(n);
    for (let i = 0; i < n; i++) {
      v[i] = Math.random();
    }
    return new Vec(v);
  };
}

export const BUILD_VEC = (n) => new ARRAY_TYPES.Float64Array(n);
export const COPY_VEC = (array) => ARRAY_TYPES.Float64Array.from(array);
export class VectorException extends Error {}

export const Vec3 = (x = 0, y = 0, z = 0) => new Vector3(x, y, z);
export const Vec2 = (x = 0, y = 0) => new Vector2(x, y);

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

  /**index starts at zero */
  get(i) {
    if (i === 0) return this.x;
    if (i === 1) return this.y;
    if (i === 2) return this.z;
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
    return new Vector3(lambda(this.x), lambda(this.y), lambda(this.z));
  }

  /**
   *
   * @param {*} y: Vec
   * @param {*} operation: (a,b) => op(a,b)
   */
  op(u, operation) {
    return new Vector3(
      operation(this.x, u.x),
      operation(this.y, u.y),
      operation(this.z, u.z)
    );
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

  equals(u, precision = 1e-5) {
    if (!(u instanceof Vector3)) return false;
    return this.sub(u).length() < precision;
  }

  take(n = 0, m = 3) {
    const array = [this.x, this.y, this.z].slice(n, m);
    if (array.length === 2) return Vector2.fromArray(array);
    if (array.length === 3) return Vector3.fromArray(array);
    return Vec.fromArray(array);
  }

  findIndex(predicate) {
    if (predicate(this.x)) return 0;
    if (predicate(this.y)) return 1;
    if (predicate(this.z)) return 2;
    return -1;
  }

  static fromArray(array) {
    return new Vector3(...array);
  }

  static of(...values) {
    return new Vector3(...values);
  }

  static e = (i) => {
    if (i === 0) return new Vector3(1, 0, 0);
    if (i === 1) return new Vector3(0, 1, 0);
    if (i === 2) return new Vector3(0, 0, 1);
    return new Vec3();
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

  /**index starts at zero */
  get(i) {
    if (i === 0) return this.x;
    if (i === 1) return this.y;
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
    return new Vector2(lambda(this.x), lambda(this.y));
  }

  /**
   *
   * @param {*} y: Vec
   * @param {*} operation: (a,b) => op(a,b)
   */
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

  equals(u, precision = 1e-5) {
    if (!(u instanceof Vector2)) return false;
    return this.sub(u).length() < precision;
  }

  take(n = 0, m = 2) {
    const array = [this.x, this.y].slice(n, m);
    if (array.length === 2) return Vector2.fromArray(array);
    return Vec.fromArray(array);
  }

  findIndex(predicate) {
    if (predicate(this.x)) return 0;
    if (predicate(this.y)) return 1;
    return -1;
  }

  static fromArray(array) {
    return new Vector2(...array);
  }

  static of(...values) {
    return new Vector2(...values);
  }

  static e = (i) => {
    if (i === 0) return new Vector2(1, 0);
    if (i === 1) return new Vector2(0, 1);
    return new Vector2();
  };

  static RANDOM = () => {
    return new Vector2(Math.random(), Math.random());
  };

  static ONES = new Vector2(1, 1);
}
