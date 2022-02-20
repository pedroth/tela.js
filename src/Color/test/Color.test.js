import Color from "../main/Color";

test("test creation", () => {
  const c = Color.ofRGBA(1, 1, 1);
  expect(c.getRGBA()).toStrictEqual(Uint8Array.from([255, 255, 255, 255]));
});

test("test get rgba", () => {
  const c = Color.ofRGBA(0.1, 0.2, 0.3);
  expect(c.red).toStrictEqual(Math.floor(0.1 * 255));
  expect(c.green).toStrictEqual(Math.floor(0.2 * 255));
  expect(c.blue).toStrictEqual(Math.floor(0.3 * 255));
  expect(c.alpha).toStrictEqual(255);
});

test("test equals", () => {
  expect(Color.ofRGBA(1, 2, 3).equals(Color.ofRGBA(1, 2, 3))).toBe(true);
  expect(Color.ofRGBA(1, 2, 1).equals(Color.ofRGBA(1, 2, 3))).toBe(false);
});
