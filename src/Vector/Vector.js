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

  get n() { return this._n; }
  get dim() { return this._n; }
  get len() { return this._n; }
  get size() { return this._n; }

  clone() {
    return new Vec(COPY_VEC(this._vec));
  }

  copy() {
    return this.clone();
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
    return new Vec(array);
  }

  static of(...values) {
    return new Vec(values);
  }

  static ZERO = (n) => new Vec(BUILD_VEC(n));

  static ONES = (n) => {
    return Vec.ZERO(n).map(() => 1);
  };

  static e = (n) => (i) => {
    const vec = BUILD_VEC(n);
    if (i >= 0 && i < n) {
      vec[i] = 1;
    }
    return new Vec(vec);
  };

  static RANDOM = (n) => {
    const v = BUILD_VEC(n);
    for (let i = 0; i < n; i++) {
      v[i] = Math.random();
    }
    return new Vec(v);
  };
}

export const BUILD_VEC = (n) => new ARRAY_TYPES.Float64Array(n);
export const COPY_VEC = (array) => array.slice();
export class VectorException extends Error { }
