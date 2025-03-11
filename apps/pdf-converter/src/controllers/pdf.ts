import { BodyParams } from '@tsed/common';
import { Controller } from '@tsed/di';
import { InternalServerError } from '@tsed/exceptions';
import { Logger } from '@tsed/logger';
import {
  Post, Returns, Enum, Description,
} from '@tsed/schema';

import PdfConvertService, { JobStatusSharedWithGrowi, JobStatus } from '../service/pdf-convert.js';

@Controller('/pdf')
class PdfCtrl {

  constructor(private readonly pdfConvertService: PdfConvertService, private readonly logger: Logger) {}

  @Post('/sync-job')
  @(Returns(202).ContentType('application/json').Schema({
    type: 'object',
    properties: {
      status: { type: 'string', enum: Object.values(JobStatus) },
    },
    required: ['status'],
  }))
  @Returns(500)
  @Description(`
    Sync job pdf convert status with GROWI.
    Register or update job inside pdf-converter with given jobId, expirationDate, and status.
    Return resulting status of job to GROWI.
  `)
  async syncJobStatus(
    @BodyParams('jobId') jobId: string,
    @BodyParams('expirationDate') expirationDateStr: string,
    @BodyParams('status') @Enum(Object.values(JobStatusSharedWithGrowi)) growiJobStatus: JobStatusSharedWithGrowi,
  ): Promise<{ status: JobStatus }> {
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

}

export default PdfCtrl;
