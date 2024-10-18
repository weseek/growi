"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const universal_bunyan_1 = require("universal-bunyan");
const loggerFactory = function (name) {
    return (0, universal_bunyan_1.createLogger)({ name });
};
exports.default = loggerFactory;
