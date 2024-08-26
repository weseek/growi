import type { HydratedDocument } from 'mongoose';

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

  override getCronSchedule(): string {
    return configManager.getConfig('crowi', 'app:pageBulkExportJobCronSchedule');
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

    if (pageBulkExportService != null) {
      await this.cleanUpAndDeleteBulkExportJobs(expiredExportJobs, pageBulkExportService?.cleanUpExportJobResources);
    }
  }

  /**
   * Delete bulk export jobs which have completed but the due time for downloading has passed
   */
  async deleteDownloadExpiredExportJobs() {
    const downloadExpirationSeconds = configManager.getConfig('crowi', 'app:bulkExportDownloadExpirationSeconds');
    const thresholdDate = new Date(Date.now() - downloadExpirationSeconds * 1000);
    const downloadExpiredExportJobs = await PageBulkExportJob.find({
      status: PageBulkExportJobStatus.completed,
      completedAt: { $lt: thresholdDate },
    });

    const cleanup = async(job: PageBulkExportJobDocument) => {
      await pageBulkExportService?.cleanUpExportJobResources(job);

      const hasSameAttachmentAndDownloadNotExpired = await PageBulkExportJob.findOne({
        attachment: job.attachment,
        _id: { $ne: job._id },
        completedAt: { $gte: thresholdDate },
      });
      if (hasSameAttachmentAndDownloadNotExpired == null) {
        // delete attachment if no other export job (which download has not expired) has re-used it
        await this.crowi.attachmentService?.removeAttachment(job.attachment);
      }
    };

    await this.cleanUpAndDeleteBulkExportJobs(downloadExpiredExportJobs, cleanup);
  }

  /**
   * Delete bulk export jobs which have failed
   */
  async deleteFailedExportJobs() {
    const failedExportJobs = await PageBulkExportJob.find({ status: PageBulkExportJobStatus.failed });

    if (pageBulkExportService != null) {
      await this.cleanUpAndDeleteBulkExportJobs(failedExportJobs, pageBulkExportService.cleanUpExportJobResources);
    }
  }

  async cleanUpAndDeleteBulkExportJobs(
      pageBulkExportJobs: HydratedDocument<PageBulkExportJobDocument>[],
      cleanup: (job: PageBulkExportJobDocument) => Promise<void>,
  ): Promise<void> {
    const results = await Promise.allSettled(pageBulkExportJobs.map(job => cleanup(job)));
    results.forEach((result) => {
      if (result.status === 'rejected') logger.error(result.reason);
    });

    // Only batch delete jobs which have been successfully cleaned up
    // Cleanup failed jobs will be retried in the next cron execution
    const cleanedUpJobs = pageBulkExportJobs.filter((_, index) => results[index].status === 'fulfilled');
    if (cleanedUpJobs.length > 0) {
      const cleanedUpJobIds = cleanedUpJobs.map(job => job._id);
      await PageBulkExportJob.deleteMany({ _id: { $in: cleanedUpJobIds } });
    }
  }

}

// eslint-disable-next-line import/no-mutable-exports
export let pageBulkExportJobCronService: PageBulkExportJobCronService | undefined; // singleton instance
export default function instanciate(crowi): void {
  pageBulkExportJobCronService = new PageBulkExportJobCronService(crowi);
}
