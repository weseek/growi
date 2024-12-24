import { Logger } from '@tsed/common';
import PdfConvertService, { JobStatusSharedWithGrowi, JobStatus } from '../service/pdf-convert.js';
declare class PdfCtrl {
    private readonly pdfConvertService;
    logger: Logger;
    constructor(pdfConvertService: PdfConvertService);
    syncJobStatus(jobId: string, expirationDateStr: string, growiJobStatus: JobStatusSharedWithGrowi): Promise<{
        status: JobStatus;
    }>;
}
export default PdfCtrl;
