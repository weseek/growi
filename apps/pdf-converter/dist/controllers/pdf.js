import { __decorate, __metadata, __param } from "tslib";
import { BodyParams, Logger } from '@tsed/common';
import { Controller, Inject } from '@tsed/di';
import { InternalServerError } from '@tsed/exceptions';
import { Post, Returns, Enum, Description, } from '@tsed/schema';
import PdfConvertService, { JobStatusSharedWithGrowi, JobStatus } from '../service/pdf-convert.js';
let PdfCtrl = class PdfCtrl {
    pdfConvertService;
    logger;
    constructor(pdfConvertService) {
        this.pdfConvertService = pdfConvertService;
    }
    async syncJobStatus(jobId, expirationDateStr, growiJobStatus) {
        const expirationDate = new Date(expirationDateStr);
        try {
            await this.pdfConvertService.registerOrUpdateJob(jobId, expirationDate, growiJobStatus);
            const status = this.pdfConvertService.getJobStatus(jobId); // get status before cleanup
            this.pdfConvertService.cleanUpJobList();
            return { status };
        }
        catch (err) {
            this.logger.error('Failed to register or update job', err);
            throw new InternalServerError(err);
        }
    }
};
__decorate([
    Inject(),
    __metadata("design:type", Logger)
], PdfCtrl.prototype, "logger", void 0);
__decorate([
    Post('/sync-job'),
    (Returns(202).ContentType('application/json').Schema({
        type: 'object',
        properties: {
            status: { type: 'string', enum: Object.values(JobStatus) },
        },
        required: ['status'],
    })),
    Returns(500),
    Description(`
    Sync job pdf convert status with GROWI.
    Register or update job inside pdf-converter with given jobId, expirationDate, and status.
    Return resulting status of job to GROWI.
  `),
    __param(0, BodyParams('jobId')),
    __param(1, BodyParams('expirationDate')),
    __param(2, BodyParams('status')),
    __param(2, Enum(Object.values(JobStatusSharedWithGrowi))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PdfCtrl.prototype, "syncJobStatus", null);
PdfCtrl = __decorate([
    Controller('/pdf'),
    __metadata("design:paramtypes", [PdfConvertService])
], PdfCtrl);
export default PdfCtrl;
//# sourceMappingURL=pdf.js.map