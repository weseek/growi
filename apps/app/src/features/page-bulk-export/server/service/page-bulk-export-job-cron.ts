import { SupportedAction } from '~/interfaces/activity';
import { configManager } from '~/server/service/config-manager';
import CronService from '~/server/service/cron';
import loggerFactory from '~/utils/logger';

import { PageBulkExportJobStatus } from '../../interfaces/page-bulk-export';
import type { PageBulkExportJobDocument } from '../models/page-bulk-export-job';
import PageBulkExportJob from '../models/page-bulk-export-job';

import { pageBulkExportService } from './page-bulk-export';

const logger = loggerFactory('growi:service:cron');

class PageBulkExportJobCronService extends CronService {

  crowi: any;

  constructor(crowi) {
    super();
    this.crowi = crowi;
  }

  override async executeJob(): Promise<void> {
    await this.deleteExpiredExportJobs();
    await this.deleteDownloadExpiredJobs();
    await this.deleteFailedExportJobs();
  }

  async deleteExpiredExportJobs() {
    const exportJobExpirationSeconds = configManager.getConfig('crowi', 'app:bulkExportJobExpirationSeconds');
    const expiredExportJobs = await PageBulkExportJob.find({
      status: PageBulkExportJobStatus.initializing,
      createdAt: { $lt: new Date(Date.now() - exportJobExpirationSeconds * 1000) },
    });
    for (const expiredExportJob of expiredExportJobs) {
      pageBulkExportService?.pageBulkExportJobStreamManager?.destroyJobStream(expiredExportJob._id);
      // eslint-disable-next-line no-await-in-loop
      await this.cleanUpAndDeleteBulkExportJob(expiredExportJob);
    }
  }

  async deleteDownloadExpiredJobs() {
    const downloadExpirationSeconds = configManager.getConfig('crowi', 'app:bulkExportDownloadExpirationSeconds');
    const downloadExpiredExportJobs = await PageBulkExportJob.find({
      status: PageBulkExportJobStatus.completed,
      completedAt: { $lt: new Date(Date.now() - downloadExpirationSeconds * 1000) },
    });
    for (const downloadExpiredExportJob of downloadExpiredExportJobs) {
      try {
        this.crowi.attachmentService?.removeAttachment(downloadExpiredExportJob.attachment);
      }
      catch (err) {
        logger.error(err);
      }
      // eslint-disable-next-line no-await-in-loop
      await this.cleanUpAndDeleteBulkExportJob(downloadExpiredExportJob);
    }
  }

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
