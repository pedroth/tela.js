import Color from "../main/Color";
import { ArrayUtils } from "../../Utils/main/Utils";

test("test creation", () => {
  const c = Color.ofRGBA(255, 255, 255);
  expect(c.getRGBA()).toStrictEqual(
    ArrayUtils.TYPED_ARRAY.Uint8Array(255, 255, 255, 255)
  );
});

test("test get rgba", () => {
  const c = Color.ofRGBA(1, 2, 3);
  expect(c.red).toStrictEqual(1);
  expect(c.green).toStrictEqual(2);
  expect(c.blue).toStrictEqual(3);
  expect(c.alpha).toStrictEqual(255);
});
