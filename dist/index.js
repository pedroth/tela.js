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

/***/ "./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js ***!
  \*********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _arrayLikeToArray; });
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js ***!
  \*******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _arrayWithHoles; });
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js ***!
  \**********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _arrayWithoutHoles; });
/* harmony import */ var _arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayLikeToArray.js */ "./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js");

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return Object(_arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__["default"])(arr);
}

/***/ }),

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

/***/ "./node_modules/@babel/runtime/helpers/esm/iterableToArray.js":
/*!********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/iterableToArray.js ***!
  \********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _iterableToArray; });
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js ***!
  \*************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _iterableToArrayLimit; });
function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js":
/*!********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js ***!
  \********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _nonIterableRest; });
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js ***!
  \**********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _nonIterableSpread; });
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
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

/***/ "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js":
/*!******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/slicedToArray.js ***!
  \******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _slicedToArray; });
/* harmony import */ var _arrayWithHoles_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayWithHoles.js */ "./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js");
/* harmony import */ var _iterableToArrayLimit_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./iterableToArrayLimit.js */ "./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js");
/* harmony import */ var _unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./unsupportedIterableToArray.js */ "./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js");
/* harmony import */ var _nonIterableRest_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./nonIterableRest.js */ "./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js");




function _slicedToArray(arr, i) {
  return Object(_arrayWithHoles_js__WEBPACK_IMPORTED_MODULE_0__["default"])(arr) || Object(_iterableToArrayLimit_js__WEBPACK_IMPORTED_MODULE_1__["default"])(arr, i) || Object(_unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(arr, i) || Object(_nonIterableRest_js__WEBPACK_IMPORTED_MODULE_3__["default"])();
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js ***!
  \**********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _toConsumableArray; });
/* harmony import */ var _arrayWithoutHoles_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayWithoutHoles.js */ "./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js");
/* harmony import */ var _iterableToArray_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./iterableToArray.js */ "./node_modules/@babel/runtime/helpers/esm/iterableToArray.js");
/* harmony import */ var _unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./unsupportedIterableToArray.js */ "./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js");
/* harmony import */ var _nonIterableSpread_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./nonIterableSpread.js */ "./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js");




function _toConsumableArray(arr) {
  return Object(_arrayWithoutHoles_js__WEBPACK_IMPORTED_MODULE_0__["default"])(arr) || Object(_iterableToArray_js__WEBPACK_IMPORTED_MODULE_1__["default"])(arr) || Object(_unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(arr) || Object(_nonIterableSpread_js__WEBPACK_IMPORTED_MODULE_3__["default"])();
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js ***!
  \*******************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _unsupportedIterableToArray; });
/* harmony import */ var _arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayLikeToArray.js */ "./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js");

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return Object(_arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__["default"])(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return Object(_arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__["default"])(o, minLen);
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

/***/ "./src/BBox/main/BBox.js":
/*!*******************************!*\
  !*** ./src/BBox/main/BBox.js ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return BBox; });
/* harmony import */ var _babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _Matrix_main_Matrix__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../Matrix/main/Matrix */ "./src/Matrix/main/Matrix.js");





var BBox = /*#__PURE__*/function () {
  function BBox(min, max) {
    Object(_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, BBox);

    Object(_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "union", this.add);

    Object(_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(this, "inter", this.sub);

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


  Object(_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(BBox, [{
    key: "add",
    value: function add(box) {
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

Object(_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_2__["default"])(BBox, "EMPTY", new BBox());



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
/* harmony import */ var _babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/esm/toConsumableArray */ "./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js");
/* harmony import */ var _babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/esm/slicedToArray */ "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var _babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @babel/runtime/helpers/esm/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _Color_main_Color__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../Color/main/Color */ "./src/Color/main/Color.js");
/* harmony import */ var _Matrix_main_Matrix__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../Matrix/main/Matrix */ "./src/Matrix/main/Matrix.js");
/* harmony import */ var _BBox_main_BBox__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../BBox/main/BBox */ "./src/BBox/main/BBox.js");










function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = Object(_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_2__["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = Object(_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_2__["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return Object(_babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_1__["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }




var vec2 = _Matrix_main_Matrix__WEBPACK_IMPORTED_MODULE_10__["default"].vec2;
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
    Object(_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_6__["default"])(this, Canvas);

    Object(_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_8__["default"])(this, "getDom", this.getCanvas);

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.image = this.ctx.getImageData(0, 0, canvas.width, canvas.height); // width * height * 4 array of integers

    this.imgBuffer = this.image.data;
  }

  Object(_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_7__["default"])(Canvas, [{
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
        var color = lambda(_Color_main_Color__WEBPACK_IMPORTED_MODULE_9__["default"].ofRGBA(this.imgBuffer[i], this.imgBuffer[i + 1], this.imgBuffer[i + 2], this.imgBuffer[i + 3]), x, y);
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
      var index = 4 * (i * width + j);
      return _Color_main_Color__WEBPACK_IMPORTED_MODULE_9__["default"].ofRGBA(this.imgBuffer[index], this.imgBuffer[index + 1], this.imgBuffer[index + 2], this.imgBuffer[index + 3]);
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
      if ((i < 0 || i >= height) && (j < 0 || j >= width)) return this;
      var index = 4 * (i * width + j);
      this.imgBuffer[index] = color.red;
      this.imgBuffer[index + 1] = color.green;
      this.imgBuffer[index + 2] = color.blue;
      this.imgBuffer[index + 3] = color.alpha;
      return this;
    }
    /**
     *
     * @param {*} start: 2-Array
     * @param {*} end: 2-Array
     * @param {}
     */

  }, {
    key: "drawLine",
    value: function drawLine(start, end) {
      var shader = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (x, y) {
        return _Color_main_Color__WEBPACK_IMPORTED_MODULE_9__["default"].ofRGBA(0, 0, 0);
      };
      var _this$canvas3 = this.canvas,
          width = _this$canvas3.width,
          height = _this$canvas3.height;

      var line = this._clipLine(start, end);

      var _line = Object(_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_5__["default"])(line, 2),
          p0 = _line[0],
          p1 = _line[1];

      var v = p1.sub(p0);
      var n = v.reduce(function (e, x) {
        return e + Math.abs(x);
      });

      for (var k = 0; k < n; k++) {
        var x = p0.add(v.scale(k / n)).map(Math.floor);

        var _x$data = Object(_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_5__["default"])(x.data, 2),
            i = _x$data[0],
            j = _x$data[1];

        var index = 4 * (i * width + j);
        var color = shader(i, j);
        this.imgBuffer[index] = color.red;
        this.imgBuffer[index + 1] = color.green;
        this.imgBuffer[index + 2] = color.blue;
        this.imgBuffer[index + 3] = color.alpha;
      }

      return this;
    }
  }, {
    key: "paint",
    value: function paint() {
      this.ctx.putImageData(this.image, 0, 0);
    } //========================================================================================

    /*                                                                                      *
     *                                  Auxiliary functions                                  *
     *                                                                                      */
    //========================================================================================

    /**
     *
     * @param {*} start: 2-Array<Number>
     * @param {*} end: 2-Array<Number>
     * @returns 2-Array<vec2>
     */

  }, {
    key: "_clipLine",
    value: function _clipLine(start, end) {
      var _this$canvas4 = this.canvas,
          width = _this$canvas4.width,
          height = _this$canvas4.height;
      var bbox = new _BBox_main_BBox__WEBPACK_IMPORTED_MODULE_11__["default"](vec2.ZERO, vec2.of(height, width));
      var pointStack = [start, end].map(function (x) {
        return vec2.of.apply(vec2, Object(_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_4__["default"])(x));
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
      } // both points are inside


      if (inStack.length >= 2) {
        return inStack;
      } // one of them is inside


      if (inStack.length === 1) {
        var inPoint = inStack[0];
        var outPoint = outStack[0];
        return this._getLineCanvasIntersection(inPoint, outPoint);
      } // both points are outside,need to intersect the boundary


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

      var _this$canvas5 = this.canvas,
          width = _this$canvas5.width,
          height = _this$canvas5.height;
      var v = end.sub(start); // point and direction of boundary

      var boundary = [[vec2.ZERO, vec2.of(height, 0)], [vec2.of(height, 0), vec2.of(0, width)], [vec2.of(height, 0).add(vec2.of(0, width)), vec2.of(-height, 0)], [vec2.of(0, width), vec2.of(0, -width)]];
      var intersectionSolutions = [];
      boundary.forEach(function (_ref) {
        var _ref2 = Object(_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_5__["default"])(_ref, 2),
            s = _ref2[0],
            d = _ref2[1];

        if (d.get(0) === 0) {
          var solution = _this._solveLowTriMatrix(v, d.get(1), s.sub(start));

          solution !== undefined && intersectionSolutions.push(solution);
        } else {
          var _solution = _this._solveUpTriMatrix(v, d.get(0), s.sub(start));

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
      var v12 = v1 * v2;
      if (v12 === 0 || v1 === 0) return undefined;
      var f1 = f.get(0);
      var f2 = f.get(1);
      return vec2.of(f1 / v1, (f2 * v1 - a * f1) / v12);
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
    } //========================================================================================

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
    Object(_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_6__["default"])(this, CanvasBuilder);

    Object(_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_8__["default"])(this, "_canvas", document.createElement("canvas"));

    Object(_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_8__["default"])(this, "_width", 500);

    Object(_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_8__["default"])(this, "_height", 500);
  }

  Object(_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_7__["default"])(CanvasBuilder, [{
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
    Object(_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_6__["default"])(this, CanvasException);

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

/***/ "./src/Matrix/main/Matrix.js":
/*!***********************************!*\
  !*** ./src/Matrix/main/Matrix.js ***!
  \***********************************/
/*! exports provided: default, MatrixError */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Matrix; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MatrixError", function() { return MatrixError; });
/* harmony import */ var _babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/inherits */ "./node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _babel_runtime_helpers_esm_wrapNativeSuper__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/esm/wrapNativeSuper */ "./node_modules/@babel/runtime/helpers/esm/wrapNativeSuper.js");
/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/esm/toConsumableArray */ "./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js");
/* harmony import */ var _babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @babel/runtime/helpers/esm/slicedToArray */ "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var _babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @babel/runtime/helpers/esm/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");










function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = Object(_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_2__["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = Object(_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_2__["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return Object(_babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_1__["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

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
    Object(_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_7__["default"])(this, MatrixBuilder);

    this._size = [];
    this.data = {};
  }

  Object(_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_8__["default"])(MatrixBuilder, [{
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

      var _this$_size = Object(_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_6__["default"])(this._size, 2),
          n = _this$_size[0],
          m = _this$_size[1];

      var data = new Float64Array(n * m);
      var indexer = getIndexFromCoord(n, m);
      Object.keys(this.data).forEach(function (key) {
        data[indexer.apply(void 0, Object(_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_5__["default"])(key2Index(key)))] = _this.data[key];
      });
      return new Matrix(data, this._size);
    }
  }]);

  return MatrixBuilder;
}();

var _buildWithRows = /*#__PURE__*/new WeakSet();

var RowBuilder = /*#__PURE__*/function () {
  function RowBuilder() {
    Object(_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_7__["default"])(this, RowBuilder);

    _buildWithRows.add(this);

    this.rows = [];
    this.dim = 0;
  }

  Object(_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_8__["default"])(RowBuilder, [{
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
      if (this.rows.length > 0) return _classPrivateMethodGet(this, _buildWithRows, _buildWithRows2).call(this);
      throw new MatrixError("Building empty matrix");
    }
  }]);

  return RowBuilder;
}();

function _buildWithRows2() {
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

var _buildWithCols = /*#__PURE__*/new WeakSet();

var ColBuilder = /*#__PURE__*/function () {
  function ColBuilder() {
    Object(_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_7__["default"])(this, ColBuilder);

    _buildWithCols.add(this);

    this.cols = [];
    this.dim = 0;
  }

  Object(_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_8__["default"])(ColBuilder, [{
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
   * @param {*} data: Float64Array; Matrix data in major row format
   * @param {*} shape: 2-array [rows,columns]
   */
  function Matrix(data, shape) {
    Object(_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_7__["default"])(this, Matrix);

    Object(_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_4__["default"])(this, "fold", this.reduce);

    Object(_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_4__["default"])(this, "length", this.norm);

    this.data = data;
    this.shape = shape;
  }

  Object(_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_8__["default"])(Matrix, [{
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

      var _this$shape = Object(_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_6__["default"])(this.shape, 2),
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
      var getCoord = getCoordFromIndex.apply(void 0, Object(_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_5__["default"])(this.shape));
      return new Matrix(this.data.map(function (x, k) {
        var _getCoord = getCoord(k),
            _getCoord2 = Object(_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_6__["default"])(_getCoord, 2),
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
      var getCoord = getCoordFromIndex.apply(void 0, Object(_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_5__["default"])(this.shape));
      return this.data.reduce(function (e, x, k) {
        var _getCoord3 = getCoord(k),
            _getCoord4 = Object(_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_6__["default"])(_getCoord3, 2),
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
      var _this$shape2 = Object(_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_6__["default"])(this.shape, 2),
          rows = _this$shape2[0],
          cols = _this$shape2[1];

      var _matrix$shape = Object(_babel_runtime_helpers_esm_slicedToArray__WEBPACK_IMPORTED_MODULE_6__["default"])(matrix.shape, 2),
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
  }], [{
    key: "ZERO",
    value: function ZERO(n) {
      var m = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      return Matrix.builder().size(n, m).build();
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

Object(_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_4__["default"])(Matrix, "id", function (n) {
  var m = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : n;
  var en = Matrix.e(n);
  var matrixBuilder = Matrix.colBuilder();

  for (var i = 0; i < m; i++) {
    var _matrixBuilder;

    matrixBuilder = (_matrixBuilder = matrixBuilder).addCol.apply(_matrixBuilder, Object(_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_5__["default"])(en(i).data));
  }

  return matrixBuilder.build();
});

Object(_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_4__["default"])(Matrix, "e", function (n) {
  return function (i) {
    return new Matrix(new Float64Array(n).map(function (_, j) {
      return i === j ? 1 : 0;
    }), [n, 1]);
  };
});

Object(_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_4__["default"])(Matrix, "dx", function (n) {
  return function (i) {
    return new Matrix(new Float64Array(n).map(function (_, j) {
      return i === j ? 1 : 0;
    }), [1, n]);
  };
});

Object(_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_4__["default"])(Matrix, "vec2", {
  of: function of() {
    var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    return Matrix.vec(x, y);
  },
  e0: Matrix.vec(1, 0),
  e1: Matrix.vec(0, 1),
  ZERO: Matrix.ZERO(2, 1)
});

Object(_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_4__["default"])(Matrix, "vec3", {
  of: function of() {
    var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    return Matrix.vec(x, y, z);
  },
  e0: Matrix.vec(1, 0, 0),
  e1: Matrix.vec(0, 1, 0),
  e2: Matrix.vec(0, 0, 1),
  ZERO: Matrix.ZERO(3, 1)
});


var MatrixError = /*#__PURE__*/function (_Error) {
  Object(_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_0__["default"])(MatrixError, _Error);

  var _super = _createSuper(MatrixError);

  function MatrixError() {
    Object(_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_7__["default"])(this, MatrixError);

    return _super.apply(this, arguments);
  }

  return MatrixError;
}( /*#__PURE__*/Object(_babel_runtime_helpers_esm_wrapNativeSuper__WEBPACK_IMPORTED_MODULE_3__["default"])(Error));

/***/ }),

/***/ "./src/Utils/main/Utils.js":
/*!*********************************!*\
  !*** ./src/Utils/main/Utils.js ***!
  \*********************************/
/*! exports provided: perf, test */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "perf", function() { return perf; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "test", function() { return test; });
var perf = function perf(lambda) {
  var t = performance.now();
  lambda();
  return performance.now() - t;
};
/**
 * Unit test maker
 * @param {*} title
 * @param {*} lambda: (width:number, height: number) => {}
 */

function test(title) {
  var lambda = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};
  var canvas;

  var canvasFactory = function canvasFactory(width, height) {
    canvas = Canvas.builder().width(width).height(height).build();
    return canvas;
  };

  var timeInMillis = perf(function () {
    return lambda(canvasFactory);
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

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! exports provided: Canvas_old, Canvas2D_old, ImageIO, Canvas, Color, Utils, Animator, Matrix */
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

/* harmony import */ var _Matrix_main_Matrix__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Matrix/main/Matrix */ "./src/Matrix/main/Matrix.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Matrix", function() { return _Matrix_main_Matrix__WEBPACK_IMPORTED_MODULE_7__["default"]; });











/***/ })

/******/ });
});
//# sourceMappingURL=index.js.map