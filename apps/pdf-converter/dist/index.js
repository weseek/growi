"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pdfConverterHc = void 0;
const node_server_1 = require("@hono/node-server");
const hono_1 = require("hono");
const client_1 = require("hono/client");
const logger_1 = require("hono/logger");
const pdf_1 = __importDefault(require("./routes/pdf"));
const app = new hono_1.Hono();
app.use((0, logger_1.logger)());
const routes = app.route('/pdf', pdf_1.default);
const port = 3004;
(0, node_server_1.serve)({
    fetch: app.fetch,
    port,
});
const client = (0, client_1.hc)('');
const pdfConverterHc = (...args) => (0, client_1.hc)(...args);
exports.pdfConverterHc = pdfConverterHc;
