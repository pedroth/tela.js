import ImageIO from "./ImageIO.js";
/*
 Canvas coordinates

 0                  W-1
 +-------------> y
 |
 |
 |       *
 |
 |
 v x

 H-1
 */

/*

The point xe_1 + ye_2 corresponds to a point in the middle of a pxl.

The canvas data is an array of length colors(C) * width(W) * height(H). Is a 3D-array.
The index is a number in [0, C * W * H - 1].
Having (x, y, z) where z is the color axis, the formula to index the array is :

f(x, y, z) = C * W * x + C * y + z.

Where x in [0, H - 1], y in [0, W - 1] and z in [0, C - 1].

Note that f(H - 1, W - 1, C - 1) = C * W * H - 1.
*/

// Auxiliary functions
function scale(u, r) {
  var ans = [];
  ans[0] = u[0] * r;
  ans[1] = u[1] * r;
  return ans;
}

function add(u, v) {
  var ans = [];
  ans[0] = u[0] + v[0];
  ans[1] = u[1] + v[1];
  return ans;
}

function floor(x) {
  var ans = [];
  ans[0] = Math.floor(x[0]);
  ans[1] = Math.floor(x[1]);
  return ans;
}

function diff(u, v) {
  var ans = [];
  ans[0] = u[0] - v[0];
  ans[1] = u[1] - v[1];
  return ans;
}

function dot(u, v) {
  return u[0] * v[0] + u[1] * v[1];
}

function squareNorm(x) {
  return dot(x, x);
}

function norm(x) {
  return Math.sqrt(dot(x, x));
}

function min(u, v) {
  var ans = [];
  ans[0] = Math.min(u[0], v[0]);
  ans[1] = Math.min(u[1], v[1]);
  return ans;
}

function max(u, v) {
  var ans = [];
  ans[0] = Math.max(u[0], v[0]);
  ans[1] = Math.max(u[1], v[1]);
  return ans;
}

/**
 * return solution to : [ u_0 , h] x = z_0
 *
 *                       [ u_1,  0] y = z_1
 */
function solve2by2UpperTriMatrix(u, h, z) {
  var aux = z[1] / u[1];
  return [aux, (-u[0] * aux + z[0]) / h];
}
/**
 * return solution to : [ u_0 , 0] x = z_0
 *
 *                       [ u_1,  w] y = z_1
 */
function solve2by2LowerTriMatrix(u, w, z) {
  var aux = z[0] / u[0];
  return [aux, (-u[1] * aux + z[1]) / w];
}

// Canvas
var Canvas = function (canvas) {
  this.canvas = canvas;
  this.ctx = canvas.getContext("2d");
  this.image = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
  // width * height * 4 array of integers
  this.imageData = this.image.data;
};

/**
 * Returns a two vector with Height as first coordinate and Width as second. [Height, Width].
 */
Canvas.prototype.getSize = function () {
  return [this.canvas.height, this.canvas.width];
};

/**
 *  Draw update image on canvas.
 */
Canvas.prototype.paintImage = function () {
  this.ctx.putImageData(this.image, 0, 0);
};

Canvas.prototype.getCanvas = function () {
  return this.canvas;
};

/**
 * Clear Image with @rgba color.
 *
 * @param rgba
 */
Canvas.prototype.clearImage = function (rgba) {
  this.useCanvasCtx((canvas) => {
    var size = canvas.getSize();
    canvas.ctx.fillStyle =
      "rgba(" + rgba[0] + "," + rgba[1] + "," + rgba[2] + "," + rgba[3] + ")";
    canvas.ctx.globalCompositeOperation = "source-over";
    canvas.ctx.fillRect(0, 0, size[1], size[0]);
  }, true);
};

Canvas.prototype.useCanvasCtx = function (lambda, isClearImage = false) {
  if (!isClearImage) {
    this.ctx.putImageData(this.image, 0, 0);
  }
  lambda(this);
  this.image = this.ctx.getImageData(
    0,
    0,
    this.canvas.width,
    this.canvas.height
  );
  this.imageData = this.image.data;
};

Canvas.prototype.getImageIndex = function (x) {
  return 4 * (this.canvas.width * x[0] + x[1]);
};

Canvas.prototype.getPxl = function (x) {
  var index = this.getImageIndex(x);
  return [
    this.imageData[index],
    this.imageData[index + 1],
    this.imageData[index + 2],
    this.imageData[index + 3],
  ];
};

Canvas.prototype.drawPxl = function (x, rgb) {
  var index = this.getImageIndex(x);
  this.imageData[index] = rgb[0];
  this.imageData[index + 1] = rgb[1];
  this.imageData[index + 2] = rgb[2];
  this.imageData[index + 3] = rgb[3];
};

/*
 * x1     :   2-dim array
 * x2     :   2-dim array
 * shader :   is a function that receives a 2-dim array and a line (array with 2 points) and returns a rgba 4-dim array
 */
Canvas.prototype.drawLine = function (x1, x2, shader) {
  // add points before clip
  shader.points = [x1, x2];

  // do clipping
  var stack = [];
  stack.push(x1);
  stack.push(x2);
  var inStack = [];
  var outStack = [];
  for (var i = 0; i < stack.length; i++) {
    var x = stack[i];
    if (
      0 <= x[0] &&
      x[0] < this.canvas.height &&
      0 <= x[1] &&
      x[1] < this.canvas.width
    ) {
      inStack.push(x);
    } else {
      outStack.push(x);
    }
  }
  // both points are inside canvas
  if (inStack.length == 2) {
    this.drawLineInt(inStack[0], inStack[1], shader);
    return;
  }
  //intersecting line with canvas
  var intersectionSolutions = [];
  var v = [x2[0] - x1[0], x2[1] - x1[1]];
  // Let s \in [0,1]
  // line intersection with [0, 0]^T + [H - 1, 0]^T s
  intersectionSolutions.push(
    solve2by2UpperTriMatrix(v, -(this.canvas.height - 1), [-x1[0], -x1[1]])
  );
  // line intersection with [H - 1, 0]^T + [0, W - 1]^T s
  intersectionSolutions.push(
    solve2by2LowerTriMatrix(v, -(this.canvas.width - 1), [
      this.canvas.height - 1 - x1[0],
      -x1[1],
    ])
  );
  // line intersection with [H - 1, W - 1]^T + [-(H - 1), 0]^T s
  intersectionSolutions.push(
    solve2by2UpperTriMatrix(v, this.canvas.height - 1, [
      this.canvas.height - 1 - x1[0],
      this.canvas.width - 1 - x1[1],
    ])
  );
  // line intersection with [0, W - 1]^T + [0, -(W - 1)]^T s
  intersectionSolutions.push(
    solve2by2LowerTriMatrix(v, this.canvas.width - 1, [
      -x1[0],
      this.canvas.width - 1 - x1[1],
    ])
  );

  var validIntersection = [];
  for (var i = 0; i < intersectionSolutions.length; i++) {
    var x = intersectionSolutions[i];
    if (0 <= x[0] && x[0] <= 1 && 0 <= x[1] && x[1] <= 1) {
      validIntersection.push(x);
    }
  }

  if (validIntersection.length == 0) return;

  //it can be shown that at this point there is at least one valid intersection.
  if (inStack.length > 0) {
    var p = [
      x1[0] + validIntersection[0][0] * v[0],
      x1[1] + validIntersection[0][0] * v[1],
    ];
    this.drawLineInt(inStack.pop(), p, shader);
    return;
  }

  var p0 = [
    x1[0] + validIntersection[0][0] * v[0],
    x1[1] + validIntersection[0][0] * v[1],
  ];
  for (var i = 1; i < validIntersection.length; i++) {
    var p = [
      x1[0] + validIntersection[i][0] * v[0],
      x1[1] + validIntersection[i][0] * v[1],
    ];
    var v = diff(p, p0);
    if (dot(v, v) > 1e-3) {
      this.drawLineInt(p0, p, shader);
      return;
    }
  }
  this.drawLineInt(p0, p0, shader);
};

Canvas.prototype.drawLineInt = function (x1, x2, shader) {
  x1 = floor(x1);
  x2 = floor(x2);

  var index = [-1, 0, 1];

  var n = index.length;
  var nn = n * n;

  var x = [];
  x[0] = x1[0];
  x[1] = x1[1];

  var tangent = diff(x2, x1);
  var normal = [];
  normal[0] = -tangent[1];
  normal[1] = tangent[0];

  shader(x, shader.points, this);

  while (x[0] !== x2[0] || x[1] !== x2[1]) {
    var fmin = Number.MAX_VALUE;
    var minDir = [];
    for (var k = 0; k < nn; k++) {
      var i = index[k % n];
      var j = index[Math.floor(k / n)];

      var nextX = add(x, [i, j]);

      var v = diff(nextX, x1);
      var f = Math.abs(dot(v, normal)) - dot(v, tangent);
      if (fmin > f) {
        fmin = f;
        minDir = [i, j];
      }
    }

    x = add(x, minDir);
    shader(x, shader.points, this);
  }
  shader(x, shader.points, this);
};

Canvas.prototype.drawPolygon = function (
  array,
  shader,
  isInsidePoly = Canvas.isInsidePolygon
) {
  let upperBox = [
    [Number.MAX_VALUE, Number.MAX_VALUE],
    [Number.MIN_VALUE, Number.MIN_VALUE],
  ];
  for (let i = 0; i < array.length; i++) {
    upperBox[0] = min(array[i], upperBox[0]);
    upperBox[1] = max(array[i], upperBox[1]);
  }

  let size = this.getSize();
  let clampedSize = diff(size, [1, 1]);
  let zeros = [0, 0];
  upperBox[0] = floor(min(clampedSize, max(zeros, upperBox[0])));
  upperBox[1] = floor(min(clampedSize, max(zeros, upperBox[1])));

  for (var i = upperBox[0][0]; i < upperBox[1][0]; i++) {
    for (var j = upperBox[0][1]; j < upperBox[1][1]; j++) {
      var x = [i, j];
      if (isInsidePoly(x, array)) {
        shader(x, array, this);
      }
    }
  }
};

/*
 * x1     :   2-dim array
 * x2     :   2-dim array
 * x3     :   2-dim array
 * shader :   is a function that receives a 2-dim array and a triangle (array with 3 points) and returns a rgba 4-dim array
 */
Canvas.prototype.drawTriangle = function (x1, x2, x3, shader) {
  var array = [x1, x2, x3];
  this.drawPolygon(array, shader, Canvas.isInsideConvex);
};

/* x1     :   2-dim array
 * x2     :   2-dim array
 * x3     :   2-dim array
 * x4     :   2-dim array
 * shader :   is a function that receives a 2-dim array and returns a rgba 4-dim array
 */
Canvas.prototype.drawQuad = function (x1, x2, x3, x4, shader) {
  this.drawPolygon([x1, x2, x3, x4], shader);
};

Canvas.prototype.drawImage = function (img, x) {
  if ("isReady" in img && !img.isReady) return;
  this.useCanvasCtx((canvas) => canvas.ctx.drawImage(img, x[1], x[0]));
};

Canvas.prototype.drawCircle = function (x, r, shader) {
  var corner = scale([1, 1], r);
  var upperBox = [diff(x, corner), add(x, corner)];
  var size = this.getSize();
  upperBox[0] = floor(min(diff(size, [1, 1]), max([0, 0], upperBox[0])));
  upperBox[1] = floor(min(diff(size, [1, 1]), max([0, 0], upperBox[1])));
  for (var i = upperBox[0][0]; i <= upperBox[1][0]; i++) {
    for (var j = upperBox[0][1]; j <= upperBox[1][1]; j++) {
      var p = [i, j];
      if (this.isInsideCircle(p, x, r)) {
        shader(p, [x, r], this);
      }
    }
  }
};

Canvas.prototype.isInsideCircle = function (p, x, r) {
  return squareNorm(diff(p, x)) <= r * r;
};

Canvas.prototype.addEventListener = function (key, lambda, useCapture) {
  this.canvas.addEventListener(key, lambda, useCapture);
};

Canvas.prototype.drawString = function (x, string, contextShader) {
  this.useCanvasCtx((canvas) => {
    contextShader(canvas.ctx);
    canvas.ctx.fillText(string, x[1], x[0]);
  });
};

// Static functions

// slower than isInsideConvex method
Canvas.isInsidePolygon = function (x, array) {
  var v = [];
  var theta = 0;
  var n = array.length;
  for (var i = 0; i < n; i++) {
    v[0] = diff(array[(i + 1) % n], x);
    v[1] = diff(array[i], x);
    theta += Math.acos(dot(v[0], v[1]) / (norm(v[0]) * norm(v[1])));
  }
  return Math.abs(theta - 2 * Math.PI) < 1e-3;
};

Canvas.isInsideConvex = function (x, array) {
  var m = array.length;
  var v = [];
  var vDotN = [];
  for (var i = 0; i < m; i++) {
    v[i] = diff(array[(i + 1) % m], array[i]);
    let n = [-v[i][1], v[i][0]];
    let r = diff(x, array[i]);
    vDotN[i] = dot(r, n);
  }
  let orientation = v[0][0] * v[1][1] - v[0][1] * v[1][0] > 0 ? 1 : -1;
  for (var i = 0; i < m; i++) {
    var myDot = vDotN[i] * orientation;
    if (myDot < 0) return false;
  }
  return true;
};

Canvas.simpleShader = function (color) {
  return (x, element, canvas) => canvas.drawPxl(x, color);
};

Canvas.colorShader = function (colors) {
  var auxShader = (x, poly, canvas, alpha) => {
    var interpolateColors = [0, 0, 0, 0];
    for (var i = 0; i < poly.length; i++) {
      interpolateColors[0] = interpolateColors[0] + colors[i][0] * alpha[i];
      interpolateColors[1] = interpolateColors[1] + colors[i][1] * alpha[i];
      interpolateColors[2] = interpolateColors[2] + colors[i][2] * alpha[i];
      interpolateColors[3] = interpolateColors[3] + colors[i][3] * alpha[i];
    }
    canvas.drawPxl(x, interpolateColors);
  };
  return Canvas.interpolateTriangleShader(auxShader);
};

Canvas.interpolateQuadShader = function (shader) {
  return function (x, quad, canvas) {
    var t1 = [quad[0], quad[1], quad[2]];
    var t2 = [quad[2], quad[3], quad[0]];
    var alpha = Canvas.triangleBaryCoord(x, t1);
    if (
      alpha[0] > 0 &&
      alpha[1] > 0 &&
      alpha[2] > 0 &&
      Math.abs(alpha[0] + alpha[1] + alpha[2] - 1) < 1e-10
    ) {
      shader(x, quad, canvas, [alpha[0], alpha[1], alpha[2], 0]);
    } else {
      alpha = Canvas.triangleBaryCoord(x, t2);
      shader(x, quad, canvas, [alpha[2], 0, alpha[0], alpha[1]]);
    }
  };
};

Canvas.interpolateTriangleShader = function (shader) {
  return (x, triangle, canvas) => {
    const alpha = Canvas.triangleBaryCoord(x, triangle);
    shader(x, triangle, canvas, alpha);
  };
};

Canvas.interpolateLineShader = function (shader) {
  return (x, line, canvas) => {
    var v = diff(line[1], line[0]);
    var z = diff(x, line[0]);
    var vnorm = squareNorm(v);
    var projection = dot(z, v);
    var t = vnorm == 0.0 ? 0 : projection / vnorm;
    shader(x, line, canvas, t);
  };
};

/**
 * img: html loaded image.
 * quadTexCoord: [0, 1]^{2 * 4}, texture coordinates
 */
Canvas.quadTextureShader = function (
  img,
  quadTexCoord,
  interpolation = Canvas.bilinearInterpolation
) {
  let imageCache = null;
  const imageShader = (x, quad, canvas, alpha) => {
    if (!img.isReady || imageCache == null)
      imageCache = new Canvas(ImageIO.getImageCanvas(img));
    const imageCanvas = imageCache;
    const imgSize = imageCanvas.getSize();
    const interpolateTexCoord = [0, 0];
    for (let i = 0; i < quadTexCoord.length; i++) {
      interpolateTexCoord[0] =
        interpolateTexCoord[0] + quadTexCoord[i][0] * alpha[i];
      interpolateTexCoord[1] =
        interpolateTexCoord[1] + quadTexCoord[i][1] * alpha[i];
    }
    var i = [
      (1 - interpolateTexCoord[1]) * (imgSize[1] - 1),
      (imgSize[0] - 1) * interpolateTexCoord[0],
    ];
    // bound coordinates
    i = max([0, 0], min(diff([imgSize[0], imgSize[1]], [1, 1]), i));
    // pxl lower corner
    var j = floor(i);
    var cornerColors = [
      imageCanvas.getPxl(j),
      imageCanvas.getPxl(add(j, [1, 0])),
      imageCanvas.getPxl(add(j, [1, 1])),
      imageCanvas.getPxl(add(j, [0, 1])),
    ];
    var finalColor = interpolation(cornerColors, diff(i, j));
    canvas.drawPxl(x, finalColor);
  };
  return Canvas.interpolateQuadShader(imageShader);
};

Canvas.triangleCache = (() => {
  const hashMap = [];
  const size = 3;
  return {
    constains: (triangleHash) => hashMap[triangleHash % size] != undefined,
    get: (triangleHash) => hashMap[triangleHash % size],
    set: (triangleHash, value) => (hashMap[triangleHash % size] = value),
  };
})(); //{triangle: null, u: [], v:[], det:null, hash:null}

Canvas.triangleHash = (triangle) => {
  const array = [
    triangle[0][0],
    triangle[1][0],
    triangle[2][0],
    triangle[0][1],
    triangle[1][1],
    triangle[2][1],
  ];
  return array.reduce((h, x) => 31 * h + x, 1);
};

Canvas.triangleBaryCoord = function (x, triangle) {
  const hash = Canvas.triangleHash(triangle);
  const y = [x[0] - triangle[0][0], x[1] - triangle[0][1]];
  if (!Canvas.triangleCache.constains(hash)) {
    const u = [
      triangle[1][0] - triangle[0][0],
      triangle[1][1] - triangle[0][1],
    ];
    const v = [
      triangle[2][0] - triangle[0][0],
      triangle[2][1] - triangle[0][1],
    ];
    const det = u[0] * v[1] - u[1] * v[0];
    Canvas.triangleCache.set(hash, {
      triangle: triangle,
      u: u.map((x) => x / det),
      v: v.map((x) => x / det),
      det: det,
      hash: hash,
    });
  }
  const cache = Canvas.triangleCache.get(hash);
  const u = cache.u;
  const v = cache.v;
  const det = cache.det;
  if (det == 0) return [0, 0, 0];
  var alpha = [v[1] * y[0] - v[0] * y[1], u[0] * y[1] - u[1] * y[0]];
  return [1 - alpha[0] - alpha[1], alpha[0], alpha[1]];
};

/**
 * values \in R^{k * 4}
 * x \in [0,1]^2
 */
Canvas.bilinearInterpolation = function (values, x) {
  var acc = [];
  for (var k = 0; k < values.length; k++) {
    var f03 = values[0][k] + (values[3][k] - values[0][k]) * x[1];
    var f12 = values[1][k] + (values[2][k] - values[1][k]) * x[1];
    var f = f03 + (f12 - f03) * x[0];
    acc.push(f);
  }
  return acc;
};
/**
 * size: is an array with width and height of a HTML5 Canvas.
 * domId: DOM element where the canvas will be added
 *
 * returns Canvas object from the generated html canvas.
 */
Canvas.createCanvas = function (size, domId) {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("width", size[0]);
  canvas.setAttribute("height", size[1]);
  document.getElementById(domId).appendChild(canvas);
  return canvas;
};

export default Canvas;
