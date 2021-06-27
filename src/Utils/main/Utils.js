export const perf = (lambda) => {
  const t = performance.now();
  lambda();
  return performance.now() - t;
};

/**
 * Unit test maker
 * @param {*} title
 * @param {*} lambda: (width:number, height: number) => {}
 */
export function test(title, lambda = () => {}) {
  let canvas;
  const canvasFactory = (width, height) => {
    canvas = Canvas.builder().width(width).height(height).build();
    return canvas;
  };
  const timeInMillis = perf(() => lambda(canvasFactory));
  const domTest = document.createElement("div");
  const testTitle = document.createElement("h3");
  testTitle.innerText = title;
  domTest.appendChild(testTitle);
  domTest.appendChild(canvas.getDom());
  const timeDom = document.createElement("h4");
  timeDom.innerText = `Test took ${timeInMillis}ms`;
  domTest.appendChild(timeDom);
  document.body.appendChild(domTest);
}
