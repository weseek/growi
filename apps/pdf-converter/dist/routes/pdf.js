"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_validator_1 = require("@hono/zod-validator");
const hono_1 = require("hono");
const zod_1 = require("zod");
const pdf_convert_1 = __importStar(require("../service/pdf-convert"));
const logger_1 = __importDefault(require("../utils/logger"));
const logger = (0, logger_1.default)('routes:pdf');
const app = new hono_1.Hono()
    .post('/sync-job', (0, zod_validator_1.zValidator)('json', zod_1.z.object({
    jobId: zod_1.z.string(),
    expirationDate: zod_1.z.string().datetime(),
    status: zod_1.z.enum([pdf_convert_1.JobStatus.HTML_EXPORT_IN_PROGRESS, pdf_convert_1.JobStatus.HTML_EXPORT_DONE, pdf_convert_1.JobStatus.FAILED]),
})), (c) => {
    const { jobId, expirationDate: expirationDateStr, status: growiJobStatus } = c.req.valid('json');
    const expirationDate = new Date(expirationDateStr);
    try {
        pdf_convert_1.default.registerOrUpdateJob(jobId, expirationDate, growiJobStatus);
        pdf_convert_1.default.cleanUpJobList();
        return c.json({ status: pdf_convert_1.default.getJobStatus(jobId) });
    }
    catch (err) {
        logger.error(err);
        return c.json({ err }, 500);
    }
});
exports.default = app;
