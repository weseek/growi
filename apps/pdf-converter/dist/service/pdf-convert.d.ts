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
type JobStatusSharedWithGrowi = typeof JobStatusSharedWithGrowi[keyof typeof JobStatusSharedWithGrowi];
export type JobStatus = typeof JobStatus[keyof typeof JobStatus];
declare class PdfConvertService {
    private puppeteerCluster;
    private maxConcurrency;
    private convertRetryLimit;
    private tmpOutputRootDir;
    private tmpHtmlDir;
    private jobList;
    constructor();
    registerOrUpdateJob(jobId: string, expirationDate: Date, status: JobStatusSharedWithGrowi): void;
    getJobStatus(jobId: string): JobStatus;
    cleanUpJobList(): void;
    private readHtmlAndConvertToPdfUntilFinish;
    private getHtmlReadable;
    private getPdfWritable;
    private convertHtmlToPdf;
    private initPuppeteerCluster;
    private getParentPath;
}
declare const pdfConvertService: PdfConvertService;
export default pdfConvertService;
