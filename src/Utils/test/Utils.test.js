import { ArrayUtils } from "../main/Utils";

test("test typed array creation", () => {
  const expectArray = new Uint8Array(4).map((x, i) => i);
  expect(ArrayUtils.TYPED_ARRAY.Uint8Array(0, 1, 2, 3)).toStrictEqual(
    expectArray
  );
});
