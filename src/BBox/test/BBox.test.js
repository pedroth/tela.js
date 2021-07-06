import BBox from "../main/BBox";
import Matrix from "../../Matrix/main/Matrix";
const { vec2 } = Matrix;
test("test union", () => {
  const bbox = new BBox(vec2.of(0, 0), vec2.of(0.5, 0.5));
  const anotherBox = new BBox(vec2.of(0.5, 0.5), vec2.of(1.5, 1.5));
  const expectedBox = new BBox(vec2.of(0.0, 0.0), vec2.of(1.5, 1.5));
  const point = BBox.ofPoint(1.5, 1.5);
  expect(bbox.add(anotherBox).equals(expectedBox)).toBe(true);
  expect(bbox.union(point).equals(expectedBox)).toBe(true);
});

test("test intersection", () => {
  const bbox = new BBox(vec2.of(0, 0), vec2.of(1, 1));
  const anotherBox = new BBox(vec2.of(0.5, 0.5), vec2.of(1.5, 1.5));
  const expectedBox = new BBox(vec2.of(0.5, 0.5), vec2.of(1.0, 1.0));
  expect(bbox.sub(anotherBox).equals(expectedBox)).toBe(true);
  const yetAnotherBox = new BBox(vec2.of(1.6, 1.6), vec2.of(2, 2));
  expect(bbox.sub(yetAnotherBox).equals(BBox.EMPTY)).toBe(true);
});

test("test collision", () => {
  const bbox = new BBox(vec2.of(0, 0), vec2.of(1, 1));
  const anotherBox = new BBox(vec2.of(0.5, 0.5), vec2.of(1.5, 1.5));
  const point = vec2.of(0.5, 0.5);
  const anotherPoint = vec2.of(3, 0.5);
  expect(bbox.collidesWith(anotherBox)).toBe(true);
  expect(bbox.collidesWith(point)).toBe(true);
  expect(bbox.collidesWith(anotherPoint)).toBe(false);
});

test("test with empty", () => {
  const bbox = new BBox(vec2.of(0, 0), vec2.of(1, 1));
  expect(BBox.EMPTY.add(bbox).equals(bbox)).toBe(true);
  expect(BBox.EMPTY.sub(bbox).equals(BBox.EMPTY)).toBe(true);
});

test("test equality", () => {
  const boundingBox = new BBox(vec2.of(0, 0), vec2.of(1, 0));
  const anotherBox = new BBox(vec2.of(1, 0), vec2.of(1, 1));
  expect(boundingBox.equals(boundingBox)).toBe(true);
  expect(boundingBox.equals(anotherBox)).toBe(false);
});
