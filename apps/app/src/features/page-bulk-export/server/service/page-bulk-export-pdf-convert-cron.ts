import type { HydratedDocument } from 'mongoose';
import EventEmitter from 'node:events';

import { configManager } from '~/server/service/config-manager';
import CronService from '~/server/service/cron';
import loggerFactory from '~/utils/logger';

import { PageBulkExportFormat, PageBulkExportJobStatus } from '../../interfaces/page-bulk-export';
import type { PageBulkExportJobDocument } from '../models/page-bulk-export-job';
import PageBulkExportJob from '../models/page-bulk-export-job';

import { BulkExportJobExpiredError } from './page-bulk-export/errors';
import { PdfCtrlSyncJobStatus202Status, PdfCtrlSyncJobStatusBodyStatus, pdfCtrlSyncJobStatus } from '^/../pdf-converter/dist/client-library';
import PageBulkExportPageSnapshot from '../models/page-bulk-export-page-snapshot';

const logger = loggerFactory('growi:service:page-bulk-export-pdf-convert-cron');

const eventEmitter = new EventEmitter();

/**
 * Start pdf export by requesting pdf-converter and keep updating/checking the status until the export is done
 * ref) https://dev.growi.org/66ee8495830566b31e02c953#growi
 * @param pageBulkExportJob page bulk export job in execution
 */
class PageBulkExportPdfConvertCronService extends CronService {

  override getCronSchedule(): string {
    return configManager.getConfig('crowi', 'app:pageBulkExportPdfConvertCronSchedule');
  }

  override async executeJob(): Promise<void> {
    const pdfExportingJobs = await PageBulkExportJob.find({
      format: PageBulkExportFormat.pdf,
      status: PageBulkExportJobStatus.exporting,
    });

    const results = await Promise.allSettled(
      pdfExportingJobs.map(async (pageBulkExportJob) => {
        await this.requestPdfConverter(pageBulkExportJob);
      })
    )

    results.forEach((result) => {
      if (result.status === 'rejected') logger.error(result.reason);
    });
  }

  async requestPdfConverter(pageBulkExportJob: HydratedDocument<PageBulkExportJobDocument>): Promise<void> {
    const jobCreatedAt = pageBulkExportJob.createdAt;
    if (jobCreatedAt == null) {
      eventEmitter.emit('pdfExportFailed');
      throw new Error('createdAt is not set');
    }

    const exportJobExpirationSeconds = configManager.getConfig('crowi', 'app:bulkExportJobExpirationSeconds');
    const bulkExportJobExpirationDate = new Date(jobCreatedAt.getTime() + exportJobExpirationSeconds * 1000);
    let pdfConvertStatus: PdfCtrlSyncJobStatusBodyStatus = PdfCtrlSyncJobStatusBodyStatus.HTML_EXPORT_IN_PROGRESS;

    const lastExportPagePath = (await PageBulkExportPageSnapshot.findOne({ pageBulkExportJob }).sort({ path: -1 }))?.path;
    if (lastExportPagePath == null) {
      eventEmitter.emit('pdfExportFailed id:' + pageBulkExportJob._id.toString());
      throw new Error('lastExportPagePath is missing');
    }

    if (new Date() > bulkExportJobExpirationDate) {
      eventEmitter.emit('bulkExportJobExpired id:' + pageBulkExportJob._id.toString());
    }
    try {
      if (pageBulkExportJob.lastExportedPagePath === lastExportPagePath) {
        pdfConvertStatus = PdfCtrlSyncJobStatusBodyStatus.HTML_EXPORT_DONE;
      }

      if (pageBulkExportJob.status === PageBulkExportJobStatus.failed) {
        pdfConvertStatus = PdfCtrlSyncJobStatusBodyStatus.FAILED;
      }

      const res = await pdfCtrlSyncJobStatus({
        jobId: pageBulkExportJob._id.toString(), expirationDate: bulkExportJobExpirationDate.toISOString(), status: pdfConvertStatus,
      }, { baseURL: configManager.getConfig('crowi', 'app:pageBulkExportPdfConverterUrl') });

      if (res.data.status === PdfCtrlSyncJobStatus202Status.PDF_EXPORT_DONE) {
        eventEmitter.emit('pdfExportDone id:' + pageBulkExportJob._id.toString());
      }
      else if (res.data.status === PdfCtrlSyncJobStatus202Status.FAILED) {
        eventEmitter.emit('pdfExportFailed id:' + pageBulkExportJob._id.toString());
      }
    }
    catch (err) {
      // Only set as failure when host is ready but failed.
      // If host is not ready, the request should be retried on the next cron execution.
      if (!['ENOTFOUND', 'ECONNREFUSED'].includes(err.code)) {
        eventEmitter.emit('pdfExportFailed id:' + pageBulkExportJob._id.toString());
        throw err;
      }
    }
  };
}

export const pageBulkExportPdfConvertCronService = Object.freeze(new PageBulkExportPdfConvertCronService());

export function waitPdfExportToFs(pageBulkExportJob: PageBulkExportJobDocument): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    eventEmitter.on('pdfExportDone id:' + pageBulkExportJob._id.toString(), () => {
      resolve();
      return;
    });

    eventEmitter.on('bulkExportJobExpired id:' + pageBulkExportJob._id.toString(), () => {
      reject(new BulkExportJobExpiredError());
      return;
    });
    eventEmitter.on('pdfExportFailed id:' + pageBulkExportJob._id.toString(), () => {
      reject(new Error('PDF export failed'));
      return;
    });
  });
}
