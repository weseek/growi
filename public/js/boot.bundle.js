/******/ (function(modules) { // webpackBootstrap
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
/******/ 	__webpack_require__.p = "/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/client/js/boot.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/client/js/boot.js":
/*!*******************************!*\
  !*** ./src/client/js/boot.js ***!
  \*******************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _util_color_scheme__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util/color-scheme */ \"./src/client/js/util/color-scheme.js\");\n/* harmony import */ var _util_old_ios__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util/old-ios */ \"./src/client/js/util/old-ios.js\");\n\n\nObject(_util_color_scheme__WEBPACK_IMPORTED_MODULE_0__[\"applyColorScheme\"])();\nObject(_util_old_ios__WEBPACK_IMPORTED_MODULE_1__[\"applyOldIos\"])();//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY2xpZW50L2pzL2Jvb3QuanMuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvY2xpZW50L2pzL2Jvb3QuanM/NjUyNSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBhcHBseUNvbG9yU2NoZW1lLFxufSBmcm9tICcuL3V0aWwvY29sb3Itc2NoZW1lJztcbmltcG9ydCB7XG4gIGFwcGx5T2xkSW9zLFxufSBmcm9tICcuL3V0aWwvb2xkLWlvcyc7XG5cbmFwcGx5Q29sb3JTY2hlbWUoKTtcbmFwcGx5T2xkSW9zKCk7XG4iXSwibWFwcGluZ3MiOiJBQUFBO0FBQUE7QUFBQTtBQUFBO0FBR0E7QUFJQTtBQUNBIiwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/client/js/boot.js\n");

/***/ }),

/***/ "./src/client/js/util/color-scheme.js":
/*!********************************************!*\
  !*** ./src/client/js/util/color-scheme.js ***!
  \********************************************/
/*! exports provided: mediaQueryListForDarkMode, isUserPreferenceExists, isPreferedDarkModeByUser, isDarkMode, applyColorScheme, removeUserPreference, updateUserPreference, updateUserPreferenceWithOsSettings */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"mediaQueryListForDarkMode\", function() { return mediaQueryListForDarkMode; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"isUserPreferenceExists\", function() { return isUserPreferenceExists; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"isPreferedDarkModeByUser\", function() { return isPreferedDarkModeByUser; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"isDarkMode\", function() { return isDarkMode; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"applyColorScheme\", function() { return applyColorScheme; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"removeUserPreference\", function() { return removeUserPreference; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"updateUserPreference\", function() { return updateUserPreference; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"updateUserPreferenceWithOsSettings\", function() { return updateUserPreferenceWithOsSettings; });\nconst mediaQueryListForDarkMode = window.matchMedia('(prefers-color-scheme: dark)');\n\nfunction isUserPreferenceExists() {\n  return localStorage.preferDarkModeByUser != null;\n}\n\nfunction isPreferedDarkModeByUser() {\n  return localStorage.preferDarkModeByUser === 'true';\n}\n\nfunction isDarkMode() {\n  if (isUserPreferenceExists()) {\n    return isPreferedDarkModeByUser();\n  }\n\n  return mediaQueryListForDarkMode.matches;\n}\n/**\n * Apply color scheme as 'dark' attribute of <html></html>\n */\n\n\nfunction applyColorScheme() {\n  let isDarkMode = mediaQueryListForDarkMode.matches;\n\n  if (isUserPreferenceExists()) {\n    isDarkMode = isPreferedDarkModeByUser();\n  } // switch to dark mode\n\n\n  if (isDarkMode) {\n    document.documentElement.removeAttribute('light');\n    document.documentElement.setAttribute('dark', 'true');\n  } // switch to light mode\n  else {\n      document.documentElement.setAttribute('light', 'true');\n      document.documentElement.removeAttribute('dark');\n    }\n}\n/**\n * Remove color scheme preference\n */\n\n\nfunction removeUserPreference() {\n  if (isUserPreferenceExists()) {\n    delete localStorage.removeItem('preferDarkModeByUser');\n  }\n}\n/**\n * Set color scheme preference\n * @param {boolean} isDarkMode\n */\n\n\nfunction updateUserPreference(isDarkMode) {\n  // store settings to localStorage\n  localStorage.preferDarkModeByUser = isDarkMode;\n}\n/**\n * Set color scheme preference with OS settings\n */\n\n\nfunction updateUserPreferenceWithOsSettings() {\n  localStorage.preferDarkModeByUser = mediaQueryListForDarkMode.matches;\n}\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY2xpZW50L2pzL3V0aWwvY29sb3Itc2NoZW1lLmpzLmpzIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vc3JjL2NsaWVudC9qcy91dGlsL2NvbG9yLXNjaGVtZS5qcz8xMjdiIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IG1lZGlhUXVlcnlMaXN0Rm9yRGFya01vZGUgPSB3aW5kb3cubWF0Y2hNZWRpYSgnKHByZWZlcnMtY29sb3Itc2NoZW1lOiBkYXJrKScpO1xuXG5mdW5jdGlvbiBpc1VzZXJQcmVmZXJlbmNlRXhpc3RzKCkge1xuICByZXR1cm4gbG9jYWxTdG9yYWdlLnByZWZlckRhcmtNb2RlQnlVc2VyICE9IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzUHJlZmVyZWREYXJrTW9kZUJ5VXNlcigpIHtcbiAgcmV0dXJuIGxvY2FsU3RvcmFnZS5wcmVmZXJEYXJrTW9kZUJ5VXNlciA9PT0gJ3RydWUnO1xufVxuXG5mdW5jdGlvbiBpc0RhcmtNb2RlKCkge1xuICBpZiAoaXNVc2VyUHJlZmVyZW5jZUV4aXN0cygpKSB7XG4gICAgcmV0dXJuIGlzUHJlZmVyZWREYXJrTW9kZUJ5VXNlcigpO1xuICB9XG4gIHJldHVybiBtZWRpYVF1ZXJ5TGlzdEZvckRhcmtNb2RlLm1hdGNoZXM7XG59XG5cbi8qKlxuICogQXBwbHkgY29sb3Igc2NoZW1lIGFzICdkYXJrJyBhdHRyaWJ1dGUgb2YgPGh0bWw+PC9odG1sPlxuICovXG5mdW5jdGlvbiBhcHBseUNvbG9yU2NoZW1lKCkge1xuICBsZXQgaXNEYXJrTW9kZSA9IG1lZGlhUXVlcnlMaXN0Rm9yRGFya01vZGUubWF0Y2hlcztcbiAgaWYgKGlzVXNlclByZWZlcmVuY2VFeGlzdHMoKSkge1xuICAgIGlzRGFya01vZGUgPSBpc1ByZWZlcmVkRGFya01vZGVCeVVzZXIoKTtcbiAgfVxuXG4gIC8vIHN3aXRjaCB0byBkYXJrIG1vZGVcbiAgaWYgKGlzRGFya01vZGUpIHtcbiAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdsaWdodCcpO1xuICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhcmsnLCAndHJ1ZScpO1xuICB9XG4gIC8vIHN3aXRjaCB0byBsaWdodCBtb2RlXG4gIGVsc2Uge1xuICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2xpZ2h0JywgJ3RydWUnKTtcbiAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdkYXJrJyk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZW1vdmUgY29sb3Igc2NoZW1lIHByZWZlcmVuY2VcbiAqL1xuZnVuY3Rpb24gcmVtb3ZlVXNlclByZWZlcmVuY2UoKSB7XG4gIGlmIChpc1VzZXJQcmVmZXJlbmNlRXhpc3RzKCkpIHtcbiAgICBkZWxldGUgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3ByZWZlckRhcmtNb2RlQnlVc2VyJyk7XG4gIH1cbn1cblxuLyoqXG4gKiBTZXQgY29sb3Igc2NoZW1lIHByZWZlcmVuY2VcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNEYXJrTW9kZVxuICovXG5mdW5jdGlvbiB1cGRhdGVVc2VyUHJlZmVyZW5jZShpc0RhcmtNb2RlKSB7XG4gIC8vIHN0b3JlIHNldHRpbmdzIHRvIGxvY2FsU3RvcmFnZVxuICBsb2NhbFN0b3JhZ2UucHJlZmVyRGFya01vZGVCeVVzZXIgPSBpc0RhcmtNb2RlO1xufVxuXG4vKipcbiAqIFNldCBjb2xvciBzY2hlbWUgcHJlZmVyZW5jZSB3aXRoIE9TIHNldHRpbmdzXG4gKi9cbmZ1bmN0aW9uIHVwZGF0ZVVzZXJQcmVmZXJlbmNlV2l0aE9zU2V0dGluZ3MoKSB7XG4gIGxvY2FsU3RvcmFnZS5wcmVmZXJEYXJrTW9kZUJ5VXNlciA9IG1lZGlhUXVlcnlMaXN0Rm9yRGFya01vZGUubWF0Y2hlcztcbn1cblxuZXhwb3J0IHtcbiAgbWVkaWFRdWVyeUxpc3RGb3JEYXJrTW9kZSxcbiAgaXNVc2VyUHJlZmVyZW5jZUV4aXN0cyxcbiAgaXNQcmVmZXJlZERhcmtNb2RlQnlVc2VyLFxuICBpc0RhcmtNb2RlLFxuICBhcHBseUNvbG9yU2NoZW1lLFxuICByZW1vdmVVc2VyUHJlZmVyZW5jZSxcbiAgdXBkYXRlVXNlclByZWZlcmVuY2UsXG4gIHVwZGF0ZVVzZXJQcmVmZXJlbmNlV2l0aE9zU2V0dGluZ3MsXG59O1xuIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBRUE7Ozs7O0FBR0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSEE7QUFNQTtBQUNBO0FBQ0E7QUFDQTtBQUVBOzs7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTs7Ozs7O0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTs7Ozs7QUFHQTtBQUNBO0FBQ0E7QUFDQTsiLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/client/js/util/color-scheme.js\n");

/***/ }),

/***/ "./src/client/js/util/old-ios.js":
/*!***************************************!*\
  !*** ./src/client/js/util/old-ios.js ***!
  \***************************************/
/*! exports provided: applyOldIos */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"applyOldIos\", function() { return applyOldIos; });\nconst userAgent = window.navigator.userAgent.toLowerCase(); // https://youtrack.weseek.co.jp/issue/GW-4826\n\nconst isOldIos = /(iphone|ipad|ipod) os (9|10|11|12)/.test(userAgent);\n/**\n * Apply 'oldIos' attribute to <html></html>\n */\n\nfunction applyOldIos() {\n  if (isOldIos) {\n    document.documentElement.setAttribute('old-ios', 'true');\n  }\n}\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY2xpZW50L2pzL3V0aWwvb2xkLWlvcy5qcy5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy8uL3NyYy9jbGllbnQvanMvdXRpbC9vbGQtaW9zLmpzP2MxM2IiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgdXNlckFnZW50ID0gd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKTtcbi8vIGh0dHBzOi8veW91dHJhY2sud2VzZWVrLmNvLmpwL2lzc3VlL0dXLTQ4MjZcbmNvbnN0IGlzT2xkSW9zID0gLyhpcGhvbmV8aXBhZHxpcG9kKSBvcyAoOXwxMHwxMXwxMikvLnRlc3QodXNlckFnZW50KTtcblxuLyoqXG4gKiBBcHBseSAnb2xkSW9zJyBhdHRyaWJ1dGUgdG8gPGh0bWw+PC9odG1sPlxuICovXG5mdW5jdGlvbiBhcHBseU9sZElvcygpIHtcbiAgaWYgKGlzT2xkSW9zKSB7XG4gICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNldEF0dHJpYnV0ZSgnb2xkLWlvcycsICd0cnVlJyk7XG4gIH1cbn1cblxuZXhwb3J0IHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9wcmVmZXItZGVmYXVsdC1leHBvcnRcbiAgYXBwbHlPbGRJb3MsXG59O1xuIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUFBO0FBQUE7QUFDQTtBQUNBO0FBRUE7Ozs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Iiwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/client/js/util/old-ios.js\n");

/***/ })

/******/ });