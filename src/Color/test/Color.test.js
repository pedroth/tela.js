import Color from "../main/Color";
import { ArrayUtils } from "../../Utils/main/Utils";

test("test creation", () => {
  const c = Color.ofRGBA(255, 255, 255);
  expect(c.getRGBA()).toStrictEqual(
    ArrayUtils.TYPED_ARRAY.Uint8Array(255, 255, 255, 255)
  );
});
