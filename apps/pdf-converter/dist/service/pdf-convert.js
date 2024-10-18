"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobStatus = exports.JobStatusSharedWithGrowi = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const stream_1 = require("stream");
const promises_1 = require("stream/promises");
const puppeteer_cluster_1 = require("puppeteer-cluster");
const logger_1 = __importDefault(require("../utils/logger"));
const logger = (0, logger_1.default)('services:PdfConvertService');
exports.JobStatusSharedWithGrowi = {
    HTML_EXPORT_IN_PROGRESS: 'HTML_EXPORT_IN_PROGRESS',
    HTML_EXPORT_DONE: 'HTML_EXPORT_DONE',
    FAILED: 'FAILED',
};
exports.JobStatus = {
    ...exports.JobStatusSharedWithGrowi,
    PDF_EXPORT_DONE: 'PDF_EXPORT_DONE',
};
class PdfConvertService {
    constructor() {
        this.maxConcurrency = 1;
        this.convertRetryLimit = 5;
        this.tmpOutputRootDir = '/tmp/page-bulk-export';
        this.tmpHtmlDir = `${this.tmpOutputRootDir}/html`;
        this.jobList = {};
        this.initPuppeteerCluster();
    }
    registerOrUpdateJob(jobId, expirationDate, status) {
        const isJobNew = !(jobId in this.jobList);
        if (isJobNew) {
            this.jobList[jobId] = { expirationDate, status };
        }
        else {
            const jobInfo = this.jobList[jobId];
            jobInfo.expirationDate = expirationDate;
            if (![exports.JobStatus.PDF_EXPORT_DONE, exports.JobStatus.FAILED].includes(jobInfo.status)) {
                jobInfo.status = status;
            }
        }
        if (status === exports.JobStatus.FAILED) {
            this.jobList[jobId].currentStream?.destroy(new Error('job failed'));
        }
        if (isJobNew && status !== exports.JobStatus.FAILED) {
            this.readHtmlAndConvertToPdfUntilFinish(jobId);
        }
    }
    getJobStatus(jobId) {
        if (!(jobId in this.jobList))
            return exports.JobStatus.FAILED;
        return this.jobList[jobId].status;
    }
    cleanUpJobList() {
        const now = new Date();
        for (const jobId of Object.keys(this.jobList)) {
            const job = this.jobList[jobId];
            if (now > job.expirationDate && [exports.JobStatus.PDF_EXPORT_DONE, exports.JobStatus.FAILED].includes(job.status)) {
                job.currentStream?.destroy(new Error('job expired'));
                delete this.jobList[jobId];
            }
        }
    }
    async readHtmlAndConvertToPdfUntilFinish(jobId) {
        while (![exports.JobStatus.PDF_EXPORT_DONE, exports.JobStatus.FAILED].includes(this.jobList[jobId].status)) {
            // eslint-disable-next-line no-await-in-loop
            await new Promise(resolve => setTimeout(resolve, 60 * 1000));
            try {
                if (new Date() > this.jobList[jobId].expirationDate) {
                    throw new Error('Job expired');
                }
                const htmlReadable = this.getHtmlReadable(jobId);
                const pdfWritable = this.getPdfWritable();
                this.jobList[jobId].currentStream = htmlReadable;
                // eslint-disable-next-line no-await-in-loop
                await (0, promises_1.pipeline)(htmlReadable, pdfWritable);
            }
            catch (err) {
                logger.error('Failed to convert html to pdf', err);
                this.jobList[jobId].status = exports.JobStatus.FAILED;
                this.jobList[jobId].currentStream?.destroy(new Error('Failed to convert html to pdf'));
                break;
            }
        }
    }
    getHtmlReadable(jobId) {
        const htmlFileEntries = fs_1.default.existsSync(path_1.default.join(this.tmpHtmlDir, jobId))
            ? fs_1.default.readdirSync(path_1.default.join(this.tmpHtmlDir, jobId), { recursive: true, withFileTypes: true }).filter(entry => entry.isFile()) : [];
        let index = 0;
        const jobList = this.jobList;
        return new stream_1.Readable({
            objectMode: true,
            async read() {
                if (index >= htmlFileEntries.length) {
                    if (jobList[jobId].status === exports.JobStatus.HTML_EXPORT_DONE && htmlFileEntries.length === 0) {
                        jobList[jobId].status = exports.JobStatus.PDF_EXPORT_DONE;
                    }
                    this.push(null);
                    return;
                }
                const entry = htmlFileEntries[index];
                const htmlFilePath = path_1.default.join(entry.parentPath, entry.name);
                const htmlString = await fs_1.default.promises.readFile(htmlFilePath, 'utf-8');
                this.push({ htmlString, htmlFilePath });
                index += 1;
            },
        });
    }
    getPdfWritable() {
        return new stream_1.Writable({
            objectMode: true,
            write: async (pageInfo, encoding, callback) => {
                const fileOutputPath = pageInfo.htmlFilePath.replace(new RegExp(`^${this.tmpHtmlDir}`), this.tmpOutputRootDir).replace(/\.html$/, '.pdf');
                const fileOutputParentPath = this.getParentPath(fileOutputPath);
                try {
                    const pdfBody = await this.convertHtmlToPdf(pageInfo.htmlString);
                    await fs_1.default.promises.mkdir(fileOutputParentPath, { recursive: true });
                    await fs_1.default.promises.writeFile(fileOutputPath, pdfBody);
                    await fs_1.default.promises.rm(pageInfo.htmlFilePath, { force: true });
                }
                catch (err) {
                    callback(err instanceof Error ? err : new Error(String(err)));
                    return;
                }
                callback();
            },
        });
    }
    async convertHtmlToPdf(htmlString) {
        const executeConvert = async (retries) => {
            try {
                return this.puppeteerCluster?.execute(htmlString);
            }
            catch (err) {
                if (retries > 0) {
                    logger.error('Failed to convert markdown to pdf. Retrying...', err);
                    return executeConvert(retries - 1);
                }
                throw err;
            }
        };
        const result = await executeConvert(this.convertRetryLimit);
        return result;
    }
    async initPuppeteerCluster() {
        this.puppeteerCluster = await puppeteer_cluster_1.Cluster.launch({
            concurrency: puppeteer_cluster_1.Cluster.CONCURRENCY_PAGE,
            maxConcurrency: this.maxConcurrency,
            workerCreationDelay: 10000,
        });
        await this.puppeteerCluster.task(async ({ page, data: htmlString }) => {
            await page.setContent(htmlString, { waitUntil: 'domcontentloaded' });
            await page.emulateMediaType('screen');
            const pdfResult = await page.pdf({
                margin: {
                    top: '100px', right: '50px', bottom: '100px', left: '50px',
                },
                printBackground: true,
                format: 'A4',
            });
            return pdfResult;
        });
        // close cluster on app termination
        const handleClose = async () => {
            logger.info('Closing puppeteer cluster...');
            await this.puppeteerCluster?.idle();
            await this.puppeteerCluster?.close();
            process.exit();
        };
        process.on('SIGINT', handleClose);
        process.on('SIGTERM', handleClose);
    }
    getParentPath(path) {
        const parentPath = path.split('/').slice(0, -1).join('/');
        if (parentPath === '' || parentPath === '/') {
            return '/';
        }
        return parentPath;
    }
}
const pdfConvertService = new PdfConvertService();
exports.default = pdfConvertService;
