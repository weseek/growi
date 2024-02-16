import nodeCron, { type ScheduledTask } from 'node-cron';

import type Crowi from '~/server/crowi';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:service:page-cleanup-cron-service');

const CRON_SCHEDULE = '1 * * * * *';

class CleanupPageCronService {

  crowi: Crowi;

  cronJob: ScheduledTask;

  constructor(crowi: Crowi) {
    this.crowi = crowi;
  }

  startCron(): void {
    this.cronJob = this.generateCronJob(CRON_SCHEDULE);
    this.cronJob.start();
  }

  private async executeJob(): Promise<void> {
    // TODO: implement
  }

  private generateCronJob(cronSchedule: string) {
    return nodeCron.schedule(cronSchedule, async() => {
      try {
        this.executeJob();
      }
      catch (err) {
        logger.error(err);
      }
    });
  }

}

export default CleanupPageCronService;
