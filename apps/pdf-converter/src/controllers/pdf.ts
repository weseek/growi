import type { Logger } from '@tsed/common';
import { BodyParams } from '@tsed/common';
import { Controller, Inject } from '@tsed/di';
import { InternalServerError } from '@tsed/exceptions';
import { Post, Returns, Enum } from '@tsed/schema';

import { JobStatusSharedWithGrowi } from '../service/pdf-convert';
import type { JobStatus } from '../service/pdf-convert';
import type PdfConvertService from '../service/pdf-convert';

@Controller('/pdf')
class PdfCtrl {

  @Inject()
    logger: Logger;

  constructor(private readonly pdfConvertService: PdfConvertService) {}

  @Post('/sync-job')
  @Returns(202)
  @Returns(500)
  async syncJobStatus(
    @BodyParams('jobId') jobId: string,
    @BodyParams('expirationDate') expirationDateStr: string,
    @BodyParams('status') @Enum(Object.values(JobStatusSharedWithGrowi)) growiJobStatus: JobStatusSharedWithGrowi,
  ): Promise<{ status: JobStatus }> {
    const expirationDate = new Date(expirationDateStr);
    try {
      await this.pdfConvertService.registerOrUpdateJob(jobId, expirationDate, growiJobStatus);
      this.pdfConvertService.cleanUpJobList();
      return { status: this.pdfConvertService.getJobStatus(jobId) };
    }
    catch (err) {
      this.logger.error('Failed to register or update job', err);
      throw new InternalServerError(err);
    }
  }

}

export default PdfCtrl;
