import { BodyParams, QueryParams, Logger } from '@tsed/common';
import { Controller, Inject } from '@tsed/di';
import { InternalServerError } from '@tsed/exceptions';
import { Get, Patch, Post, Returns } from '@tsed/schema';

import PdfConvertService, { JobStatusSharedWithGrowi } from '../service/pdf-convert';

@Controller('/pdf')
class PdfCtrl {

  @Inject()
    logger: Logger;

  constructor(private readonly pdfConvertService: PdfConvertService) {}

  @Post('/sync-job')
  @Returns(202)
  @Returns(500)
  async syncJobStatus(@BodyParams('jobId') jobId: string, @BodyParams('expirationDate') expirationDateStr: string, @BodyParams('status') growiJobStatus: JobStatusSharedWithGrowi): Promise<void> {
    const expirationDate = new Date(expirationDateStr);
    try {
      this.pdfConvertService.registerOrUpdateJob(jobId, expirationDate, growiJobStatus);
    }
    catch (err) {
      this.logger.error('Failed to register or update job', err);
      throw new InternalServerError(err);
    }
  }

  @Get('/job-status')
  @Returns(200)
  @Returns(500)
  async jobStatus(@QueryParams('jobId') jobId: string): Promise<{jobStatus: string}> {
    try {
      return { jobStatus: this.pdfConvertService.getJobStatus(jobId) };
    }
    catch (err) {
      this.logger.error('Failed to check if pdf export is done', err);
      throw new InternalServerError(err);
    }
  }


}

export default PdfCtrl;
