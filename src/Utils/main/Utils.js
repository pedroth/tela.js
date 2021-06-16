const ArrayUtils = {};

ArrayUtils.TYPED_ARRAY = {
  Uint8Array: (...array) => Uint8ArrayFactory(array),
};

export { ArrayUtils };

export const perf = (lambda) => {
  const t = performance.now();
  lambda();
  return performance.now() - t;
};

function Uint8ArrayFactory(array) {
  const answer = new Uint8Array(array.length);
  for (let i = 0; i < answer.length; i++) {
    answer[i] = array[i];
  }
  return answer;
}
