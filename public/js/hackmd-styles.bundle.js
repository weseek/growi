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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/client/js/hackmd-styles.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/client/js/hackmd-styles.js":
/*!****************************************!*\
  !*** ./src/client/js/hackmd-styles.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/**\n * GROWI styles loader for HackMD\n *\n * This file will be transpiled as a single JS\n *  and should be load from HackMD head via 'routes/hackmd.js' route\n *\n * USAGE:\n *  <script src=\"${hostname of GROWI}/_hackmd/load-styles\"></script>\n *\n * @author Yuki Takei <yuki@weseek.co.jp>\n */\n\n/* eslint-disable no-console  */\nconst styles = '{{styles}}'; // will be replaced by swig\n\n/**\n * Insert link tag to load style file\n */\n\nfunction insertStyle() {\n  const element = document.createElement('style');\n  element.type = 'text/css';\n  element.appendChild(document.createTextNode(unescape(styles)));\n  document.getElementsByTagName('head')[0].appendChild(element);\n}\n/**\n * main\n */\n\n\n(function () {\n  // check HackMD is in iframe\n  if (window === window.parent) {\n    console.log('[GROWI] Loading styles for HackMD is not processed because currently not in iframe');\n    return;\n  }\n\n  console.log('[HackMD] Loading GROWI styles for HackMD...');\n  insertStyle();\n  console.log('[HackMD] GROWI styles for HackMD has successfully loaded.');\n})();//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY2xpZW50L2pzL2hhY2ttZC1zdHlsZXMuanMuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvY2xpZW50L2pzL2hhY2ttZC1zdHlsZXMuanM/YzY3ZiJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEdST1dJIHN0eWxlcyBsb2FkZXIgZm9yIEhhY2tNRFxuICpcbiAqIFRoaXMgZmlsZSB3aWxsIGJlIHRyYW5zcGlsZWQgYXMgYSBzaW5nbGUgSlNcbiAqICBhbmQgc2hvdWxkIGJlIGxvYWQgZnJvbSBIYWNrTUQgaGVhZCB2aWEgJ3JvdXRlcy9oYWNrbWQuanMnIHJvdXRlXG4gKlxuICogVVNBR0U6XG4gKiAgPHNjcmlwdCBzcmM9XCIke2hvc3RuYW1lIG9mIEdST1dJfS9faGFja21kL2xvYWQtc3R5bGVzXCI+PC9zY3JpcHQ+XG4gKlxuICogQGF1dGhvciBZdWtpIFRha2VpIDx5dWtpQHdlc2Vlay5jby5qcD5cbiAqL1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICAqL1xuXG5jb25zdCBzdHlsZXMgPSAne3tzdHlsZXN9fSc7IC8vIHdpbGwgYmUgcmVwbGFjZWQgYnkgc3dpZ1xuXG4vKipcbiAqIEluc2VydCBsaW5rIHRhZyB0byBsb2FkIHN0eWxlIGZpbGVcbiAqL1xuZnVuY3Rpb24gaW5zZXJ0U3R5bGUoKSB7XG4gIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICBlbGVtZW50LnR5cGUgPSAndGV4dC9jc3MnO1xuICBlbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHVuZXNjYXBlKHN0eWxlcykpKTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChlbGVtZW50KTtcbn1cblxuLyoqXG4gKiBtYWluXG4gKi9cbihmdW5jdGlvbigpIHtcbiAgLy8gY2hlY2sgSGFja01EIGlzIGluIGlmcmFtZVxuICBpZiAod2luZG93ID09PSB3aW5kb3cucGFyZW50KSB7XG4gICAgY29uc29sZS5sb2coJ1tHUk9XSV0gTG9hZGluZyBzdHlsZXMgZm9yIEhhY2tNRCBpcyBub3QgcHJvY2Vzc2VkIGJlY2F1c2UgY3VycmVudGx5IG5vdCBpbiBpZnJhbWUnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zb2xlLmxvZygnW0hhY2tNRF0gTG9hZGluZyBHUk9XSSBzdHlsZXMgZm9yIEhhY2tNRC4uLicpO1xuXG4gIGluc2VydFN0eWxlKCk7XG5cbiAgY29uc29sZS5sb2coJ1tIYWNrTURdIEdST1dJIHN0eWxlcyBmb3IgSGFja01EIGhhcyBzdWNjZXNzZnVsbHkgbG9hZGVkLicpO1xufSgpKTtcbiJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7OztBQVlBO0FBRUE7QUFDQTtBQUNBOzs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7Ozs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBRUE7QUFDQSIsInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/client/js/hackmd-styles.js\n");

/***/ })

/******/ });