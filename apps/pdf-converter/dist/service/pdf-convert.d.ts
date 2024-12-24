import { Logger, OnInit } from '@tsed/common';
export declare const JobStatusSharedWithGrowi: {
    readonly HTML_EXPORT_IN_PROGRESS: "HTML_EXPORT_IN_PROGRESS";
    readonly HTML_EXPORT_DONE: "HTML_EXPORT_DONE";
    readonly FAILED: "FAILED";
};
export declare const JobStatus: {
    readonly PDF_EXPORT_DONE: "PDF_EXPORT_DONE";
    readonly HTML_EXPORT_IN_PROGRESS: "HTML_EXPORT_IN_PROGRESS";
    readonly HTML_EXPORT_DONE: "HTML_EXPORT_DONE";
    readonly FAILED: "FAILED";
};
export type JobStatusSharedWithGrowi = typeof JobStatusSharedWithGrowi[keyof typeof JobStatusSharedWithGrowi];
export type JobStatus = typeof JobStatus[keyof typeof JobStatus];
declare class PdfConvertService implements OnInit {
    private puppeteerCluster;
    private maxConcurrency;
    private convertRetryLimit;
    private tmpOutputRootDir;
    private tmpHtmlDir;
    private jobList;
    logger: Logger;
    $onInit(): Promise<void>;
    /**
     * Register or update job inside jobList with given jobId, expirationDate, and status.
     * If job is new, start reading html files and convert them to pdf.
     * @param jobId id of PageBulkExportJob
     * @param expirationDate expiration date of job
     * @param status status of job
     */
    registerOrUpdateJob(jobId: string, expirationDate: Date, status: JobStatusSharedWithGrowi): Promise<void>;
    /**
     * Get job status
     * @param jobId id of PageBulkExportJob
     * @returns job status
     */
    getJobStatus(jobId: string): JobStatus;
    /**
     * Clean up job list by removing expired jobs, finished jobs, and failed jobs
     */
    cleanUpJobList(): void;
    /**
     * Close puppeteer cluster
     */
    closePuppeteerCluster(): Promise<void>;
    private isJobCompleted;
    /**
     * Read html files from shared fs path, convert them to pdf, and save them to shared fs path.
     * Repeat this until all html files are converted to pdf or job fails.
     * @param jobId id of PageBulkExportJob
     */
    private readHtmlAndConvertToPdfUntilFinish;
    /**
     * Get readable stream that reads html files from shared fs path
     * @param jobId id of PageBulkExportJob
     * @returns readable stream
     */
    private getHtmlReadable;
    /**
     * Get writable stream that converts html to pdf, and save it to shared fs path
     * @returns writable stream
     */
    private getPdfWritable;
    /**
     * Convert html to pdf. Retry up to convertRetryLimit if failed.
     * @param htmlString html to convert to pdf
     * @returns converted pdf
     */
    private convertHtmlToPdf;
    /**
     * Initialize puppeteer cluster
     */
    private initPuppeteerCluster;
    /**
     * Get parent path from given path
     * @param path target path
     * @returns parent path
     */
    private getParentPath;
}
export default PdfConvertService;
