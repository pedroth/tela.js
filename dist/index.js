(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Tela"] = factory();
	else
		root["Tela"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js ***!
  \**************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _assertThisInitialized; });
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
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _classCallCheck; });
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
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _construct; });
/* harmony import */ var _setPrototypeOf_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./setPrototypeOf.js */ "./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js");
/* harmony import */ var _isNativeReflectConstruct_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./isNativeReflectConstruct.js */ "./node_modules/@babel/runtime/helpers/esm/isNativeReflectConstruct.js");


function _construct(Parent, args, Class) {
  if (Object(_isNativeReflectConstruct_js__WEBPACK_IMPORTED_MODULE_1__["default"])()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) Object(_setPrototypeOf_js__WEBPACK_IMPORTED_MODULE_0__["default"])(instance, Class.prototype);
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
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _createClass; });
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/defineProperty.js ***!
  \*******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _defineProperty; });
function _defineProperty(obj, key, value) {
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

/***/ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js ***!
  \*******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _getPrototypeOf; });
function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/inherits.js":
/*!*************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/inherits.js ***!
  \*************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _inherits; });
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
  if (superClass) Object(_setPrototypeOf_js__WEBPACK_IMPORTED_MODULE_0__["default"])(subClass, superClass);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/isNativeFunction.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/isNativeFunction.js ***!
  \*********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _isNativeFunction; });
function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/isNativeReflectConstruct.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/isNativeReflectConstruct.js ***!
  \*****************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _isNativeReflectConstruct; });
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

/***/ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js":
/*!******************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js ***!
  \******************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _possibleConstructorReturn; });
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/typeof.js");
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _assertThisInitialized_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./assertThisInitialized.js */ "./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js");


function _possibleConstructorReturn(self, call) {
  if (call && (_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(call) === "object" || typeof call === "function")) {
    return call;
  }

  return Object(_assertThisInitialized_js__WEBPACK_IMPORTED_MODULE_1__["default"])(self);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js ***!
  \*******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _setPrototypeOf; });
function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/wrapNativeSuper.js":
/*!********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/wrapNativeSuper.js ***!
  \********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _wrapNativeSuper; });
/* harmony import */ var _getPrototypeOf_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./getPrototypeOf.js */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _setPrototypeOf_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./setPrototypeOf.js */ "./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js");
/* harmony import */ var _isNativeFunction_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./isNativeFunction.js */ "./node_modules/@babel/runtime/helpers/esm/isNativeFunction.js");
/* harmony import */ var _construct_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./construct.js */ "./node_modules/@babel/runtime/helpers/esm/construct.js");




function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !Object(_isNativeFunction_js__WEBPACK_IMPORTED_MODULE_2__["default"])(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return Object(_construct_js__WEBPACK_IMPORTED_MODULE_3__["default"])(Class, arguments, Object(_getPrototypeOf_js__WEBPACK_IMPORTED_MODULE_0__["default"])(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return Object(_setPrototypeOf_js__WEBPACK_IMPORTED_MODULE_1__["default"])(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/typeof.js":
/*!*******************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/typeof.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return typeof obj;
    };

    module.exports["default"] = module.exports, module.exports.__esModule = true;
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    module.exports["default"] = module.exports, module.exports.__esModule = true;
  }

  return _typeof(obj);
}

module.exports = _typeof;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),

/***/ "./src/Animator/main/Animator.js":
/*!***************************************!*\
  !*** ./src/Animator/main/Animator.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Animator; });
/* harmony import */ var _babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");



var Animator = /*#__PURE__*/function () {
  function Animator(state, next, doWhile) {
    Object(_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, Animator);

    this.state = state;
    this.next = next;
    this["while"] = doWhile;
    this.requestAnimeId = null;
  }

  Object(_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(Animator, [{
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
    Object(_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, AnimatorBuilder);

    this._state = null;
    this._next = null;
    this._end = null;
  }

  Object(_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(AnimatorBuilder, [{
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

/***/ "./src/Canvas/main/Canvas.js":
/*!***********************************!*\
  !*** ./src/Canvas/main/Canvas.js ***!
  \***********************************/
/*! exports provided: default, CanvasException */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Canvas; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CanvasException", function() { return CanvasException; });
/* harmony import */ var _babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/inherits */ "./node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _babel_runtime_helpers_esm_wrapNativeSuper__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/esm/wrapNativeSuper */ "./node_modules/@babel/runtime/helpers/esm/wrapNativeSuper.js");
/* harmony import */ var _babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/esm/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _Color_main_Color__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../Color/main/Color */ "./src/Color/main/Color.js");








function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = Object(_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_2__["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = Object(_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_2__["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return Object(_babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_1__["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }


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

var Canvas = /*#__PURE__*/function () {
  /**
   *
   * @param {*} canvas: DOM element of type canvas
   */
  function Canvas(canvas) {
    Object(_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_4__["default"])(this, Canvas);

    Object(_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_6__["default"])(this, "getDom", this.getCanvas);

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.image = this.ctx.getImageData(0, 0, canvas.width, canvas.height); // width * height * 4 array of integers

    this.imgBuffer = this.image.data;
  }

  Object(_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_5__["default"])(Canvas, [{
    key: "getCanvas",
    value: function getCanvas() {
      return this.canvas;
    }
  }, {
    key: "fill",
    value: //========================================================================================

    /*                                                                                      *
     *                                 side effects function                                *
     *                                                                                      */
    //========================================================================================

    /**
     * Update color of canvas
     * @param {*} color: Color
     */
    function fill(color) {
      this.ctx.fillStyle = "rgba(".concat(color.red, ", ").concat(color.green, ", ").concat(color.blue, ", ").concat(color.alpha / 255.0, ")");
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.image = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      this.imgBuffer = this.image.data;
      return this;
    }
    /**
     *
     * @param {*} lambda: (Color,x:number,y:number) => Color
     */

  }, {
    key: "map",
    value: function map() {
      var lambda = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
      var n = this.imgBuffer.length;
      var w = this.canvas.width;

      for (var i = 0; i < n; i += 4) {
        var x = Math.floor(i / (4 * w));
        var y = Math.floor(i / 4) % w;
        var color = lambda(_Color_main_Color__WEBPACK_IMPORTED_MODULE_7__["default"].ofRGBA(this.imgBuffer[i], this.imgBuffer[i + 1], this.imgBuffer[i + 2], this.imgBuffer[i + 3]), x, y);
        this.imgBuffer[i] = color.red;
        this.imgBuffer[i + 1] = color.green;
        this.imgBuffer[i + 2] = color.blue;
        this.imgBuffer[i + 3] = color.alpha;
      }

      return this;
    }
    /**
     * Return pxl color at (i,j)
     * @param {*} i: integer \in [0,H-1]
     * @param {*} j: integer \in [0,W-1]
     * @returns color
     */

  }, {
    key: "getPxl",
    value: function getPxl(i, j) {
      var _this$canvas = this.canvas,
          width = _this$canvas.width,
          height = _this$canvas.height;
      if ((i < 0 || i >= height) && (j < 0 || j >= width)) return new CanvasException("pxl out of bounds");
      var w = width * 4;
      var index = i * w + 4 * j;
      return _Color_main_Color__WEBPACK_IMPORTED_MODULE_7__["default"].ofRGBA(this.imgBuffer[index], this.imgBuffer[index + 1], this.imgBuffer[index + 2], this.imgBuffer[index + 3]);
    }
    /**
     * Set pxl color at (i,j)
     * @param {*} i: integer \in [0,H-1]
     * @param {*} j: integer \in [0,W-1]
     * @param {*} color
     */

  }, {
    key: "setPxl",
    value: function setPxl(i, j, color) {
      var _this$canvas2 = this.canvas,
          width = _this$canvas2.width,
          height = _this$canvas2.height;
      if ((i < 0 || i >= height) && (j < 0 || j >= width)) return;
      var w = width * 4;
      var index = i * w + 4 * j;
      this.imgBuffer[index] = color.red;
      this.imgBuffer[index + 1] = color.green;
      this.imgBuffer[index + 2] = color.blue;
      this.imgBuffer[index + 3] = color.alpha;
      return this;
    }
  }, {
    key: "paint",
    value: function paint() {
      this.ctx.putImageData(this.image, 0, 0);
    } //========================================================================================

    /*                                                                                      *
     *                                   static functions                                   *
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
    Object(_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_4__["default"])(this, CanvasBuilder);

    Object(_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_6__["default"])(this, "_canvas", document.createElement("canvas"));

    Object(_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_6__["default"])(this, "_width", 500);

    Object(_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_6__["default"])(this, "_height", 500);
  }

  Object(_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_5__["default"])(CanvasBuilder, [{
    key: "width",
    value: function width(_width) {
      this._width = _width;
      return this;
    }
  }, {
    key: "height",
    value: function height(_height) {
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

var CanvasException = /*#__PURE__*/function (_Error) {
  Object(_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_0__["default"])(CanvasException, _Error);

  var _super = _createSuper(CanvasException);

  function CanvasException() {
    Object(_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_4__["default"])(this, CanvasException);

    return _super.apply(this, arguments);
  }

  return CanvasException;
}( /*#__PURE__*/Object(_babel_runtime_helpers_esm_wrapNativeSuper__WEBPACK_IMPORTED_MODULE_3__["default"])(Error));

/***/ }),

/***/ "./src/Canvas_old/main/Canvas.js":
/*!***************************************!*\
  !*** ./src/Canvas_old/main/Canvas.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
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
} // Canvas


var Canvas = function Canvas(canvas) {
  this.canvas = canvas;
  this.ctx = canvas.getContext("2d");
  this.image = this.ctx.getImageData(0, 0, canvas.width, canvas.height); // width * height * 4 array of integers

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
  shader.points = [x1, x2]; // do clipping

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
  } // both points are inside canvas


  if (inStack.length == 2) {
    this.drawLineInt(inStack[0], inStack[1], shader);
    return;
  } //intersecting line with canvas


  var intersectionSolutions = [];
  var v = [x2[0] - x1[0], x2[1] - x1[1]]; // Let s \in [0,1]
  // line intersection with [0, 0]^T + [H - 1, 0]^T s

  intersectionSolutions.push(solve2by2UpperTriMatrix(v, -(this.canvas.height - 1), [-x1[0], -x1[1]])); // line intersection with [H - 1, 0]^T + [0, W - 1]^T s

  intersectionSolutions.push(solve2by2LowerTriMatrix(v, -(this.canvas.width - 1), [this.canvas.height - 1 - x1[0], -x1[1]])); // line intersection with [H - 1, W - 1]^T + [-(H - 1), 0]^T s

  intersectionSolutions.push(solve2by2UpperTriMatrix(v, this.canvas.height - 1, [this.canvas.height - 1 - x1[0], this.canvas.width - 1 - x1[1]])); // line intersection with [0, W - 1]^T + [0, -(W - 1)]^T s

  intersectionSolutions.push(solve2by2LowerTriMatrix(v, this.canvas.width - 1, [-x1[0], this.canvas.width - 1 - x1[1]]));
  var validIntersection = [];

  for (var i = 0; i < intersectionSolutions.length; i++) {
    var x = intersectionSolutions[i];

    if (0 <= x[0] && x[0] <= 1 && 0 <= x[1] && x[1] <= 1) {
      validIntersection.push(x);
    }
  }

  if (validIntersection.length == 0) return; //it can be shown that at this point there is at least one valid intersection.

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
}; // Static functions
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

    var i = [(1 - interpolateTexCoord[1]) * (imgSize[1] - 1), (imgSize[0] - 1) * interpolateTexCoord[0]]; // bound coordinates

    i = max([0, 0], min(diff([imgSize[0], imgSize[1]], [1, 1]), i)); // pxl lower corner

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

/* harmony default export */ __webpack_exports__["default"] = (Canvas);

/***/ }),

/***/ "./src/Canvas_old/main/Canvas2D.js":
/*!*****************************************!*\
  !*** ./src/Canvas_old/main/Canvas2D.js ***!
  \*****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
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
}; // camera : 2-dim array with two 2-dim arrays that are intervals [a,b] | a < b


Canvas2D.prototype.setCamera = function (camera) {
  if (camera.length != 2 || camera[0].length != 2 && camera[1].length != 2) {
    throw "camera space must be 2-dim array with 2-dim arrays representing an interval";
  }

  this.cameraSpace = camera;
};

/* harmony default export */ __webpack_exports__["default"] = (Canvas2D);

/***/ }),

/***/ "./src/Canvas_old/main/ImageIO.js":
/*!****************************************!*\
  !*** ./src/Canvas_old/main/ImageIO.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var ImageIO = {// empty object
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

/* harmony default export */ __webpack_exports__["default"] = (ImageIO);

/***/ }),

/***/ "./src/Color/main/Color.js":
/*!*********************************!*\
  !*** ./src/Color/main/Color.js ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Color; });
/* harmony import */ var _babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");



var Color = /*#__PURE__*/function () {
  /**
   *
   * @param {*} rgba: Uint8Array
   */
  function Color(rgba) {
    Object(_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, Color);

    this.rgba = rgba;
  }

  Object(_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(Color, [{
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
  }], [{
    key: "ofRGBA",
    value: function ofRGBA() {
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



/***/ }),

/***/ "./src/Utils/main/Utils.js":
/*!*********************************!*\
  !*** ./src/Utils/main/Utils.js ***!
  \*********************************/
/*! exports provided: ArrayUtils, perf */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ArrayUtils", function() { return ArrayUtils; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "perf", function() { return perf; });
var ArrayUtils = {};
ArrayUtils.TYPED_ARRAY = {
  Uint8Array: function Uint8Array() {
    for (var _len = arguments.length, array = new Array(_len), _key = 0; _key < _len; _key++) {
      array[_key] = arguments[_key];
    }

    return Uint8ArrayFactory(array);
  }
};

var perf = function perf(lambda) {
  var t = performance.now();
  lambda();
  return performance.now() - t;
};

function Uint8ArrayFactory(array) {
  var answer = new Uint8Array(array.length);

  for (var i = 0; i < answer.length; i++) {
    answer[i] = array[i];
  }

  return answer;
}

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! exports provided: Canvas_old, Canvas2D_old, ImageIO, Canvas, Color, Utils, Animator */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Canvas_old_main_Canvas__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Canvas_old/main/Canvas */ "./src/Canvas_old/main/Canvas.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Canvas_old", function() { return _Canvas_old_main_Canvas__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _Canvas_old_main_Canvas2D__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Canvas_old/main/Canvas2D */ "./src/Canvas_old/main/Canvas2D.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Canvas2D_old", function() { return _Canvas_old_main_Canvas2D__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* harmony import */ var _Canvas_old_main_ImageIO__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Canvas_old/main/ImageIO */ "./src/Canvas_old/main/ImageIO.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ImageIO", function() { return _Canvas_old_main_ImageIO__WEBPACK_IMPORTED_MODULE_2__["default"]; });

/* harmony import */ var _Canvas_main_Canvas__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Canvas/main/Canvas */ "./src/Canvas/main/Canvas.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Canvas", function() { return _Canvas_main_Canvas__WEBPACK_IMPORTED_MODULE_3__["default"]; });

/* harmony import */ var _Color_main_Color__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Color/main/Color */ "./src/Color/main/Color.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Color", function() { return _Color_main_Color__WEBPACK_IMPORTED_MODULE_4__["default"]; });

/* harmony import */ var _Utils_main_Utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Utils/main/Utils */ "./src/Utils/main/Utils.js");
/* harmony reexport (module object) */ __webpack_require__.d(__webpack_exports__, "Utils", function() { return _Utils_main_Utils__WEBPACK_IMPORTED_MODULE_5__; });
/* harmony import */ var _Animator_main_Animator__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Animator/main/Animator */ "./src/Animator/main/Animator.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Animator", function() { return _Animator_main_Animator__WEBPACK_IMPORTED_MODULE_6__["default"]; });










/***/ })

/******/ });
});
//# sourceMappingURL=index.js.map