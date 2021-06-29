//========================================================================================
/*                                                                                      *
 *                              MATRIX UTILS (order counts)                             *
 *                                                                                      */
//========================================================================================

const getIndexFromCoord = (_, m) => (i, j) => j + i * m;
const getCoordFromIndex = (_, m) => (k) => [k / m, k % m].map(Math.floor);
const index2Key = (i, j) => `${i},${j}`;
const key2Index = (k) => k.split(",").map(Number);

class MatrixBuilder {
  constructor() {
    this._size = [];
    this.data = {};
  }

  size(n, m = 1) {
    this._size = [n, m];
    return this;
  }

  set(i, j, v) {
    if (this._size.length === 0)
      throw new MatrixError("Setting value to empty matrix");
    this.data[index2Key(i, j)] = v;
    return this;
  }

  build() {
    const [n, m] = this._size;
    const data = new Float64Array(n * m);
    const indexer = getIndexFromCoord(n, m);
    Object.keys(this.data).forEach((key) => {
      data[indexer(...key2Index(key))] = this.data[key];
    });
    return new Matrix(data, this._size);
  }
}

class RowBuilder {
  constructor() {
    this.rows = [];
    this.dim = 0;
  }

  addRow(...array) {
    if (this.dim === 0) {
      this.dim = array.length;
    }
    if (this.dim !== array.length)
      throw new MatrixError(
        `Added row of different dimension, actual dim is ${this.dim}`
      );
    this.rows.push(array);
    return this;
  }

  build() {
    if (this.rows.length > 0) return this.#buildWithRows();
    throw new MatrixError("Building empty matrix");
  }

  #buildWithRows() {
    const rows = this.rows.length;
    const cols = this.dim;
    const data = new Float64Array(rows * cols);
    const indexF = getIndexFromCoord(rows, cols);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        data[indexF(i, j)] = this.rows[i][j];
      }
    }
    return new Matrix(data, [rows, cols]);
  }
}

class ColBuilder {
  constructor() {
    this.cols = [];
    this.dim = 0;
  }

  addCol(...array) {
    if (this.dim === 0) {
      this.dim = array.length;
    }
    if (this.dim !== array.length)
      throw new MatrixError(
        `Added col of different dimension, actual dim is ${this.dim}`
      );
    this.cols.push(array);
    return this;
  }

  build() {
    if (this.cols.length > 0) return this.#buildWithCols();
    throw new MatrixError("Building empty matrix");
  }

  #buildWithCols() {
    const rows = this.dim;
    const cols = this.cols.length;
    const data = new Float64Array(rows * cols);
    const indexF = getIndexFromCoord(rows, cols);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        data[indexF(i, j)] = this.cols[j][i];
      }
    }
    return new Matrix(data, [rows, cols]);
  }
}

//========================================================================================
/*                                                                                      *
 *                                        MATRIX                                        *
 *                                                                                      */
//========================================================================================

export default class Matrix {
  /**
   *
   * @param {*} data: Float64Array; Matrix data in major row format
   * @param {*} shape: 2-array [rows,columns]
   */
  constructor(data, shape) {
    this.data = data;
    this.shape = shape;
  }

  get rows() {
    return this.shape[0];
  }

  get cols() {
    return this.shape[1];
  }

  get(i = 0, j = 0) {
    const [_, cols] = this.shape;
    return this.data[j + i * cols];
  }

  prod(matrix) {
    if (this.cols !== matrix.rows)
      throw new MatrixError(
        `Incompatible product size. Left ${this.shape}, right ${matrix.shape}`
      );
    const n = this.rows;
    const m = this.cols;
    const l = matrix.cols;
    const prod = new Float64Array(n * l);
    const indexer = getIndexFromCoord(n, l);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < l; j++) {
        let acc = 0;
        for (let k = 0; k < m; k++) {
          acc += this.get(i, k) * matrix.get(k, j);
        }
        prod[indexer(i, j)] = acc;
      }
    }

    return new Matrix(prod, [n, l]);
  }

  /**
   *
   * @param {*} lambda: (number, i, j) => number
   * @returns Matrix
   */
  map(lambda = (x) => x) {
    const getCoord = getCoordFromIndex(...this.shape);
    return new Matrix(
      this.data.map((x, k) => {
        const [i, j] = getCoord(k);
        return lambda(x, i, j);
      }),
      this.shape
    );
  }

  /**
   *
   * @param {*} lambda (accumulator, number, i, j) => number
   * @param {*} identity
   */
  reduce(lambda, identity = 0) {
    const getCoord = getCoordFromIndex(...this.shape);
    return this.data.reduce((e, x, k) => {
      const [i, j] = getCoord(k);
      return lambda(e, x, i, j);
    }, identity);
  }

  fold = this.reduce;

  /**
   *
   * @param {*} binaryLambda: (number,number) => number
   */
  op(matrix, binaryLambda) {
    const [rows, cols] = this.shape;
    const [mRows, mCols] = matrix.shape;
    if (rows !== mRows || cols !== mCols)
      throw new MatrixError("Matrix must be of same size");
    return new Matrix(
      this.data.map((x, i) => binaryLambda(x, matrix.data[i])),
      this.shape
    );
  }

  add(matrix) {
    return this.op(matrix, (a, b) => a + b);
  }

  sub(matrix) {
    return this.op(matrix, (a, b) => a - b);
  }

  mul(matrix) {
    return this.op(matrix, (a, b) => a * b);
  }

  div(matrix) {
    return this.op(matrix, (a, b) => a / b);
  }

  scale(real) {
    return this.map((x) => x * real);
  }

  static e = (n) => (i) => {
    return new Matrix(
      new Float64Array(n).map((_, j) => (i === j ? 1 : 0)),
      [n, 1]
    );
  };

  static dx = (n) => (i) => {
    return new Matrix(
      new Float64Array(n).map((_, j) => (i === j ? 1 : 0)),
      [1, n]
    );
  };

  static ZERO(n, m = 1) {
    return Matrix.builder().size(n, m).build();
  }

  static builder() {
    return new MatrixBuilder();
  }

  static rowBuilder() {
    return new RowBuilder();
  }

  static colBuilder() {
    return new ColBuilder();
  }

  static vec(...array) {
    return new ColBuilder().addCol(...array).build();
  }

  static cov(...array) {
    return new RowBuilder().addRow(...array).build();
  }

  static vec2 = {
    of: (x = 0, y = 0) => Matrix.vec(x, y),
    e0: Matrix.vec(1, 0),
    e1: Matrix.vec(0, 1),
  };

  static vec3 = {
    of: (x = 0, y = 0, z = 0) => Matrix.vec(x, y, z),
    e0: Matrix.vec(1, 0, 0),
    e1: Matrix.vec(0, 1, 0),
    e2: Matrix.vec(0, 0, 1),
  };
}

export class MatrixError extends Error {}
