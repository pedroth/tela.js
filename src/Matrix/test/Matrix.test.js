import Matrix from "../main/Matrix";
import { perf } from "../../Utils/main/Utils";

test("test basic creation", () => {
  const rowMajor = Float64Array.from([1, 2, 3, 4]);
  const shape = [2, 2];
  const matrixR = Matrix.rowBuilder().addRow(1, 2).addRow(3, 4).build();
  const matrixC = Matrix.colBuilder().addCol(1, 3).addCol(2, 4).build();
  const matrix = Matrix.builder()
    .size(2, 2)
    .set(0, 0, 1)
    .set(0, 1, 2)
    .set(1, 0, 3)
    .set(1, 1, 4)
    .build();
  expect(matrixC.data).toStrictEqual(rowMajor);
  expect(matrixC.shape).toStrictEqual(shape);
  expect(matrixR.data).toStrictEqual(rowMajor);
  expect(matrixR.shape).toStrictEqual(shape);
  expect(matrix.data).toStrictEqual(rowMajor);
  expect(matrix.shape).toStrictEqual(shape);
});

test("test zero matrix", () => {
  const rowMajor = Float64Array.from([0, 0, 0, 0]);
  const matrix = Matrix.ZERO(2, 2);
  const vec = Matrix.ZERO(4);
  const cov = Matrix.ZERO(1, 4);
  expect(matrix.data).toStrictEqual(rowMajor);
  expect(vec.data).toStrictEqual(rowMajor);
  expect(cov.data).toStrictEqual(rowMajor);
});

test("test special dot prod", () => {
  expect(Matrix.dx(10)(2).prod(Matrix.e(10)(2)).get()).toBe(1);
  expect(Matrix.dx(10)(1).prod(Matrix.e(10)(2)).get()).toBe(0);
});

test("test product", () => {
  const leftR = Matrix.rowBuilder().addRow(0, -1).addRow(1, 0).build();
  const v = Matrix.vec(0, 1);
  const expected = Float64Array.from([-1, 0]);
  expect(leftR.prod(v).data).toStrictEqual(expected);
});

test("test dot product", () => {
  const theta = Math.PI / 4;
  const cos = Math.cos(theta);
  const sin = Math.cos(theta);
  const ortho = Matrix.colBuilder().addCol(cos, sin).addCol(-sin, cos).build();
  expect(ortho.dot(ortho).equals(Matrix.id(2))).toBe(true);
  expect(Matrix.vec(1, 2, 3, 4).dot(Matrix.vec(1, 1, 1, 1)).get()).toBe(10);
});

test("test add", () => {
  const { vec2 } = Matrix;
  const expected = Float64Array.from([1, 1]);
  expect(vec2.e0.add(vec2.e1).data).toStrictEqual(expected);
});

test("test sub", () => {
  const expected = Float64Array.from([0, 0, 0, 0]);
  const left = Matrix.rowBuilder().addRow(1, 1).addRow(1, 1).build();
  const right = Matrix.colBuilder().addCol(1, 1).addCol(1, 1).build();
  expect(left.sub(right).data).toStrictEqual(expected);
});

test("test scale", () => {
  const expected = Float64Array.from([2, 4, 6, 8]);
  const left = Matrix.rowBuilder().addRow(1, 2).addRow(3, 4).build();
  expect(left.scale(2).data).toStrictEqual(expected);
});

test("test reduce", () => {
  const matrix = Matrix.rowBuilder().addRow(1, 1).addRow(1, 1).build();
  expect(matrix.reduce((e, x) => e + x)).toBe(4);
});

test("test get performance", () => {
  const n = 100000;
  const d = 3;
  const v = Matrix.vec(1, 2, 3);
  const u = [1, 2, 3];
  console.log(
    "Matrix",
    perf(() => {
      for (let i = 0; i < n; i++) {
        const r = ~~(Math.random() * d);
        v.get(r);
      }
    })
  );
  console.log(
    "Array",
    perf(() => {
      for (let i = 0; i < n; i++) {
        const r = ~~(Math.random() * d);
        u[r];
      }
    })
  );
});

test("test equality", () => {
  const rowM = Matrix.rowBuilder().addRow(1, 2).addRow(3, 4).build();
  const colM = Matrix.colBuilder().addCol(1, 2).addCol(3, 4).build();
  const vec = Matrix.vec(1, 2, 3, 4);
  expect(rowM.equals(rowM)).toBe(true);
  expect(colM.equals(rowM)).toBe(false);
  expect(rowM.equals(vec)).toBe(false);
});

test("test toArray", () => {
  const expected = Float64Array.from([1, 2, 3, 4]);
  const rowM = Matrix.rowBuilder().addRow(1, 2).addRow(3, 4).build();
  const vec = Matrix.vec(1, 2, 3, 4);
  expect(rowM.toArray()).toStrictEqual(expected);
  expect(vec.toArray()).toStrictEqual(expected);
});
