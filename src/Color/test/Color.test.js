import Color from "../main/Color";

test("test creation", () => {
  const c = Color.ofRGBA(255, 255, 255);
  expect(c.getRGBA()).toStrictEqual(Uint8Array.from([255, 255, 255, 255]));
});

test("test get rgba", () => {
  const c = Color.ofRGBA(1, 2, 3);
  expect(c.red).toStrictEqual(1);
  expect(c.green).toStrictEqual(2);
  expect(c.blue).toStrictEqual(3);
  expect(c.alpha).toStrictEqual(255);
});

test("test equals", () => {
  expect(Color.ofRGBA(1, 2, 3).equals(Color.ofRGBA(1, 2, 3))).toBe(true);
  expect(Color.ofRGBA(1, 2, 1).equals(Color.ofRGBA(1, 2, 3))).toBe(false);
});
