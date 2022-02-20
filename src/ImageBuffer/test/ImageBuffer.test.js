import Color from "../../Color/main/Color";
import ImageBuffer from "../main/ImageBuffer";

test("test creation", () => {
  const img = ImageBuffer.builder().width(100).height(100).build();
  expect(img.data.length).toBe(100 * 100 * 4);
});

test("test get and set", () => {
  const img = ImageBuffer.builder().width(100).height(100).build();
  const red = Color.RED;
  const green = Color.GREEN;
  img.setPxl(10, 10, red);
  img.setPxl(200, 10, green);
  expect(img.getPxl(10, 10).equals(red)).toBe(true);
  expect(img.getPxl(200, 10)).toBe(undefined);
});

test("test map", () => {
  const img = ImageBuffer.builder().width(2).height(2).build();
  const nextImg = img.map((c, x, y) => Color.ofRGBA(x, y, 0));
  expect(nextImg.data).toStrictEqual(
    Uint8Array.from([
      0, 0, 0, 255, 0, 255, 0, 255, 255, 0, 0, 255, 255, 255, 0, 255,
    ])
  );
});

test("test draw line", () => {
  const img = ImageBuffer.builder().width(2).height(2).build();
  const nextImg = img.map((c, x, y) => Color.ofRGBA(x, y, 0));
  expect(nextImg.data).toStrictEqual(
    Uint8Array.from([
      0, 0, 0, 255, 0, 255, 0, 255, 255, 0, 0, 255, 255, 255, 0, 255,
    ])
  );
});
