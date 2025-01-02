import type { AxiosRequestConfig, AxiosResponse } from 'axios';
export type PdfCtrlSyncJobStatus202Status = typeof PdfCtrlSyncJobStatus202Status[keyof typeof PdfCtrlSyncJobStatus202Status];
export declare const PdfCtrlSyncJobStatus202Status: {
    readonly HTML_EXPORT_IN_PROGRESS: "HTML_EXPORT_IN_PROGRESS";
    readonly HTML_EXPORT_DONE: "HTML_EXPORT_DONE";
    readonly FAILED: "FAILED";
    readonly PDF_EXPORT_DONE: "PDF_EXPORT_DONE";
};
export type PdfCtrlSyncJobStatus202 = {
    status: PdfCtrlSyncJobStatus202Status;
};
export type PdfCtrlSyncJobStatusBodyStatus = typeof PdfCtrlSyncJobStatusBodyStatus[keyof typeof PdfCtrlSyncJobStatusBodyStatus];
export declare const PdfCtrlSyncJobStatusBodyStatus: {
    readonly HTML_EXPORT_IN_PROGRESS: "HTML_EXPORT_IN_PROGRESS";
    readonly HTML_EXPORT_DONE: "HTML_EXPORT_DONE";
    readonly FAILED: "FAILED";
};
export type PdfCtrlSyncJobStatusBody = {
    expirationDate?: string;
    jobId?: string;
    status?: PdfCtrlSyncJobStatusBodyStatus;
};
export interface GenericError {
    /**
     * An error message
     * @minLength 1
     */
    message: string;
    /**
     * The error name
     * @minLength 1
     */
    name: string;
    [key: string]: unknown;
}
export interface InternalServerError {
    /** A list of related errors */
    errors?: GenericError[];
    /**
     * An error message
     * @minLength 1
     */
    message: string;
    /**
     * The error name
     * @minLength 1
     */
    name: string;
    /** The stack trace (only in development mode) */
    stack?: string;
    /** The status code of the exception */
    status: number;
}
/**
*
  Sync job pdf convert status with GROWI.
  Register or update job inside pdf-converter with given jobId, expirationDate, and status.
  Return resulting status of job to GROWI.

*/
export declare const pdfCtrlSyncJobStatus: <TData = AxiosResponse<PdfCtrlSyncJobStatus202, any>>(pdfCtrlSyncJobStatusBody?: PdfCtrlSyncJobStatusBody, options?: AxiosRequestConfig) => Promise<TData>;
export type PdfCtrlSyncJobStatusResult = AxiosResponse<PdfCtrlSyncJobStatus202>;
