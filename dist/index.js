(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Tela"] = factory();
	else
		root["Tela"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/Animator/main/Animator.js":
/*!***************************************!*\
  !*** ./src/Animator/main/Animator.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Animator)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");


var Animator = /*#__PURE__*/function () {
  function Animator(state, next, doWhile) {
    (0,_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, Animator);
    this.state = state;
    this.next = next;
    this["while"] = doWhile;
    this.requestAnimeId = null;
  }
  (0,_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(Animator, [{
    key: "play",
    value: function play() {
      var _this = this;
      this.requestAnimeId = requestAnimationFrame(function () {
        if (!_this["while"](_this.state)) return _this.stop();
        _this.state = _this.next(_this.state);
        _this.play();
      });
      return this;
    }
  }, {
    key: "run",
    value: function run() {
      while (this["while"](this.state)) {
        this.state = this.next(this.state);
      }
      return this;
    }
  }, {
    key: "stop",
    value: function stop() {
      cancelAnimationFrame(this.requestAnimeId);
      return this;
    }
  }], [{
    key: "builder",
    value: function builder() {
      return new AnimatorBuilder();
    }
  }]);
  return Animator;
}();

var AnimatorBuilder = /*#__PURE__*/function () {
  function AnimatorBuilder() {
    (0,_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, AnimatorBuilder);
    this._state = null;
    this._next = null;
    this._end = null;
  }
  (0,_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(AnimatorBuilder, [{
    key: "initialState",
    value: function initialState(state) {
      this._state = state;
      return this;
    }
  }, {
    key: "nextState",
    value: function nextState(next) {
      this._next = next;
      return this;
    }
  }, {
    key: "while",
    value: function _while(end) {
      this._end = end;
      return this;
    }
  }, {
    key: "build",
    value: function build() {
      var someAreEmpty = [this._state, this._next, this._end].some(function (x) {
        return x === null || x === undefined;
      });
      if (someAreEmpty) throw new Error("Animator properties are missing");
      return new Animator(this._state, this._next, this._end);
    }
  }]);
  return AnimatorBuilder;
}();

/***/ }),

/***/ "./src/BBox/main/BBox.js":
/*!*******************************!*\
  !*** ./src/BBox/main/BBox.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ BBox)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _Matrix_main_Matrix__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../Matrix/main/Matrix */ "./src/Matrix/main/Matrix.js");



var _class;

var BBox = /*#__PURE__*/function () {
  function BBox(min, max) {
    (0,_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, BBox);
    (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "union", this.add);
    (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "inter", this.sub);
    this.isEmpty = min === undefined || max === undefined;
    if (this.isEmpty) return this;
    this.min = min.op(max, Math.min);
    this.max = max.op(min, Math.max);
    this.center = min.add(max).scale(1 / 2);
    this.diagonal = max.sub(min);
  }
  /**
   * Union of boxes
   * @param {*} box
   */
  (0,_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(BBox, [{
    key: "add",
    value: function add(box) {
      if (this === BBox.EMPTY) return box;
      var min = this.min,
        max = this.max;
      return new BBox(min.op(box.min, Math.min), max.op(box.max, Math.max));
    }
  }, {
    key: "sub",
    value:
    /**
     * Intersection of boxes
     * @param {*} box
     */
    function sub(box) {
      if (this === BBox.EMPTY) return BBox.EMPTY;
      var min = this.min,
        max = this.max;
      var newMin = min.op(box.min, Math.max);
      var newMax = max.op(box.max, Math.min);
      var newDiag = newMax.sub(newMin);
      var isAllPositive = newDiag.data.every(function (x) {
        return x >= 0;
      });
      return !isAllPositive ? BBox.EMPTY : new BBox(newMin, newMax);
    }
  }, {
    key: "move",
    value: function move(vector) {
      return new BBox(this.min.add(vector), this.max.add(vector));
    }
  }, {
    key: "collidesWith",
    value: function collidesWith(box) {
      var _this = this;
      var actionByTypes = [{
        type: BBox,
        action: function action() {
          return !_this.sub(box).isEmpty;
        }
      }, {
        type: _Matrix_main_Matrix__WEBPACK_IMPORTED_MODULE_3__["default"],
        action: function action() {
          return !_this.sub(new BBox(box, box)).isEmpty;
        }
      }];
      for (var i = 0; i < actionByTypes.length; i++) {
        if (box instanceof actionByTypes[i].type) {
          return actionByTypes[i].action();
        }
      }
    }
  }, {
    key: "equals",
    value: function equals(box) {
      if (!(box instanceof BBox)) return false;
      if (this == BBox.EMPTY) return true;
      return this.min.equals(box.min) && this.max.equals(box.max);
    }
  }], [{
    key: "ofPoint",
    value: function ofPoint() {
      var point = _Matrix_main_Matrix__WEBPACK_IMPORTED_MODULE_3__["default"].vec.apply(_Matrix_main_Matrix__WEBPACK_IMPORTED_MODULE_3__["default"], arguments);
      return new BBox(point, point);
    }
  }]);
  return BBox;
}();
_class = BBox;
(0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(BBox, "EMPTY", new _class());


/***/ }),

/***/ "./src/Canvas/main/Canvas.js":
/*!***********************************!*\
  !*** ./src/Canvas/main/Canvas.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CanvasBuilder: () => (/* binding */ CanvasBuilder),
/* harmony export */   "default": () => (/* binding */ Canvas)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/toConsumableArray */ "./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js");
/* harmony import */ var _babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/slicedToArray */ "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var _babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _Color_main_Color__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../Color/main/Color */ "./src/Color/main/Color.js");
/* harmony import */ var _Matrix_main_Matrix__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../Matrix/main/Matrix */ "./src/Matrix/main/Matrix.js");
/* harmony import */ var _BBox_main_BBox__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../BBox/main/BBox */ "./src/BBox/main/BBox.js");








var vec2 = _Matrix_main_Matrix__WEBPACK_IMPORTED_MODULE_6__["default"].vec2;
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
/*

The point xe_1 + ye_2 corresponds to a point in the middle of a pxl.

The canvas data is an array of length colors(C) * width(W) * height(H). Is a 3D-array.
The index is a number in [0, C * W * H - 1].
Having (x, y, z) where z is the color axis, the formula to index the array is :

f(x, y, z) = C * W * x + C * y + z.

Where x in [0, H - 1], y in [0, W - 1] and z in [0, C - 1].

Note that f(H - 1, W - 1, C - 1) = C * W * H - 1.
*/
var Canvas = /*#__PURE__*/function () {
  /**
   *
   * @param {canvasDOM} canvas: DOM element of type canvas
   */
  function Canvas(canvas) {
    (0,_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_2__["default"])(this, Canvas);
    (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_4__["default"])(this, "getDom", this.getCanvas);
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", {
      willReadFrequently: true
    });
    this.image = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
    // width * height * 4 array of integers
    this.data = this.image.data;
  }
  (0,_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_3__["default"])(Canvas, [{
    key: "getCanvas",
    value: function getCanvas() {
      return this.canvas;
    }
  }, {
    key: "width",
    get: function get() {
      return this.canvas.width;
    }
  }, {
    key: "height",
    get: function get() {
      return this.canvas.height;
    }
    //========================================================================================
    /*                                                                                      *
     *                                 side effects function                                *
     *                                                                                      */
    //========================================================================================

    /**
     * Update color of canvas
     * @param {Color} color
     * @returns {Canvas}
     */
  }, {
    key: "fill",
    value: function fill() {
      var color = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _Color_main_Color__WEBPACK_IMPORTED_MODULE_5__["default"].ofRGBARaw(255, 255, 255);
      this.ctx.fillStyle = "rgba(".concat(color.red, ", ").concat(color.green, ", ").concat(color.blue, ", ").concat(color.alpha / 255.0, ")");
      console.log(this.ctx.fillStyle);
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.image = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      this.data = this.image.data;
      return this;
    }

    /**
     *
     * @param {(Color, Number, Number) => Color} lambda
     * @returns {Canvas}
     */
  }, {
    key: "map",
    value: function map() {
      var lambda = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
      var n = this.data.length;
      var w = this.canvas.width;
      for (var i = 0; i < n; i += 4) {
        var x = Math.floor(i / (4 * w));
        var y = Math.floor(i / 4) % w;
        var color = lambda(_Color_main_Color__WEBPACK_IMPORTED_MODULE_5__["default"].ofRGBARaw(this.data[i], this.data[i + 1], this.data[i + 2], this.data[i + 3]), x, y);
        this.data[i] = color.red;
        this.data[i + 1] = color.green;
        this.data[i + 2] = color.blue;
        this.data[i + 3] = color.alpha;
      }
      return this;
    }

    /**
     * Return pxl color at (i,j)
     * @param {Number} i: integer \in [0,H-1]
     * @param {Number} j: integer \in [0,W-1]
     * @returns {Color}
     */
  }, {
    key: "getPxl",
    value: function getPxl(i, j) {
      var _this$canvas = this.canvas,
        width = _this$canvas.width,
        height = _this$canvas.height;
      if (i < 0 || i >= height || j < 0 || j >= width) return undefined;
      var index = 4 * (i * width + j);
      return _Color_main_Color__WEBPACK_IMPORTED_MODULE_5__["default"].ofRGBARaw(this.imgBuffer[index], this.imgBuffer[index + 1], this.imgBuffer[index + 2], this.imgBuffer[index + 3]);
    }
    /**
     * Set pxl color at (i,j)
     * @param {Number} i: integer \in [0,H-1]
     * @param {Number} j: integer \in [0,W-1]
     * @param {Color} color
     */
  }, {
    key: "setPxl",
    value: function setPxl(i, j, color) {
      var _this$canvas2 = this.canvas,
        width = _this$canvas2.width,
        height = _this$canvas2.height;
      if (i < 0 || i >= height || j < 0 || j >= width) return this;
      var index = 4 * (i * width + j);
      this.data[index] = color.red;
      this.data[index + 1] = color.green;
      this.data[index + 2] = color.blue;
      this.data[index + 3] = color.alpha;
      return this;
    }

    /**
     *
     * @param {Array<Number>} start: 2-Array
     * @param {Array<Number>} end: 2-Array
     * @param {Canvas}
     */
  }, {
    key: "drawLine",
    value: function drawLine(start, end) {
      var shader = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (x, y) {
        return _Color_main_Color__WEBPACK_IMPORTED_MODULE_5__["default"].ofRGBA(0, 0, 0);
      };
      // faster than using vec2
      var _this$canvas3 = this.canvas,
        width = _this$canvas3.width,
        _ = _this$canvas3._;
      var line = this._clipLine(start, end).map(function (x) {
        return x.toArray();
      });
      if (line.length === 0) return;
      var _line = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(line, 2),
        p0 = _line[0],
        p1 = _line[1];
      var v = [p1[0] - p0[0], p1[1] - p0[1]];
      var n = Math.abs(v[0]) + Math.abs(v[1]);
      for (var k = 0; k < n; k++) {
        var s = k / n;
        var x = [p0[0] + v[0] * s, p0[1] + v[1] * s].map(Math.floor);
        var _x = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(x, 2),
          i = _x[0],
          j = _x[1];
        var index = 4 * (i * width + j);
        var color = shader(i, j);
        this.data[index] = color.red;
        this.data[index + 1] = color.green;
        this.data[index + 2] = color.blue;
        this.data[index + 3] = color.alpha;
      }
      return this;
    }

    /**
     *
     * @param {Array<Number>} p0 : 2-array<number>
     * @param {Array<Number>} p1 : 2-array<number>
     * @param {Array<Number>} p2 : 2-array<number>
     * @param {(Number, Number) => Color} shader : (number, number) => Color
     * @returns
     */
  }, {
    key: "drawTriangle",
    value: function drawTriangle(p0, p1, p2) {
      var shader = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function (x, y) {
        return _Color_main_Color__WEBPACK_IMPORTED_MODULE_5__["default"].ofRGBA(0, 0, 0);
      };
      return this._drawConvexPolygon([p0, p1, p2], shader);
    }
  }, {
    key: "paint",
    value: function paint() {
      this.ctx.putImageData(this.image, 0, 0);
    }

    //========================================================================================
    /*                                                                                      *
     *                                  Auxiliary functions                                  *
     *                                                                                      */
    //========================================================================================

    /**
     *
     * @param {*} arrayOfPoints : Array<2-Array<Number>>
     * @param {*} shader : (x,y) => color
     * @returns
     */
  }, {
    key: "_drawConvexPolygon",
    value: function _drawConvexPolygon(arrayOfPoints, shader) {
      var _this$canvas4 = this.canvas,
        width = _this$canvas4.width,
        height = _this$canvas4.height;
      var canvasBox = new _BBox_main_BBox__WEBPACK_IMPORTED_MODULE_7__["default"](vec2.ZERO, vec2.of(height, width));
      var boundingBox = _BBox_main_BBox__WEBPACK_IMPORTED_MODULE_7__["default"].EMPTY;
      arrayOfPoints.forEach(function (x) {
        boundingBox = boundingBox.add(_BBox_main_BBox__WEBPACK_IMPORTED_MODULE_7__["default"].ofPoint.apply(_BBox_main_BBox__WEBPACK_IMPORTED_MODULE_7__["default"], (0,_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__["default"])(x)));
      });
      var finalBox = canvasBox.inter(boundingBox);
      var _finalBox$min$toArray = finalBox.min.toArray(),
        _finalBox$min$toArray2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_finalBox$min$toArray, 2),
        xMin = _finalBox$min$toArray2[0],
        yMin = _finalBox$min$toArray2[1];
      var _finalBox$max$toArray = finalBox.max.toArray(),
        _finalBox$max$toArray2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_finalBox$max$toArray, 2),
        xMax = _finalBox$max$toArray2[0],
        yMax = _finalBox$max$toArray2[1];
      for (var i = xMin; i < xMax; i++) {
        for (var j = yMin; j < yMax; j++) {
          if (this._isInsideConvex([i, j], arrayOfPoints)) {
            var color = shader(i, j);
            var index = 4 * (i * width + j);
            this.data[index] = color.red;
            this.data[index + 1] = color.green;
            this.data[index + 2] = color.blue;
            this.data[index + 3] = color.alpha;
          }
        }
      }
      return this;
    }

    /**
     *
     * @param {*} x: 2-Array<Number>
     * @param {*} points: Array<2-Array<Number>>
     * @returns
     */
  }, {
    key: "_isInsideConvex",
    value: function _isInsideConvex(x, points) {
      var m = points.length;
      var v = [];
      var vDotN = [];
      for (var i = 0; i < m; i++) {
        var p1 = points[(i + 1) % m];
        var p0 = points[i];
        v[i] = [p1[0] - p0[0], p1[1] - p0[1]];
        var vi = v[i];
        var n = [-vi[1], vi[0]];
        var r = [x[0] - p0[0], x[1] - p0[1]];
        vDotN[i] = r[0] * n[0] + r[1] * n[1];
      }
      var orientation = v[0][0] * v[1][1] - v[0][1] * v[1][0] >= 0 ? 1 : -1;
      for (var _i = 0; _i < m; _i++) {
        var myDot = vDotN[_i] * orientation;
        if (myDot < 0) return false;
      }
      return true;
    }

    /**
     *
     * @param {*} start: 2-Array<Number>
     * @param {*} end: 2-Array<Number>
     * @returns 2-Array<2-Array<Number>>
     */
  }, {
    key: "_clipLine",
    value: function _clipLine(start, end) {
      var _this$canvas5 = this.canvas,
        width = _this$canvas5.width,
        height = _this$canvas5.height;
      var bbox = new _BBox_main_BBox__WEBPACK_IMPORTED_MODULE_7__["default"](vec2.ZERO, vec2.of(height, width));
      var pointStack = [start, end].map(function (x) {
        return vec2.of.apply(vec2, (0,_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__["default"])(x));
      });
      var inStack = [];
      var outStack = [];
      for (var i = 0; i < pointStack.length; i++) {
        var p = pointStack[i];
        if (bbox.collidesWith(p)) {
          inStack.push(p);
        } else {
          outStack.push(p);
        }
      }
      // both points are inside
      if (inStack.length >= 2) {
        return inStack;
      }
      // one of them is inside
      if (inStack.length === 1) {
        var inPoint = inStack[0];
        var outPoint = outStack[0];
        return [inPoint].concat((0,_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__["default"])(this._getLineCanvasIntersection(inPoint, outPoint)));
      }
      // both points are outside,need to intersect the boundary
      return this._getLineCanvasIntersection.apply(this, outStack);
    }

    /**
     *
     * @param {*} start: vec2(matrix)
     * @param {*} end: vec2(matrix)
     */
  }, {
    key: "_getLineCanvasIntersection",
    value: function _getLineCanvasIntersection(start, end) {
      var _this = this;
      var _this$canvas6 = this.canvas,
        width = _this$canvas6.width,
        height = _this$canvas6.height;
      var v = end.sub(start);
      // point and direction of boundary
      var boundary = [[vec2.ZERO, vec2.of(height, 0)], [vec2.of(height, 0), vec2.of(0, width)], [vec2.of(height, width), vec2.of(-height, 0)], [vec2.of(0, width), vec2.of(0, -width)]];
      var intersectionSolutions = [];
      boundary.forEach(function (_ref) {
        var _ref2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(_ref, 2),
          s = _ref2[0],
          d = _ref2[1];
        if (d.get(0) === 0) {
          var solution = _this._solveLowTriMatrix(v, -d.get(1), s.sub(start));
          solution !== undefined && intersectionSolutions.push(solution);
        } else {
          var _solution = _this._solveUpTriMatrix(v, -d.get(0), s.sub(start));
          _solution !== undefined && intersectionSolutions.push(_solution);
        }
      });
      var validIntersections = [];
      intersectionSolutions.forEach(function (solution) {
        var _ref3 = [solution.get(0), solution.get(1)],
          x = _ref3[0],
          y = _ref3[1];
        if (0 <= x && x <= 1 && 0 <= y && y <= 1) {
          validIntersections.push(solution);
        }
      });
      if (validIntersections.length === 0) return [];
      return validIntersections.map(function (solution) {
        var t = solution.get(0);
        return start.add(v.scale(t));
      });
    }

    /**
     *
     * @param {*} v: vec2
     * @param {*} a: number
     * @param {*} f: vec2
     * @returns vec2
     */
  }, {
    key: "_solveLowTriMatrix",
    value: function _solveLowTriMatrix(v, a, f) {
      var v1 = v.get(0);
      var v2 = v.get(1);
      var av1 = a * v1;
      if (av1 === 0 || v1 === 0) return undefined;
      var f1 = f.get(0);
      var f2 = f.get(1);
      return vec2.of(f1 / v1, (f2 * v1 - v2 * f1) / av1);
    }

    /**
     *
     * @param {*} v: vec2
     * @param {*} a: number
     * @param {*} f: vec2
     * @returns vec2
     */
  }, {
    key: "_solveUpTriMatrix",
    value: function _solveUpTriMatrix(v, a, f) {
      var v1 = v.get(0);
      var v2 = v.get(1);
      var av2 = a * v2;
      if (av2 === 0 || v2 === 0) return undefined;
      var f1 = f.get(0);
      var f2 = f.get(1);
      return vec2.of(f2 / v2, (f1 * v2 - v1 * f2) / av2);
    }

    //========================================================================================
    /*                                                                                      *
     *                                   Static functions                                   *
     *                                                                                      */
    //========================================================================================
  }], [{
    key: "builder",
    value: function builder() {
      return new CanvasBuilder();
    }
  }]);
  return Canvas;
}();

var CanvasBuilder = /*#__PURE__*/function () {
  function CanvasBuilder() {
    (0,_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_2__["default"])(this, CanvasBuilder);
    (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_4__["default"])(this, "_canvas", document.createElement("canvas"));
    (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_4__["default"])(this, "_width", 500);
    (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_4__["default"])(this, "_height", 500);
  }
  (0,_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_3__["default"])(CanvasBuilder, [{
    key: "width",
    value: function width() {
      var _width = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this._width;
      this._width = _width;
      return this;
    }
  }, {
    key: "height",
    value: function height() {
      var _height = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this._height;
      this._height = _height;
      return this;
    }
  }, {
    key: "build",
    value: function build() {
      this._canvas.setAttribute("width", this._width);
      this._canvas.setAttribute("height", this._height);
      return new Canvas(this._canvas);
    }
  }]);
  return CanvasBuilder;
}();

/***/ }),

/***/ "./src/Canvas2d/main/Canvas2d.js":
/*!***************************************!*\
  !*** ./src/Canvas2d/main/Canvas2d.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Canvas2dBuilder: () => (/* binding */ Canvas2dBuilder),
/* harmony export */   "default": () => (/* binding */ Canvas2d)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/assertThisInitialized */ "./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js");
/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/toConsumableArray */ "./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js");
/* harmony import */ var _babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/esm/slicedToArray */ "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var _babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/esm/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_esm_get__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @babel/runtime/helpers/esm/get */ "./node_modules/@babel/runtime/helpers/esm/get.js");
/* harmony import */ var _babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @babel/runtime/helpers/esm/inherits */ "./node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @babel/runtime/helpers/esm/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @babel/runtime/helpers/esm/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _BBox_main_BBox__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../BBox/main/BBox */ "./src/BBox/main/BBox.js");
/* harmony import */ var _Canvas_main_Canvas__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../Canvas/main/Canvas */ "./src/Canvas/main/Canvas.js");
/* harmony import */ var _Matrix_main_Matrix__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../Matrix/main/Matrix */ "./src/Matrix/main/Matrix.js");










function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0,_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_9__["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0,_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_9__["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0,_babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_8__["default"])(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }



var vec2 = _Matrix_main_Matrix__WEBPACK_IMPORTED_MODULE_12__["default"].vec2;
var Canvas2d = /*#__PURE__*/function (_Canvas) {
  (0,_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_7__["default"])(Canvas2d, _Canvas);
  var _super = _createSuper(Canvas2d);
  function Canvas2d(canvas, camera) {
    var _this;
    (0,_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_4__["default"])(this, Canvas2d);
    _this = _super.call(this, canvas);
    _this.camera = camera;
    return _this;
  }
  (0,_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_5__["default"])(Canvas2d, [{
    key: "setCamera",
    value: function setCamera(bbox) {
      this.camera = bbox;
    }
  }, {
    key: "map",
    value: function map() {
      var _this2 = this;
      var lambda = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
      return (0,_babel_runtime_helpers_esm_get__WEBPACK_IMPORTED_MODULE_6__["default"])((0,_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_9__["default"])(Canvas2d.prototype), "map", this).call(this, function (c, i, j) {
        var _this2$forwardCoord = _this2.forwardCoord(i, j),
          _this2$forwardCoord2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_3__["default"])(_this2$forwardCoord, 2),
          x = _this2$forwardCoord2[0],
          y = _this2$forwardCoord2[1];
        return lambda(c, x, y);
      });
    }
  }, {
    key: "getPxl",
    value: function getPxl(x, y) {
      var _this$inverseCoord = this.inverseCoord(x, y),
        _this$inverseCoord2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_3__["default"])(_this$inverseCoord, 2),
        i = _this$inverseCoord2[0],
        j = _this$inverseCoord2[1];
      return (0,_babel_runtime_helpers_esm_get__WEBPACK_IMPORTED_MODULE_6__["default"])((0,_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_9__["default"])(Canvas2d.prototype), "getPxl", this).call(this, i, j);
    }
  }, {
    key: "setPxl",
    value: function setPxl(x, y, color) {
      var _this$inverseCoord3 = this.inverseCoord(x, y),
        _this$inverseCoord4 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_3__["default"])(_this$inverseCoord3, 2),
        i = _this$inverseCoord4[0],
        j = _this$inverseCoord4[1];
      return (0,_babel_runtime_helpers_esm_get__WEBPACK_IMPORTED_MODULE_6__["default"])((0,_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_9__["default"])(Canvas2d.prototype), "setPxl", this).call(this, i, j, color);
    }
  }, {
    key: "drawLine",
    value: function drawLine(start, end, shader) {
      var startPos = this.inverseCoord.apply(this, (0,_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_2__["default"])(start));
      var endPos = this.inverseCoord.apply(this, (0,_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_2__["default"])(end));
      return (0,_babel_runtime_helpers_esm_get__WEBPACK_IMPORTED_MODULE_6__["default"])((0,_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_9__["default"])(Canvas2d.prototype), "drawLine", this).call(this, startPos, endPos, shader);
    }
  }, {
    key: "drawTriangle",
    value: function drawTriangle(p0, p1, p2, shader) {
      var q0 = this.inverseCoord.apply(this, (0,_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_2__["default"])(p0));
      var q1 = this.inverseCoord.apply(this, (0,_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_2__["default"])(p1));
      var q2 = this.inverseCoord.apply(this, (0,_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_2__["default"])(p2));
      return (0,_babel_runtime_helpers_esm_get__WEBPACK_IMPORTED_MODULE_6__["default"])((0,_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_9__["default"])(Canvas2d.prototype), "drawTriangle", this).call(this, q0, q1, q2, shader);
    }

    /**
     * Map from camera coord to canvas coord
     */
  }, {
    key: "inverseCoord",
    value: function inverseCoord(x, y) {
      var _this$camera = this.camera,
        min = _this$camera.min,
        max = _this$camera.max;
      var _this$canvas = this.canvas,
        width = _this$canvas.width,
        height = _this$canvas.height;
      var _min$data = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_3__["default"])(min.data, 2),
        minX = _min$data[0],
        minY = _min$data[1];
      var _max$data = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_3__["default"])(max.data, 2),
        maxX = _max$data[0],
        maxY = _max$data[1];
      return [-(y - maxY) * (height - 1) / (maxY - minY), (x - minX) * (width - 1) / (maxX - minX)].map(Math.floor);
    }

    /**
     * Map from canvas coord to camera coord
     */
  }, {
    key: "forwardCoord",
    value: function forwardCoord(i, j) {
      var _this$camera2 = this.camera,
        min = _this$camera2.min,
        max = _this$camera2.max;
      var _this$canvas2 = this.canvas,
        width = _this$canvas2.width,
        height = _this$canvas2.height;
      var _min$data2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_3__["default"])(min.data, 2),
        minX = _min$data2[0],
        minY = _min$data2[1];
      var _max$data2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_3__["default"])(max.data, 2),
        maxX = _max$data2[0],
        maxY = _max$data2[1];
      return [minX + (maxX - minX) * j / (width - 1), maxY + (minY - maxY) * i / (height - 1)];
    }
  }], [{
    key: "builder",
    value: function builder() {
      return new Canvas2dBuilder();
    }
  }]);
  return Canvas2d;
}(_Canvas_main_Canvas__WEBPACK_IMPORTED_MODULE_11__["default"]);

var Canvas2dBuilder = /*#__PURE__*/function (_CanvasBuilder) {
  (0,_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_7__["default"])(Canvas2dBuilder, _CanvasBuilder);
  var _super2 = _createSuper(Canvas2dBuilder);
  function Canvas2dBuilder() {
    var _this3;
    (0,_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_4__["default"])(this, Canvas2dBuilder);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this3 = _super2.call.apply(_super2, [this].concat(args));
    (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__["default"])((0,_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_0__["default"])(_this3), "_camera", new _BBox_main_BBox__WEBPACK_IMPORTED_MODULE_10__["default"](vec2.of(-1, -1), vec2.of(1, 1)));
    return _this3;
  }
  (0,_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_5__["default"])(Canvas2dBuilder, [{
    key: "camera",
    value: function camera() {
      var bbox = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this._camera;
      this._camera = bbox;
      return this;
    }
  }, {
    key: "build",
    value: function build() {
      var canvasBase = (0,_babel_runtime_helpers_esm_get__WEBPACK_IMPORTED_MODULE_6__["default"])((0,_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_9__["default"])(Canvas2dBuilder.prototype), "build", this).call(this);
      return new Canvas2d(canvasBase.canvas, this._camera);
    }
  }]);
  return Canvas2dBuilder;
}(_Canvas_main_Canvas__WEBPACK_IMPORTED_MODULE_11__.CanvasBuilder);

/***/ }),

/***/ "./src/Canvas_old/main/Canvas.js":
/*!***************************************!*\
  !*** ./src/Canvas_old/main/Canvas.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ImageIO__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ImageIO */ "./src/Canvas_old/main/ImageIO.js");

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
var Canvas = function Canvas(canvas) {
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
  this.useCanvasCtx(function (canvas) {
    var size = canvas.getSize();
    canvas.ctx.fillStyle = "rgba(" + rgba[0] + "," + rgba[1] + "," + rgba[2] + "," + rgba[3] + ")";
    canvas.ctx.globalCompositeOperation = "source-over";
    canvas.ctx.fillRect(0, 0, size[1], size[0]);
  }, true);
};
Canvas.prototype.useCanvasCtx = function (lambda) {
  var isClearImage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  if (!isClearImage) {
    this.ctx.putImageData(this.image, 0, 0);
  }
  lambda(this);
  this.image = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  this.imageData = this.image.data;
};
Canvas.prototype.getImageIndex = function (x) {
  return 4 * (this.canvas.width * x[0] + x[1]);
};
Canvas.prototype.getPxl = function (x) {
  var index = this.getImageIndex(x);
  return [this.imageData[index], this.imageData[index + 1], this.imageData[index + 2], this.imageData[index + 3]];
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
    if (0 <= x[0] && x[0] < this.canvas.height && 0 <= x[1] && x[1] < this.canvas.width) {
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
  intersectionSolutions.push(solve2by2UpperTriMatrix(v, -(this.canvas.height - 1), [-x1[0], -x1[1]]));
  // line intersection with [H - 1, 0]^T + [0, W - 1]^T s
  intersectionSolutions.push(solve2by2LowerTriMatrix(v, -(this.canvas.width - 1), [this.canvas.height - 1 - x1[0], -x1[1]]));
  // line intersection with [H - 1, W - 1]^T + [-(H - 1), 0]^T s
  intersectionSolutions.push(solve2by2UpperTriMatrix(v, this.canvas.height - 1, [this.canvas.height - 1 - x1[0], this.canvas.width - 1 - x1[1]]));
  // line intersection with [0, W - 1]^T + [0, -(W - 1)]^T s
  intersectionSolutions.push(solve2by2LowerTriMatrix(v, this.canvas.width - 1, [-x1[0], this.canvas.width - 1 - x1[1]]));
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
    var p = [x1[0] + validIntersection[0][0] * v[0], x1[1] + validIntersection[0][0] * v[1]];
    this.drawLineInt(inStack.pop(), p, shader);
    return;
  }
  var p0 = [x1[0] + validIntersection[0][0] * v[0], x1[1] + validIntersection[0][0] * v[1]];
  for (var i = 1; i < validIntersection.length; i++) {
    var p = [x1[0] + validIntersection[i][0] * v[0], x1[1] + validIntersection[i][0] * v[1]];
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
Canvas.prototype.drawPolygon = function (array, shader) {
  var isInsidePoly = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Canvas.isInsidePolygon;
  var upperBox = [[Number.MAX_VALUE, Number.MAX_VALUE], [Number.MIN_VALUE, Number.MIN_VALUE]];
  for (var _i = 0; _i < array.length; _i++) {
    upperBox[0] = min(array[_i], upperBox[0]);
    upperBox[1] = max(array[_i], upperBox[1]);
  }
  var size = this.getSize();
  var clampedSize = diff(size, [1, 1]);
  var zeros = [0, 0];
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
  this.useCanvasCtx(function (canvas) {
    return canvas.ctx.drawImage(img, x[1], x[0]);
  });
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
  this.useCanvasCtx(function (canvas) {
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
    var n = [-v[i][1], v[i][0]];
    var r = diff(x, array[i]);
    vDotN[i] = dot(r, n);
  }
  var orientation = v[0][0] * v[1][1] - v[0][1] * v[1][0] > 0 ? 1 : -1;
  for (var i = 0; i < m; i++) {
    var myDot = vDotN[i] * orientation;
    if (myDot < 0) return false;
  }
  return true;
};
Canvas.simpleShader = function (color) {
  return function (x, element, canvas) {
    return canvas.drawPxl(x, color);
  };
};
Canvas.colorShader = function (colors) {
  var auxShader = function auxShader(x, poly, canvas, alpha) {
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
    if (alpha[0] > 0 && alpha[1] > 0 && alpha[2] > 0 && Math.abs(alpha[0] + alpha[1] + alpha[2] - 1) < 1e-10) {
      shader(x, quad, canvas, [alpha[0], alpha[1], alpha[2], 0]);
    } else {
      alpha = Canvas.triangleBaryCoord(x, t2);
      shader(x, quad, canvas, [alpha[2], 0, alpha[0], alpha[1]]);
    }
  };
};
Canvas.interpolateTriangleShader = function (shader) {
  return function (x, triangle, canvas) {
    var alpha = Canvas.triangleBaryCoord(x, triangle);
    shader(x, triangle, canvas, alpha);
  };
};
Canvas.interpolateLineShader = function (shader) {
  return function (x, line, canvas) {
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
Canvas.quadTextureShader = function (img, quadTexCoord) {
  var interpolation = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Canvas.bilinearInterpolation;
  var imageCache = null;
  var imageShader = function imageShader(x, quad, canvas, alpha) {
    if (!img.isReady || imageCache == null) imageCache = new Canvas(_ImageIO__WEBPACK_IMPORTED_MODULE_0__["default"].getImageCanvas(img));
    var imageCanvas = imageCache;
    var imgSize = imageCanvas.getSize();
    var interpolateTexCoord = [0, 0];
    for (var _i2 = 0; _i2 < quadTexCoord.length; _i2++) {
      interpolateTexCoord[0] = interpolateTexCoord[0] + quadTexCoord[_i2][0] * alpha[_i2];
      interpolateTexCoord[1] = interpolateTexCoord[1] + quadTexCoord[_i2][1] * alpha[_i2];
    }
    var i = [(1 - interpolateTexCoord[1]) * (imgSize[1] - 1), (imgSize[0] - 1) * interpolateTexCoord[0]];
    // bound coordinates
    i = max([0, 0], min(diff([imgSize[0], imgSize[1]], [1, 1]), i));
    // pxl lower corner
    var j = floor(i);
    var cornerColors = [imageCanvas.getPxl(j), imageCanvas.getPxl(add(j, [1, 0])), imageCanvas.getPxl(add(j, [1, 1])), imageCanvas.getPxl(add(j, [0, 1]))];
    var finalColor = interpolation(cornerColors, diff(i, j));
    canvas.drawPxl(x, finalColor);
  };
  return Canvas.interpolateQuadShader(imageShader);
};
Canvas.triangleCache = function () {
  var hashMap = [];
  var size = 3;
  return {
    constains: function constains(triangleHash) {
      return hashMap[triangleHash % size] != undefined;
    },
    get: function get(triangleHash) {
      return hashMap[triangleHash % size];
    },
    set: function set(triangleHash, value) {
      return hashMap[triangleHash % size] = value;
    }
  };
}(); //{triangle: null, u: [], v:[], det:null, hash:null}

Canvas.triangleHash = function (triangle) {
  var array = [triangle[0][0], triangle[1][0], triangle[2][0], triangle[0][1], triangle[1][1], triangle[2][1]];
  return array.reduce(function (h, x) {
    return 31 * h + x;
  }, 1);
};
Canvas.triangleBaryCoord = function (x, triangle) {
  var hash = Canvas.triangleHash(triangle);
  var y = [x[0] - triangle[0][0], x[1] - triangle[0][1]];
  if (!Canvas.triangleCache.constains(hash)) {
    var _u = [triangle[1][0] - triangle[0][0], triangle[1][1] - triangle[0][1]];
    var _v = [triangle[2][0] - triangle[0][0], triangle[2][1] - triangle[0][1]];
    var _det = _u[0] * _v[1] - _u[1] * _v[0];
    Canvas.triangleCache.set(hash, {
      triangle: triangle,
      u: _u.map(function (x) {
        return x / _det;
      }),
      v: _v.map(function (x) {
        return x / _det;
      }),
      det: _det,
      hash: hash
    });
  }
  var cache = Canvas.triangleCache.get(hash);
  var u = cache.u;
  var v = cache.v;
  var det = cache.det;
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
  var canvas = document.createElement("canvas");
  canvas.setAttribute("width", size[0]);
  canvas.setAttribute("height", size[1]);
  document.getElementById(domId).appendChild(canvas);
  return canvas;
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Canvas);

/***/ }),

/***/ "./src/Canvas_old/main/Canvas2D.js":
/*!*****************************************!*\
  !*** ./src/Canvas_old/main/Canvas2D.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Canvas__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Canvas */ "./src/Canvas_old/main/Canvas.js");


//Note that we can switch from heritage to composition, think about that

// cameraSpace : 2-dim array with two 2-dim arrays that are intervals [a,b] | a < b
var Canvas2D = function Canvas2D(canvas, cameraSpace) {
  _Canvas__WEBPACK_IMPORTED_MODULE_0__["default"].call(this, canvas);
  if (cameraSpace.length != 2 || cameraSpace[0].length != 2 && cameraSpace[1].length != 2) {
    throw "camera space must be 2-dim array with 2-dim arrays representing an interval";
  }
  this.cameraSpace = cameraSpace;
};
Canvas2D.prototype = Object.create(_Canvas__WEBPACK_IMPORTED_MODULE_0__["default"].prototype);
Canvas2D.prototype.constructor = Canvas2D;

/* x : 2-dim array in camera space coordinates
 * returns : 2-dim array in integer coordinates
 */
Canvas2D.prototype.integerTransform = function (x) {
  var xint = -(this.canvas.height - 1) / (this.cameraSpace[1][1] - this.cameraSpace[1][0]) * (x[1] - this.cameraSpace[1][1]);
  var yint = (this.canvas.width - 1) / (this.cameraSpace[0][1] - this.cameraSpace[0][0]) * (x[0] - this.cameraSpace[0][0]);
  return [xint, yint];
};

/* x : 2-dim array in integer coordinates
 * returns : 2-dim array in camera space coordinates
 */
Canvas2D.prototype.inverseTransform = function (x) {
  var xt = this.cameraSpace[0][0] + (this.cameraSpace[0][1] - this.cameraSpace[0][0]) / (this.canvas.width - 1) * x[1];
  var yt = this.cameraSpace[1][1] - (this.cameraSpace[1][1] - this.cameraSpace[1][0]) / (this.canvas.height - 1) * x[0];
  return [xt, yt];
};

/* x1     :   2-dim array
 * x2     :   2-dim array
 * shader :   is a function that receives a 2-dim array and returns a rgba 4-dim array
 */
Canvas2D.prototype.drawLine = function (x1, x2, shader) {
  var y1 = this.integerTransform(x1);
  var y2 = this.integerTransform(x2);
  _Canvas__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.drawLine.call(this, y1, y2, shader);
};

/* x1     :   2-dim array
 * x2     :   2-dim array
 * x3     :   2-dim array
 * shader :   is a function that receives a 2-dim array and returns a rgba 4-dim array
 */
Canvas2D.prototype.drawTriangle = function (x1, x2, x3, shader) {
  var y1 = this.integerTransform(x1);
  var y2 = this.integerTransform(x2);
  var y3 = this.integerTransform(x3);
  _Canvas__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.drawTriangle.call(this, y1, y2, y3, shader);
};

/* x1     :   2-dim array
 * x2     :   2-dim array
 * x3     :   2-dim array
 * x4     :   2-dim array
 * shader :   is a function that receives a 2-dim array and returns a rgba 4-dim array
 */
Canvas2D.prototype.drawQuad = function (x1, x2, x3, x4, shader) {
  var y1 = this.integerTransform(x1);
  var y2 = this.integerTransform(x2);
  var y3 = this.integerTransform(x3);
  var y4 = this.integerTransform(x4);
  _Canvas__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.drawQuad.call(this, y1, y2, y3, y4, shader);
};
Canvas2D.prototype.drawCircle = function (x, r, shader) {
  // it assumes squared canvas, for now ...
  var y = this.integerTransform(x);
  var z = this.integerTransform([r, 0])[1] - this.integerTransform([0, 0])[1];
  _Canvas__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.drawCircle.call(this, y, z, shader);
};
Canvas2D.prototype.drawImage = function (img, x) {
  _Canvas__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.drawImage.call(this, img, this.integerTransform(x));
};
Canvas2D.prototype.drawString = function (x, string, contextShader) {
  var y = this.integerTransform(x);
  _Canvas__WEBPACK_IMPORTED_MODULE_0__["default"].prototype.drawString.call(this, y, string, contextShader);
};

// camera : 2-dim array with two 2-dim arrays that are intervals [a,b] | a < b
Canvas2D.prototype.setCamera = function (camera) {
  if (camera.length != 2 || camera[0].length != 2 && camera[1].length != 2) {
    throw "camera space must be 2-dim array with 2-dim arrays representing an interval";
  }
  this.cameraSpace = camera;
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Canvas2D);

/***/ }),

/***/ "./src/Canvas_old/main/ImageIO.js":
/*!****************************************!*\
  !*** ./src/Canvas_old/main/ImageIO.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var ImageIO = {
  // empty object
};

/**
 * img : html image
 */
ImageIO.getImageCanvas = function (img) {
  var canvasAux = document.createElement("canvas");
  canvasAux.width = img.width;
  canvasAux.height = img.height;
  var contextAux = canvasAux.getContext("2d");
  contextAux.fillStyle = "rgba(0, 0, 0, 0)";
  contextAux.globalCompositeOperation = "source-over";
  contextAux.fillRect(0, 0, canvasAux.width, canvasAux.height);
  contextAux.drawImage(img, 0, 0);
  return canvasAux;
};

/**
 * img : html image
 */
ImageIO.getDataFromImage = function (img) {
  canvas = ImageIO.getImageCanvas(img);
  return canvas.getContext("2d").getImageData(0, 0, img.width, img.height);
};
ImageIO.loadImage = function (src) {
  var img = new Image();
  img.src = src;
  img.isReady = false;
  img.onload = function () {
    return img.isReady = true;
  };
  return img;
};
ImageIO.generateImageReadyPredicate = function (img) {
  return function () {
    return img.isReady;
  };
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ImageIO);

/***/ }),

/***/ "./src/Color/main/Color.js":
/*!*********************************!*\
  !*** ./src/Color/main/Color.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Color)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");



var _class;
var MAX_8BIT = 255;
var Color = /*#__PURE__*/function () {
  /**
   *
   * @param {Uint8Array} rgba
   */
  function Color(rgba) {
    (0,_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, Color);
    this.rgba = rgba;
  }
  (0,_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(Color, [{
    key: "getRGBA",
    value: function getRGBA() {
      return this.rgba;
    }
  }, {
    key: "red",
    get: function get() {
      return this.rgba[0];
    }
  }, {
    key: "green",
    get: function get() {
      return this.rgba[1];
    }
  }, {
    key: "blue",
    get: function get() {
      return this.rgba[2];
    }
  }, {
    key: "alpha",
    get: function get() {
      return this.rgba[3];
    }
  }, {
    key: "redRaw",
    get: function get() {
      return this.red * MAX_8BIT;
    }
  }, {
    key: "greenRaw",
    get: function get() {
      return this.green * MAX_8BIT;
    }
  }, {
    key: "blueRaw",
    get: function get() {
      return this.blue * MAX_8BIT;
    }

    /**
     *
     * @param {Color} color
     * @returns {Boolean}
     */
  }, {
    key: "equals",
    value: function equals(color) {
      for (var i = 0; i < this.rgba.length; i++) {
        if (this.rgba[i] !== color.rgba[i]) {
          return false;
        }
      }
      return true;
    }
  }], [{
    key: "ofRGBA",
    value: function ofRGBA() {
      var red = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var green = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var blue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var alpha = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
      var rgba = new Uint8Array(4);
      rgba[0] = red * MAX_8BIT;
      rgba[1] = green * MAX_8BIT;
      rgba[2] = blue * MAX_8BIT;
      rgba[3] = alpha * MAX_8BIT;
      return new Color(rgba);
    }
  }, {
    key: "ofRGBARaw",
    value: function ofRGBARaw() {
      var red = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var green = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var blue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var alpha = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 255;
      var rgba = new Uint8Array(4);
      rgba[0] = red;
      rgba[1] = green;
      rgba[2] = blue;
      rgba[3] = alpha;
      return new Color(rgba);
    }
  }, {
    key: "random",
    value: function random() {
      var r = function r() {
        return Math.random() * 256;
      };
      return Color.ofRGBA(r(), r(), r(), r());
    }
  }]);
  return Color;
}();
_class = Color;
(0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(Color, "RED", _class.ofRGBA(1, 0, 0));
(0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(Color, "GREEN", _class.ofRGBA(0, 1, 0));
(0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(Color, "BLUE", _class.ofRGBA(0, 0, 1));
(0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(Color, "BLACK", _class.ofRGBA(0, 0, 0));
(0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(Color, "WHITE", _class.ofRGBA(1, 1, 1));


/***/ }),

/***/ "./src/Matrix/main/Matrix.js":
/*!***********************************!*\
  !*** ./src/Matrix/main/Matrix.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MatrixError: () => (/* binding */ MatrixError),
/* harmony export */   "default": () => (/* binding */ Matrix)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/inherits */ "./node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _babel_runtime_helpers_esm_wrapNativeSuper__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/esm/wrapNativeSuper */ "./node_modules/@babel/runtime/helpers/esm/wrapNativeSuper.js");
/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/esm/toConsumableArray */ "./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js");
/* harmony import */ var _babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @babel/runtime/helpers/esm/slicedToArray */ "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var _babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @babel/runtime/helpers/esm/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");









var _class2;
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0,_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_2__["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0,_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_2__["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0,_babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_1__["default"])(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }
function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }
function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }
//========================================================================================
/*                                                                                      *
 *                              MATRIX UTILS (order counts)                             *
 *                                                                                      */
//========================================================================================

var getIndexFromCoord = function getIndexFromCoord(_, m) {
  return function (i, j) {
    return j + i * m;
  };
};
var getCoordFromIndex = function getCoordFromIndex(_, m) {
  return function (k) {
    return [k / m, k % m].map(Math.floor);
  };
};
var index2Key = function index2Key(i, j) {
  return "".concat(i, ",").concat(j);
};
var key2Index = function key2Index(k) {
  return k.split(",").map(Number);
};
var MatrixBuilder = /*#__PURE__*/function () {
  function MatrixBuilder() {
    (0,_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_7__["default"])(this, MatrixBuilder);
    this._size = [];
    this.data = {};
  }
  (0,_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_8__["default"])(MatrixBuilder, [{
    key: "size",
    value: function size(n) {
      var m = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      this._size = [n, m];
      return this;
    }
  }, {
    key: "set",
    value: function set(i, j, v) {
      if (this._size.length === 0) throw new MatrixError("Setting value to empty matrix");
      this.data[index2Key(i, j)] = v;
      return this;
    }
  }, {
    key: "build",
    value: function build() {
      var _this = this;
      var _this$_size = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_6__["default"])(this._size, 2),
        n = _this$_size[0],
        m = _this$_size[1];
      var data = new Float64Array(n * m);
      var indexer = getIndexFromCoord(n, m);
      Object.keys(this.data).forEach(function (key) {
        data[indexer.apply(void 0, (0,_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_5__["default"])(key2Index(key)))] = _this.data[key];
      });
      return new Matrix(data, this._size);
    }
  }]);
  return MatrixBuilder;
}();
var RowBuilder = /*#__PURE__*/function () {
  function RowBuilder() {
    (0,_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_7__["default"])(this, RowBuilder);
    this.rows = [];
    this.dim = 0;
  }
  (0,_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_8__["default"])(RowBuilder, [{
    key: "addRow",
    value: function addRow() {
      for (var _len = arguments.length, array = new Array(_len), _key = 0; _key < _len; _key++) {
        array[_key] = arguments[_key];
      }
      if (this.dim === 0) {
        this.dim = array.length;
      }
      if (this.dim !== array.length) throw new MatrixError("Added row of different dimension, actual dim is ".concat(this.dim));
      this.rows.push(array);
      return this;
    }
  }, {
    key: "build",
    value: function build() {
      if (this.rows.length > 0) return this._buildWithRows();
      throw new MatrixError("Building empty matrix");
    }
  }, {
    key: "_buildWithRows",
    value: function _buildWithRows() {
      var rows = this.rows.length;
      var cols = this.dim;
      var data = new Float64Array(rows * cols);
      var indexF = getIndexFromCoord(rows, cols);
      for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
          data[indexF(i, j)] = this.rows[i][j];
        }
      }
      return new Matrix(data, [rows, cols]);
    }
  }]);
  return RowBuilder;
}();
var _buildWithCols = /*#__PURE__*/new WeakSet();
var ColBuilder = /*#__PURE__*/function () {
  function ColBuilder() {
    (0,_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_7__["default"])(this, ColBuilder);
    _classPrivateMethodInitSpec(this, _buildWithCols);
    this.cols = [];
    this.dim = 0;
  }
  (0,_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_8__["default"])(ColBuilder, [{
    key: "addCol",
    value: function addCol() {
      for (var _len2 = arguments.length, array = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        array[_key2] = arguments[_key2];
      }
      if (this.dim === 0) {
        this.dim = array.length;
      }
      if (this.dim !== array.length) throw new MatrixError("Added col of different dimension, actual dim is ".concat(this.dim));
      this.cols.push(array);
      return this;
    }
  }, {
    key: "build",
    value: function build() {
      if (this.cols.length > 0) return _classPrivateMethodGet(this, _buildWithCols, _buildWithCols2).call(this);
      throw new MatrixError("Building empty matrix");
    }
  }]);
  return ColBuilder;
}(); //========================================================================================
/*                                                                                      *
 *                                        MATRIX                                        *
 *                                                                                      */
//========================================================================================
function _buildWithCols2() {
  var rows = this.dim;
  var cols = this.cols.length;
  var data = new Float64Array(rows * cols);
  var indexF = getIndexFromCoord(rows, cols);
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      data[indexF(i, j)] = this.cols[j][i];
    }
  }
  return new Matrix(data, [rows, cols]);
}
var Matrix = /*#__PURE__*/function () {
  /**
   *
   * @param {Float64Array} data: Matrix data in major row format
   * @param {Array} shape: 2-array [rows,columns]
   */
  function Matrix(data, shape) {
    (0,_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_7__["default"])(this, Matrix);
    (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_4__["default"])(this, "fold", this.reduce);
    (0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_4__["default"])(this, "length", this.norm);
    this.data = data;
    this.shape = shape;
  }
  (0,_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_8__["default"])(Matrix, [{
    key: "rows",
    get: function get() {
      return this.shape[0];
    }
  }, {
    key: "cols",
    get: function get() {
      return this.shape[1];
    }
  }, {
    key: "get",
    value: function get() {
      var i = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var j = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var _this$shape = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_6__["default"])(this.shape, 2),
        _ = _this$shape[0],
        cols = _this$shape[1];
      return this.data[j + i * cols];
    }
  }, {
    key: "prod",
    value: function prod(matrix) {
      if (this.cols !== matrix.rows) {
        throw new MatrixError("Incompatible product size. Left ".concat(this.shape, ", right ").concat(matrix.shape));
      }
      var n = this.rows;
      var m = this.cols;
      var l = matrix.cols;
      var prod = new Float64Array(n * l);
      var indexer = getIndexFromCoord(n, l);
      for (var i = 0; i < n; i++) {
        for (var j = 0; j < l; j++) {
          var acc = 0;
          for (var k = 0; k < m; k++) {
            acc += this.get(i, k) * matrix.get(k, j);
          }
          prod[indexer(i, j)] = acc;
        }
      }
      return new Matrix(prod, [n, l]);
    }
  }, {
    key: "dot",
    value: function dot(matrix) {
      if (this.rows !== matrix.rows) throw new MatrixError("Incompatible product size. Left ".concat(this.shape, ", right ").concat(matrix.shape));
      var n = this.rows;
      var m = this.cols;
      var l = matrix.cols;
      var prod = new Float64Array(m * l);
      var indexer = getIndexFromCoord(m, l);
      for (var i = 0; i < m; i++) {
        for (var j = 0; j < l; j++) {
          var acc = 0;
          for (var k = 0; k < n; k++) {
            acc += this.get(k, i) * matrix.get(k, j);
          }
          prod[indexer(i, j)] = acc;
        }
      }
      return new Matrix(prod, [m, l]);
    }

    /**
     *
     * @param {*} lambda: (number, i, j) => number
     * @returns Matrix
     */
  }, {
    key: "map",
    value: function map() {
      var lambda = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (x) {
        return x;
      };
      var getCoord = getCoordFromIndex.apply(void 0, (0,_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_5__["default"])(this.shape));
      return new Matrix(this.data.map(function (x, k) {
        var _getCoord = getCoord(k),
          _getCoord2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_6__["default"])(_getCoord, 2),
          i = _getCoord2[0],
          j = _getCoord2[1];
        return lambda(x, i, j);
      }), this.shape);
    }

    /**
     *
     * @param {*} lambda (accumulator, number, i, j) => number
     * @param {*} identity
     */
  }, {
    key: "reduce",
    value: function reduce(lambda) {
      var identity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var getCoord = getCoordFromIndex.apply(void 0, (0,_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_5__["default"])(this.shape));
      return this.data.reduce(function (e, x, k) {
        var _getCoord3 = getCoord(k),
          _getCoord4 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_6__["default"])(_getCoord3, 2),
          i = _getCoord4[0],
          j = _getCoord4[1];
        return lambda(e, x, i, j);
      }, identity);
    }
  }, {
    key: "op",
    value:
    /**
     *
     * @param {*} binaryLambda: (number,number) => number
     */
    function op(matrix, binaryLambda) {
      var _this$shape2 = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_6__["default"])(this.shape, 2),
        rows = _this$shape2[0],
        cols = _this$shape2[1];
      var _matrix$shape = (0,_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_6__["default"])(matrix.shape, 2),
        mRows = _matrix$shape[0],
        mCols = _matrix$shape[1];
      if (rows !== mRows || cols !== mCols) throw new MatrixError("Matrix must be of same size");
      return new Matrix(this.data.map(function (x, i) {
        return binaryLambda(x, matrix.data[i]);
      }), this.shape);
    }
  }, {
    key: "add",
    value: function add(matrix) {
      return this.op(matrix, function (a, b) {
        return a + b;
      });
    }
  }, {
    key: "sub",
    value: function sub(matrix) {
      return this.op(matrix, function (a, b) {
        return a - b;
      });
    }
  }, {
    key: "mul",
    value: function mul(matrix) {
      return this.op(matrix, function (a, b) {
        return a * b;
      });
    }
  }, {
    key: "div",
    value: function div(matrix) {
      return this.op(matrix, function (a, b) {
        return a / b;
      });
    }
  }, {
    key: "scale",
    value: function scale(real) {
      return this.map(function (x) {
        return x * real;
      });
    }
  }, {
    key: "norm",
    value: function norm() {
      var acc = 0;
      for (var i = 0; i < this.data.length; i++) {
        acc += this.data[i] * this.data[i];
      }
      return Math.sqrt(acc);
    }
  }, {
    key: "equals",
    value: function equals(matrix) {
      var precision = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1e-6;
      if (!(matrix instanceof Matrix)) return false;
      try {
        return this.sub(matrix).length() < precision;
      } catch (error) {
        return false;
      }
    }
  }, {
    key: "toArray",
    value: function toArray() {
      return this.data;
    }
  }], [{
    key: "ZERO",
    value: function ZERO(n) {
      var m = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      return Matrix.builder().size(n, m).build();
    }
  }, {
    key: "random",
    value: function random(n) {
      var m = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      var data = new Float64Array(n * m);
      for (var i = 0; i < data.length; i++) {
        data[i] = Math.random();
      }
      return new Matrix(data, [n, m]);
    }
  }, {
    key: "builder",
    value: function builder() {
      return new MatrixBuilder();
    }
  }, {
    key: "rowBuilder",
    value: function rowBuilder() {
      return new RowBuilder();
    }
  }, {
    key: "colBuilder",
    value: function colBuilder() {
      return new ColBuilder();
    }
  }, {
    key: "vec",
    value: function vec() {
      var _ColBuilder;
      return (_ColBuilder = new ColBuilder()).addCol.apply(_ColBuilder, arguments).build();
    }
  }, {
    key: "cov",
    value: function cov() {
      var _RowBuilder;
      return (_RowBuilder = new RowBuilder()).addRow.apply(_RowBuilder, arguments).build();
    }
  }]);
  return Matrix;
}();
_class2 = Matrix;
(0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_4__["default"])(Matrix, "id", function (n) {
  var m = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : n;
  var en = _class2.e(n);
  var matrixBuilder = _class2.colBuilder();
  for (var i = 0; i < m; i++) {
    var _matrixBuilder;
    matrixBuilder = (_matrixBuilder = matrixBuilder).addCol.apply(_matrixBuilder, (0,_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_5__["default"])(en(i).data));
  }
  return matrixBuilder.build();
});
(0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_4__["default"])(Matrix, "e", function (n) {
  return function (i) {
    return new _class2(new Float64Array(n).map(function (_, j) {
      return i === j ? 1 : 0;
    }), [n, 1]);
  };
});
(0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_4__["default"])(Matrix, "dx", function (n) {
  return function (i) {
    return new _class2(new Float64Array(n).map(function (_, j) {
      return i === j ? 1 : 0;
    }), [1, n]);
  };
});
(0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_4__["default"])(Matrix, "vec2", {
  of: function of() {
    var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    return _class2.vec(x, y);
  },
  e0: _class2.vec(1, 0),
  e1: _class2.vec(0, 1),
  ZERO: _class2.ZERO(2, 1)
});
(0,_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_4__["default"])(Matrix, "vec3", {
  of: function of() {
    var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    return _class2.vec(x, y, z);
  },
  e0: _class2.vec(1, 0, 0),
  e1: _class2.vec(0, 1, 0),
  e2: _class2.vec(0, 0, 1),
  ZERO: _class2.ZERO(3, 1)
});

var MatrixError = /*#__PURE__*/function (_Error) {
  (0,_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_0__["default"])(MatrixError, _Error);
  var _super = _createSuper(MatrixError);
  function MatrixError() {
    (0,_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_7__["default"])(this, MatrixError);
    return _super.apply(this, arguments);
  }
  return (0,_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_8__["default"])(MatrixError);
}( /*#__PURE__*/(0,_babel_runtime_helpers_esm_wrapNativeSuper__WEBPACK_IMPORTED_MODULE_3__["default"])(Error));

/***/ }),

/***/ "./src/Utils/main/Utils.js":
/*!*********************************!*\
  !*** ./src/Utils/main/Utils.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   perf: () => (/* binding */ perf),
/* harmony export */   testBuilder: () => (/* binding */ testBuilder)
/* harmony export */ });
var perf = function perf(lambda) {
  var t = performance.now();
  lambda();
  return performance.now() - t;
};

/**
 *
 * @param {*} canvasBuilder : () => canvas
 * @returns
 */
var testBuilder = function testBuilder() {
  var canvasBuilder = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : canvasFactory;
  return (
    /**
     * Unit test maker
     * @param {*} title
     * @param {*} lambda: (canvas) => {}
     */
    function (title) {
      var lambda = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};
      var canvas = canvasBuilder();
      var timeInMillis = perf(function () {
        return lambda(canvas);
      });
      var domTest = document.createElement("div");
      var testTitle = document.createElement("h3");
      testTitle.innerText = title;
      domTest.appendChild(testTitle);
      domTest.appendChild(canvas.getDom());
      var timeDom = document.createElement("h4");
      timeDom.innerText = "Test took ".concat(timeInMillis, "ms");
      domTest.appendChild(timeDom);
      document.body.appendChild(domTest);
    }
  );
};
var canvasFactory = function canvasFactory() {
  return Canvas.builder().width(500).height(500).build();
};

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _arrayLikeToArray)
/* harmony export */ });
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _arrayWithHoles)
/* harmony export */ });
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _arrayWithoutHoles)
/* harmony export */ });
/* harmony import */ var _arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayLikeToArray.js */ "./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js");

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return (0,_arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__["default"])(arr);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _assertThisInitialized)
/* harmony export */ });
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/classCallCheck.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _classCallCheck)
/* harmony export */ });
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/construct.js":
/*!**************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/construct.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _construct)
/* harmony export */ });
/* harmony import */ var _setPrototypeOf_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./setPrototypeOf.js */ "./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js");
/* harmony import */ var _isNativeReflectConstruct_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./isNativeReflectConstruct.js */ "./node_modules/@babel/runtime/helpers/esm/isNativeReflectConstruct.js");


function _construct(Parent, args, Class) {
  if ((0,_isNativeReflectConstruct_js__WEBPACK_IMPORTED_MODULE_1__["default"])()) {
    _construct = Reflect.construct.bind();
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) (0,_setPrototypeOf_js__WEBPACK_IMPORTED_MODULE_0__["default"])(instance, Class.prototype);
      return instance;
    };
  }
  return _construct.apply(null, arguments);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/createClass.js":
/*!****************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/createClass.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _createClass)
/* harmony export */ });
/* harmony import */ var _toPropertyKey_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./toPropertyKey.js */ "./node_modules/@babel/runtime/helpers/esm/toPropertyKey.js");

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, (0,_toPropertyKey_js__WEBPACK_IMPORTED_MODULE_0__["default"])(descriptor.key), descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/defineProperty.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _defineProperty)
/* harmony export */ });
/* harmony import */ var _toPropertyKey_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./toPropertyKey.js */ "./node_modules/@babel/runtime/helpers/esm/toPropertyKey.js");

function _defineProperty(obj, key, value) {
  key = (0,_toPropertyKey_js__WEBPACK_IMPORTED_MODULE_0__["default"])(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/get.js":
/*!********************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/get.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _get)
/* harmony export */ });
/* harmony import */ var _superPropBase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./superPropBase.js */ "./node_modules/@babel/runtime/helpers/esm/superPropBase.js");

function _get() {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get.bind();
  } else {
    _get = function _get(target, property, receiver) {
      var base = (0,_superPropBase_js__WEBPACK_IMPORTED_MODULE_0__["default"])(target, property);
      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);
      if (desc.get) {
        return desc.get.call(arguments.length < 3 ? target : receiver);
      }
      return desc.value;
    };
  }
  return _get.apply(this, arguments);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _getPrototypeOf)
/* harmony export */ });
function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/inherits.js":
/*!*************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/inherits.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _inherits)
/* harmony export */ });
/* harmony import */ var _setPrototypeOf_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./setPrototypeOf.js */ "./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js");

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  Object.defineProperty(subClass, "prototype", {
    writable: false
  });
  if (superClass) (0,_setPrototypeOf_js__WEBPACK_IMPORTED_MODULE_0__["default"])(subClass, superClass);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/isNativeFunction.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/isNativeFunction.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _isNativeFunction)
/* harmony export */ });
function _isNativeFunction(fn) {
  try {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  } catch (e) {
    return typeof fn === "function";
  }
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/isNativeReflectConstruct.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/isNativeReflectConstruct.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _isNativeReflectConstruct)
/* harmony export */ });
function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;
  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/iterableToArray.js":
/*!********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/iterableToArray.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _iterableToArray)
/* harmony export */ });
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _iterableToArrayLimit)
/* harmony export */ });
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e,
      n,
      i,
      u,
      a = [],
      f = !0,
      o = !1;
    try {
      if (i = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = !1;
      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
    } catch (r) {
      o = !0, n = r;
    } finally {
      try {
        if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js":
/*!********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _nonIterableRest)
/* harmony export */ });
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _nonIterableSpread)
/* harmony export */ });
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _possibleConstructorReturn)
/* harmony export */ });
/* harmony import */ var _typeof_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./typeof.js */ "./node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var _assertThisInitialized_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./assertThisInitialized.js */ "./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js");


function _possibleConstructorReturn(self, call) {
  if (call && ((0,_typeof_js__WEBPACK_IMPORTED_MODULE_0__["default"])(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return (0,_assertThisInitialized_js__WEBPACK_IMPORTED_MODULE_1__["default"])(self);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _setPrototypeOf)
/* harmony export */ });
function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };
  return _setPrototypeOf(o, p);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js":
/*!******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/slicedToArray.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _slicedToArray)
/* harmony export */ });
/* harmony import */ var _arrayWithHoles_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayWithHoles.js */ "./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js");
/* harmony import */ var _iterableToArrayLimit_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./iterableToArrayLimit.js */ "./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js");
/* harmony import */ var _unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./unsupportedIterableToArray.js */ "./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js");
/* harmony import */ var _nonIterableRest_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./nonIterableRest.js */ "./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js");




function _slicedToArray(arr, i) {
  return (0,_arrayWithHoles_js__WEBPACK_IMPORTED_MODULE_0__["default"])(arr) || (0,_iterableToArrayLimit_js__WEBPACK_IMPORTED_MODULE_1__["default"])(arr, i) || (0,_unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(arr, i) || (0,_nonIterableRest_js__WEBPACK_IMPORTED_MODULE_3__["default"])();
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/superPropBase.js":
/*!******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/superPropBase.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _superPropBase)
/* harmony export */ });
/* harmony import */ var _getPrototypeOf_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./getPrototypeOf.js */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = (0,_getPrototypeOf_js__WEBPACK_IMPORTED_MODULE_0__["default"])(object);
    if (object === null) break;
  }
  return object;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _toConsumableArray)
/* harmony export */ });
/* harmony import */ var _arrayWithoutHoles_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayWithoutHoles.js */ "./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js");
/* harmony import */ var _iterableToArray_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./iterableToArray.js */ "./node_modules/@babel/runtime/helpers/esm/iterableToArray.js");
/* harmony import */ var _unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./unsupportedIterableToArray.js */ "./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js");
/* harmony import */ var _nonIterableSpread_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./nonIterableSpread.js */ "./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js");




function _toConsumableArray(arr) {
  return (0,_arrayWithoutHoles_js__WEBPACK_IMPORTED_MODULE_0__["default"])(arr) || (0,_iterableToArray_js__WEBPACK_IMPORTED_MODULE_1__["default"])(arr) || (0,_unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(arr) || (0,_nonIterableSpread_js__WEBPACK_IMPORTED_MODULE_3__["default"])();
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/toPrimitive.js":
/*!****************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/toPrimitive.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _toPrimitive)
/* harmony export */ });
/* harmony import */ var _typeof_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./typeof.js */ "./node_modules/@babel/runtime/helpers/esm/typeof.js");

function _toPrimitive(input, hint) {
  if ((0,_typeof_js__WEBPACK_IMPORTED_MODULE_0__["default"])(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if ((0,_typeof_js__WEBPACK_IMPORTED_MODULE_0__["default"])(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/toPropertyKey.js":
/*!******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/toPropertyKey.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _toPropertyKey)
/* harmony export */ });
/* harmony import */ var _typeof_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./typeof.js */ "./node_modules/@babel/runtime/helpers/esm/typeof.js");
/* harmony import */ var _toPrimitive_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./toPrimitive.js */ "./node_modules/@babel/runtime/helpers/esm/toPrimitive.js");


function _toPropertyKey(arg) {
  var key = (0,_toPrimitive_js__WEBPACK_IMPORTED_MODULE_1__["default"])(arg, "string");
  return (0,_typeof_js__WEBPACK_IMPORTED_MODULE_0__["default"])(key) === "symbol" ? key : String(key);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/typeof.js":
/*!***********************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/typeof.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _typeof)
/* harmony export */ });
function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _unsupportedIterableToArray)
/* harmony export */ });
/* harmony import */ var _arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayLikeToArray.js */ "./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js");

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return (0,_arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__["default"])(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return (0,_arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__["default"])(o, minLen);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/wrapNativeSuper.js":
/*!********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/wrapNativeSuper.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _wrapNativeSuper)
/* harmony export */ });
/* harmony import */ var _getPrototypeOf_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./getPrototypeOf.js */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _setPrototypeOf_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./setPrototypeOf.js */ "./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js");
/* harmony import */ var _isNativeFunction_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./isNativeFunction.js */ "./node_modules/@babel/runtime/helpers/esm/isNativeFunction.js");
/* harmony import */ var _construct_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./construct.js */ "./node_modules/@babel/runtime/helpers/esm/construct.js");




function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;
  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !(0,_isNativeFunction_js__WEBPACK_IMPORTED_MODULE_2__["default"])(Class)) return Class;
    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }
    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);
      _cache.set(Class, Wrapper);
    }
    function Wrapper() {
      return (0,_construct_js__WEBPACK_IMPORTED_MODULE_3__["default"])(Class, arguments, (0,_getPrototypeOf_js__WEBPACK_IMPORTED_MODULE_0__["default"])(this).constructor);
    }
    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return (0,_setPrototypeOf_js__WEBPACK_IMPORTED_MODULE_1__["default"])(Wrapper, Class);
  };
  return _wrapNativeSuper(Class);
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Animator: () => (/* reexport safe */ _Animator_main_Animator__WEBPACK_IMPORTED_MODULE_6__["default"]),
/* harmony export */   BBox: () => (/* reexport safe */ _BBox_main_BBox__WEBPACK_IMPORTED_MODULE_9__["default"]),
/* harmony export */   Canvas: () => (/* reexport safe */ _Canvas_main_Canvas__WEBPACK_IMPORTED_MODULE_3__["default"]),
/* harmony export */   Canvas2D_old: () => (/* reexport safe */ _Canvas_old_main_Canvas2D__WEBPACK_IMPORTED_MODULE_1__["default"]),
/* harmony export */   Canvas2d: () => (/* reexport safe */ _Canvas2d_main_Canvas2d__WEBPACK_IMPORTED_MODULE_8__["default"]),
/* harmony export */   Canvas_old: () => (/* reexport safe */ _Canvas_old_main_Canvas__WEBPACK_IMPORTED_MODULE_0__["default"]),
/* harmony export */   Color: () => (/* reexport safe */ _Color_main_Color__WEBPACK_IMPORTED_MODULE_4__["default"]),
/* harmony export */   ImageIO: () => (/* reexport safe */ _Canvas_old_main_ImageIO__WEBPACK_IMPORTED_MODULE_2__["default"]),
/* harmony export */   Matrix: () => (/* reexport safe */ _Matrix_main_Matrix__WEBPACK_IMPORTED_MODULE_7__["default"]),
/* harmony export */   Utils: () => (/* reexport module object */ _Utils_main_Utils__WEBPACK_IMPORTED_MODULE_5__)
/* harmony export */ });
/* harmony import */ var _Canvas_old_main_Canvas__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Canvas_old/main/Canvas */ "./src/Canvas_old/main/Canvas.js");
/* harmony import */ var _Canvas_old_main_Canvas2D__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Canvas_old/main/Canvas2D */ "./src/Canvas_old/main/Canvas2D.js");
/* harmony import */ var _Canvas_old_main_ImageIO__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Canvas_old/main/ImageIO */ "./src/Canvas_old/main/ImageIO.js");
/* harmony import */ var _Canvas_main_Canvas__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Canvas/main/Canvas */ "./src/Canvas/main/Canvas.js");
/* harmony import */ var _Color_main_Color__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Color/main/Color */ "./src/Color/main/Color.js");
/* harmony import */ var _Utils_main_Utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Utils/main/Utils */ "./src/Utils/main/Utils.js");
/* harmony import */ var _Animator_main_Animator__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Animator/main/Animator */ "./src/Animator/main/Animator.js");
/* harmony import */ var _Matrix_main_Matrix__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Matrix/main/Matrix */ "./src/Matrix/main/Matrix.js");
/* harmony import */ var _Canvas2d_main_Canvas2d__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./Canvas2d/main/Canvas2d */ "./src/Canvas2d/main/Canvas2d.js");
/* harmony import */ var _BBox_main_BBox__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./BBox/main/BBox */ "./src/BBox/main/BBox.js");











})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=index.js.map