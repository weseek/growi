import { SupportedAction } from '~/interfaces/activity';
import { configManager } from '~/server/service/config-manager';
import CronService from '~/server/service/cron';
import loggerFactory from '~/utils/logger';

import { PageBulkExportJobInProgressStatus, PageBulkExportJobStatus } from '../../interfaces/page-bulk-export';
import type { PageBulkExportJobDocument } from '../models/page-bulk-export-job';
import PageBulkExportJob from '../models/page-bulk-export-job';

import { pageBulkExportService } from './page-bulk-export';

const logger = loggerFactory('growi:service:cron');

/**
 * Manages cronjob which deletes unnecessary bulk export jobs
 */
class PageBulkExportJobCronService extends CronService {

  crowi: any;

  constructor(crowi) {
    super();
    this.crowi = crowi;
  }

  override async executeJob(): Promise<void> {
    await this.deleteExpiredExportJobs();
    await this.deleteDownloadExpiredExportJobs();
    await this.deleteFailedExportJobs();
  }

  /**
   * Delete bulk export jobs which are on-going and has passed the limit time for execution
   */
  async deleteExpiredExportJobs() {
    const exportJobExpirationSeconds = configManager.getConfig('crowi', 'app:bulkExportJobExpirationSeconds');
    const expiredExportJobs = await PageBulkExportJob.find({
      $or: Object.values(PageBulkExportJobInProgressStatus).map(status => ({ status })),
      createdAt: { $lt: new Date(Date.now() - exportJobExpirationSeconds * 1000) },
    });
    for (const expiredExportJob of expiredExportJobs) {
      pageBulkExportService?.pageBulkExportJobStreamManager?.destroyJobStream(expiredExportJob._id);
      // eslint-disable-next-line no-await-in-loop
      await this.cleanUpAndDeleteBulkExportJob(expiredExportJob);
    }
  }

  /**
   * Delete bulk export jobs which have completed but the due time for downloading has passed
   */
  async deleteDownloadExpiredExportJobs() {
    const downloadExpirationSeconds = configManager.getConfig('crowi', 'app:bulkExportDownloadExpirationSeconds');
    const downloadExpiredExportJobs = await PageBulkExportJob.find({
      status: PageBulkExportJobStatus.completed,
      completedAt: { $lt: new Date(Date.now() - downloadExpirationSeconds * 1000) },
    });
    for (const downloadExpiredExportJob of downloadExpiredExportJobs) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const hasSameAttachmentAndDownloadNotExpired = await PageBulkExportJob.findOne({
          attachment: downloadExpiredExportJob.attachment,
          _id: { $ne: downloadExpiredExportJob._id },
          completedAt: { $gte: new Date(Date.now() - downloadExpirationSeconds * 1000) },
        });
        if (hasSameAttachmentAndDownloadNotExpired == null) {
          // delete attachment if no other export job (which download has not expired) has re-used it
          this.crowi.attachmentService?.removeAttachment(downloadExpiredExportJob.attachment);
        }
      }
      catch (err) {
        logger.error(err);
      }
      // eslint-disable-next-line no-await-in-loop
      await this.cleanUpAndDeleteBulkExportJob(downloadExpiredExportJob);
    }
  }

  /**
   * Delete bulk export jobs which have failed
   */
  async deleteFailedExportJobs() {
    const failedExportJobs = await PageBulkExportJob.find({ status: PageBulkExportJobStatus.failed });
    for (const failedExportJob of failedExportJobs) {
      // eslint-disable-next-line no-await-in-loop
      await this.cleanUpAndDeleteBulkExportJob(failedExportJob);
    }
  }

  async cleanUpAndDeleteBulkExportJob(pageBulkExportJob: PageBulkExportJobDocument) {
    await pageBulkExportService?.cleanUpExportJobResources(pageBulkExportJob);
    await pageBulkExportJob.delete();
  }

}

// eslint-disable-next-line import/no-mutable-exports
export let pageBulkExportJobCronService: PageBulkExportJobCronService | undefined; // singleton instance
export default function instanciate(crowi): void {
  pageBulkExportJobCronService = new PageBulkExportJobCronService(crowi);
}
