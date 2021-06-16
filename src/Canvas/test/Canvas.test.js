import Canvas from "../main/Canvas";

test("test creation", () => {
  const img = new Canvas({ canvas });
  expect(img.data.length).toBe(100 * 100 * 4);
});

test("test get and set", () => {
  const img = new ImageBuffer({ width: 100, height: 100 });
  img.set(10, 10, [255, 0, 0, 255]);
  img.set(200, 10, [0, 255, 0, 255]);
  expect(img.get(10, 10)).toStrictEqual([255, 0, 0, 255]);
  expect(img.get(200, 10)).toBe(undefined);
});

test("test lazy set", () => {
  const img = new ImageBuffer({ width: 100, height: 100 });
  img
    .setter()
    .region([50, 50], [100, 100], (i, j) => [
      255 * (i / 100),
      0,
      255 * (j / 100),
      255,
    ])
    .point(10, 12, [100, 0, 0, 255])
    .set();
  expect(img.get(50, 50)).toStrictEqual([
    255 * (50 / 100),
    0,
    255 * (50 / 100),
    255,
  ]);
  expect(img.get(100, 99)).toStrictEqual([255, 0, 255 * (99 / 100), 255]);
  expect(img.get(10, 12)).toStrictEqual([100, 0, 0, 255]);
  expect(img.get(-1, 12)).toStrictEqual([100, 0, 0, 255]);
});
