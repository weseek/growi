import { __decorate, __metadata } from "tslib";
import fs from 'fs';
import path from 'path';
import { Readable, Writable } from 'stream';
import { pipeline as pipelinePromise } from 'stream/promises';
import { Logger } from '@tsed/common';
import { Inject, Service } from '@tsed/di';
import { Cluster } from 'puppeteer-cluster';
export const JobStatusSharedWithGrowi = {
    HTML_EXPORT_IN_PROGRESS: 'HTML_EXPORT_IN_PROGRESS',
    HTML_EXPORT_DONE: 'HTML_EXPORT_DONE',
    FAILED: 'FAILED',
};
export const JobStatus = {
    ...JobStatusSharedWithGrowi,
    PDF_EXPORT_DONE: 'PDF_EXPORT_DONE',
};
let PdfConvertService = class PdfConvertService {
    puppeteerCluster;
    maxConcurrency = 1;
    convertRetryLimit = 5;
    tmpOutputRootDir = '/tmp/page-bulk-export';
    tmpHtmlDir = `${this.tmpOutputRootDir}/html`;
    jobList = {};
    logger;
    async $onInit() {
        if (process.env.SWAGGER_GENERATION === 'true')
            return;
        await this.initPuppeteerCluster();
    }
    /**
     * Register or update job inside jobList with given jobId, expirationDate, and status.
     * If job is new, start reading html files and convert them to pdf.
     * @param jobId id of PageBulkExportJob
     * @param expirationDate expiration date of job
     * @param status status of job
     */
    async registerOrUpdateJob(jobId, expirationDate, status) {
        const isJobNew = !(jobId in this.jobList);
        if (isJobNew) {
            this.jobList[jobId] = { expirationDate, status };
        }
        else {
            const jobInfo = this.jobList[jobId];
            jobInfo.expirationDate = expirationDate;
            if (!this.isJobCompleted(jobId)) {
                jobInfo.status = status;
            }
        }
        if (status === JobStatus.FAILED) {
            this.jobList[jobId].currentStream?.destroy(new Error('job failed'));
        }
        if (isJobNew && status !== JobStatus.FAILED) {
            this.readHtmlAndConvertToPdfUntilFinish(jobId);
        }
    }
    /**
     * Get job status
     * @param jobId id of PageBulkExportJob
     * @returns job status
     */
    getJobStatus(jobId) {
        if (!(jobId in this.jobList))
            return JobStatus.FAILED;
        return this.jobList[jobId].status;
    }
    /**
     * Clean up job list by removing expired jobs, finished jobs, and failed jobs
     */
    cleanUpJobList() {
        const now = new Date();
        for (const jobId of Object.keys(this.jobList)) {
            const job = this.jobList[jobId];
            if (now > job.expirationDate || this.isJobCompleted(jobId)) {
                job.currentStream?.destroy(new Error('job expired'));
                delete this.jobList[jobId];
            }
        }
    }
    /**
     * Close puppeteer cluster
     */
    async closePuppeteerCluster() {
        if (this.puppeteerCluster == null) {
            this.logger.info('No puppeteer cluster running for closure');
            return;
        }
        this.logger.info('Closing puppeteer cluster...');
        await this.puppeteerCluster.idle();
        await this.puppeteerCluster.close();
    }
    isJobCompleted(jobId) {
        if (this.jobList[jobId] == null)
            return true;
        return this.jobList[jobId].status === JobStatus.PDF_EXPORT_DONE || this.jobList[jobId].status === JobStatus.FAILED;
    }
    /**
     * Read html files from shared fs path, convert them to pdf, and save them to shared fs path.
     * Repeat this until all html files are converted to pdf or job fails.
     * @param jobId id of PageBulkExportJob
     */
    async readHtmlAndConvertToPdfUntilFinish(jobId) {
        while (!this.isJobCompleted(jobId)) {
            // eslint-disable-next-line no-await-in-loop
            await new Promise(resolve => setTimeout(resolve, 10 * 1000));
            try {
                if (new Date() > this.jobList[jobId].expirationDate) {
                    throw new Error('Job expired');
                }
                const htmlReadable = this.getHtmlReadable(jobId);
                const pdfWritable = this.getPdfWritable();
                this.jobList[jobId].currentStream = htmlReadable;
                // eslint-disable-next-line no-await-in-loop
                await pipelinePromise(htmlReadable, pdfWritable);
                this.jobList[jobId].currentStream = undefined;
            }
            catch (err) {
                this.logger.error('Failed to convert html to pdf', err);
                this.jobList[jobId].status = JobStatus.FAILED;
                this.jobList[jobId].currentStream?.destroy(new Error('Failed to convert html to pdf'));
                break;
            }
        }
    }
    /**
     * Get readable stream that reads html files from shared fs path
     * @param jobId id of PageBulkExportJob
     * @returns readable stream
     */
    getHtmlReadable(jobId) {
        const htmlFileEntries = fs.readdirSync(path.join(this.tmpHtmlDir, jobId), { recursive: true, withFileTypes: true }).filter(entry => entry.isFile());
        let index = 0;
        const jobList = this.jobList;
        return new Readable({
            objectMode: true,
            async read() {
                if (index >= htmlFileEntries.length) {
                    if (jobList[jobId].status === JobStatus.HTML_EXPORT_DONE && htmlFileEntries.length === 0) {
                        jobList[jobId].status = JobStatus.PDF_EXPORT_DONE;
                    }
                    this.push(null);
                    return;
                }
                const entry = htmlFileEntries[index];
                const htmlFilePath = path.join(entry.parentPath, entry.name);
                const htmlString = await fs.promises.readFile(htmlFilePath, 'utf-8');
                this.push({ htmlString, htmlFilePath });
                index += 1;
            },
        });
    }
    /**
     * Get writable stream that converts html to pdf, and save it to shared fs path
     * @returns writable stream
     */
    getPdfWritable() {
        return new Writable({
            objectMode: true,
            write: async (pageInfo, encoding, callback) => {
                const fileOutputPath = pageInfo.htmlFilePath.replace(new RegExp(`^${this.tmpHtmlDir}`), this.tmpOutputRootDir).replace(/\.html$/, '.pdf');
                const fileOutputParentPath = this.getParentPath(fileOutputPath);
                try {
                    const pdfBody = await this.convertHtmlToPdf(pageInfo.htmlString);
                    await fs.promises.mkdir(fileOutputParentPath, { recursive: true });
                    await fs.promises.writeFile(fileOutputPath, pdfBody);
                    await fs.promises.rm(pageInfo.htmlFilePath, { force: true });
                }
                catch (err) {
                    callback(err);
                    return;
                }
                callback();
            },
        });
    }
    /**
     * Convert html to pdf. Retry up to convertRetryLimit if failed.
     * @param htmlString html to convert to pdf
     * @returns converted pdf
     */
    async convertHtmlToPdf(htmlString) {
        const executeConvert = async (retries) => {
            try {
                return this.puppeteerCluster.execute(htmlString);
            }
            catch (err) {
                if (retries > 0) {
                    this.logger.error('Failed to convert markdown to pdf. Retrying...', err);
                    return executeConvert(retries - 1);
                }
                throw err;
            }
        };
        const result = await executeConvert(this.convertRetryLimit);
        return result;
    }
    /**
     * Initialize puppeteer cluster
     */
    async initPuppeteerCluster() {
        this.puppeteerCluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_PAGE,
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
    }
    /**
     * Get parent path from given path
     * @param path target path
     * @returns parent path
     */
    getParentPath(path) {
        const parentPath = path.split('/').slice(0, -1).join('/');
        if (parentPath === '' || parentPath === '/') {
            return '/';
        }
        return parentPath;
    }
};
__decorate([
    Inject(),
    __metadata("design:type", Logger)
], PdfConvertService.prototype, "logger", void 0);
PdfConvertService = __decorate([
    Service()
], PdfConvertService);
export default PdfConvertService;
//# sourceMappingURL=pdf-convert.js.map