import Function from "../Function";

test("compose test", () => {
  const ide1 = Function.of(x => x * x).compose(Math.sqrt);
  const ide2 = Function.of(Math.sqrt).compose(x => x * x);
  expect(ide1.eval(2)).toBeCloseTo(2);
  expect(ide1.lambda(2)).toBeCloseTo(2);
  expect(ide2.apply(2)).toBeCloseTo(2);
  expect(ide2.f(2)).toBeCloseTo(2);

  const ide = Function.of(ide1).dot(ide2);
  expect(ide.f(3)).toBeCloseTo(3);
});
