export const perf = (lambda) => {
  const t = performance.now();
  lambda();
  return performance.now() - t;
};

/**
 *
 * @param {*} canvasBuilder : () => canvas
 * @returns
 */
export const testBuilder =
  (canvasBuilder = canvasFactory) =>
  /**
   * Unit test maker
   * @param {*} title
   * @param {*} lambda: (canvas) => {}
   */
  (title, lambda = () => {}) => {
    let canvas = canvasBuilder();
    const timeInMillis = perf(() => lambda(canvas));
    const domTest = document.createElement("div");
    const testTitle = document.createElement("h3");
    testTitle.innerText = title;
    domTest.appendChild(testTitle);
    domTest.appendChild(canvas.getDom());
    const timeDom = document.createElement("h4");
    timeDom.innerText = `Test took ${timeInMillis}ms`;
    domTest.appendChild(timeDom);
    document.body.appendChild(domTest);
  };

const canvasFactory = () => Canvas.builder().width(500).height(500).build();
