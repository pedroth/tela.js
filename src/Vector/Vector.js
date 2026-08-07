//========================================================================================
/*                                                                                      *
 *                                        VECTOR                                        *
 *                                                                                      */
//========================================================================================

/** Dense Vector data structure
 *
 * Immutable class, not managing exceptions
 * For is faster than reduce, forEach, maps, etc. because of lambda overhead
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
    const ans = BUILD_VEC(this._n);
    for (let i = 0; i < this._n; i++) ans[i] = this._vec[i] + u._vec[i];
    return new Vec(ans);
  }

  sub(u) {
    const ans = BUILD_VEC(this._n);
    for (let i = 0; i < this._n; i++) ans[i] = this._vec[i] - u._vec[i];
    return new Vec(ans);
  }

  mul(u) {
    const ans = BUILD_VEC(this._n);
    for (let i = 0; i < this._n; i++) ans[i] = this._vec[i] * u._vec[i];
    return new Vec(ans);
  }

  div(u) {
    const ans = BUILD_VEC(this._n);
    for (let i = 0; i < this._n; i++) ans[i] = this._vec[i] / u._vec[i];
    return new Vec(ans);
  }

  dot(u) {
    let acc = 0;
    for (let i = 0; i < this._n; i++) {
      acc += this._vec[i] * u._vec[i];
    }
    return acc;
  }

  squareLength() {
    let acc = 0;
    for (let i = 0; i < this._n; i++) {
      acc += this._vec[i] * this._vec[i];
    }
    return acc;
  }

  length() {
    return Math.sqrt(this.squareLength());
  }

  normalize() {
    return this.scale(1 / this.length());
  }

  scale(r) {
    const ans = BUILD_VEC(this._n);
    for (let i = 0; i < this._n; i++) ans[i] = this._vec[i] * r;
    return new Vec(ans);
  }

  map(lambda) {
    const ans = BUILD_VEC(this._n);
    for (let i = 0; i < this._n; i++) {
      ans[i] = lambda(this._vec[i], i);
    }
    return new Vec(ans);
  }

  /**
   * @param {*} u: Vec
   * @param {*} operation: (a,b) => op(a,b)
   */
  op(u, operation) {
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

  fold(f, init = 0) {
    return this.reduce(f, init);
  }
  
  foldLeft(f, init = 0) {
    return this.reduce(f, init);
  }

  // Optimized to avoid instantiating new vectors and doing square roots
  equals(u, precision = 1e-5) {
    if (!(u instanceof Vec) || this._n !== u._n) return false;
    let distSq = 0;
    for (let i = 0; i < this._n; i++) {
      const d = this._vec[i] - u._vec[i];
      distSq += d * d;
    }
    return distSq < (precision * precision);
  }

  take(n = 0, m = this._vec.length) {
    return Vec.fromArray(this._vec.slice(n, m));
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
    return new Vec(array);
  }

  static of(...values) {
    if (values.length === 2) return Vector2.of(...values);
    if (values.length === 3) return Vector3.of(...values);
    return new Vec(values);
  }

  static ZERO = (n) =>
    n === 3 ? new Vector3() : n === 2 ? new Vector2() : new Vec(BUILD_VEC(n));

  static ONES = (n) => {
    if (n === 2) return Vector2.ONES;
    if (n === 3) return Vector3.ONES;
    const v = BUILD_VEC(n);
    for (let i = 0; i < n; i++) v[i] = 1;
    return new Vec(v);
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

export const BUILD_VEC = (n) => new Float64Array(n);
// Native slice is significantly faster than Float64Array.from
export const COPY_VEC = (array) => new Float64Array(array);
export class VectorException extends Error { }

export function Vec3(x = 0, y = 0, z = 0) { return new Vector3(x, y, z); }
export function Vec2(x = 0, y = 0) { return new Vector2(x, y); }

export class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  get n() { return 3; }
  get dim() { return 3; }

  size() { return 3; }
  shape() { return [3]; }

  clone() {
    return new Vector3(this.x, this.y, this.z);
  }

  /**index starts at zero */
  get(i) {
    return i === 0 ? this.x : i === 1 ? this.y : this.z;
  }

  toArray() {
    return [this.x, this.y, this.z];
  }

  toString() {
    return "[" + this.x + ", " + this.y + ", " + this.z + "]";
  }

  serialize() {
    return this.x + ", " + this.y + ", " + this.z;
  }

  add(u) { return new Vector3(this.x + u.x, this.y + u.y, this.z + u.z); }
  sub(u) { return new Vector3(this.x - u.x, this.y - u.y, this.z - u.z); }
  mul(u) { return new Vector3(this.x * u.x, this.y * u.y, this.z * u.z); }
  div(u) { return new Vector3(this.x / u.x, this.y / u.y, this.z / u.z); }

  dot(u) {
    return this.x * u.x + this.y * u.y + this.z * u.z;
  }

  squareLength() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  length() {
    return Math.sqrt(this.squareLength());
  }

  normalize() {
    const len = this.length();
    return new Vector3(this.x / len, this.y / len, this.z / len);
  }

  scale(r) {
    return new Vector3(this.x * r, this.y * r, this.z * r);
  }

  map(lambda) {
    return new Vector3(lambda(this.x, 0), lambda(this.y, 1), lambda(this.z, 2));
  }

  cross(v) {
    return new Vector3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

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

  fold(f, init = 0) {
    return this.reduce(f, init);
  }
  
  foldLeft(f, init = 0) {
    return this.reduce(f, init);
  }

  // Optimized distance calculation
  equals(u, precision = 1e-5) {
    if (!(u instanceof Vector3)) return false;
    const dx = this.x - u.x;
    const dy = this.y - u.y;
    const dz = this.z - u.z;
    return (dx * dx + dy * dy + dz * dz) < (precision * precision);
  }

  take(n = 0, m = 3) {
    const array = [this.x, this.y, this.z].slice(n, m);
    return Vec.fromArray(array);
  }

  findIndex(predicate) {
    if (predicate(this.x)) return 0;
    if (predicate(this.y)) return 1;
    if (predicate(this.z)) return 2;
    return -1;
  }

  static fromArray(array) {
    return new Vector3(array[0], array[1], array[2]);
  }

  static of(...values) {
    return new Vector3(values[0], values[1], values[2]);
  }

  static e = (i) => {
    if (i === 0) return new Vector3(1, 0, 0);
    if (i === 1) return new Vector3(0, 1, 0);
    if (i === 2) return new Vector3(0, 0, 1);
    return new Vector3();
  };

  static RANDOM = () => {
    return new Vector3(Math.random(), Math.random(), Math.random());
  };

  static ONES = new Vector3(1, 1, 1);
}

export class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  get n() { return 2; }
  get dim() { return 2; }

  size() { return 2; }
  shape() { return [2]; }

  clone() {
    return new Vector2(this.x, this.y);
  }

  /**index starts at zero */
  get(i) {
    return i === 0 ? this.x : this.y;
  }

  toArray() {
    return [this.x, this.y];
  }

  toString() {
    return "[" + this.x + ", " + this.y + "]";
  }

  serialize() {
    return this.x + ", " + this.y;
  }

  add(u) { return new Vector2(this.x + u.x, this.y + u.y); }
  sub(u) { return new Vector2(this.x - u.x, this.y - u.y); }
  mul(u) { return new Vector2(this.x * u.x, this.y * u.y); }
  div(u) { return new Vector2(this.x / u.x, this.y / u.y); }

  dot(u) {
    return this.x * u.x + this.y * u.y;
  }

  squareLength() {
    return this.x * this.x + this.y * this.y;
  }

  length() {
    return Math.sqrt(this.squareLength());
  }

  normalize() {
    const len = this.length();
    return new Vector2(this.x / len, this.y / len);
  }

  scale(r) {
    return new Vector2(this.x * r, this.y * r);
  }

  map(lambda) {
    return new Vector2(lambda(this.x, 0), lambda(this.y, 1));
  }

  cross(v) {
    return this.x * v.y - this.y * v.x;
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

  fold(f, init = 0) {
    return this.reduce(f, init);
  }
  
  foldLeft(f, init = 0) {
    return this.reduce(f, init);
  }

  // Optimized distance calculation
  equals(u, precision = 1e-5) {
    if (!(u instanceof Vector2)) return false;
    const dx = this.x - u.x;
    const dy = this.y - u.y;
    return (dx * dx + dy * dy) < (precision * precision);
  }

  take(n = 0, m = 2) {
    const array = [this.x, this.y].slice(n, m);
    return Vec.fromArray(array);
  }

  findIndex(predicate) {
    if (predicate(this.x)) return 0;
    if (predicate(this.y)) return 1;
    return -1;
  }

  static fromArray(array) {
    return new Vector2(array[0], array[1]);
  }

  static of(...values) {
    return new Vector2(values[0], values[1]);
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