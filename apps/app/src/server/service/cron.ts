import type { ScheduledTask } from 'node-cron';
import nodeCron from 'node-cron';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:service:cron');

/**
 * Base class for services that manage a cronjob
 */
abstract class CronService {

  // The current cronjob to manage
  cronJob: ScheduledTask;

  /**
   * Create and start a new cronjob
   * @param cronSchedule e.g. '0 1 * * *'
   */
  startCron(cronSchedule: string): void {
    this.cronJob?.stop();
    this.cronJob = this.generateCronJob(cronSchedule);
    this.cronJob.start();
  }

  /**
   * Stop the current cronjob
   */
  stopCron(): void {
    this.cronJob.stop();
  }

  /**
   * Execute the job. Define the job process in the subclass.
   */
  abstract executeJob(): Promise<void>;

  /**
   * Create a new cronjob
   * @param cronSchedule e.g. '0 1 * * *'
   */
  protected generateCronJob(cronSchedule: string): ScheduledTask {
    return nodeCron.schedule(cronSchedule, async() => {
      try {
        await this.executeJob();
      }
      catch (e) {
        logger.error(e);
      }
    });
  }

}

export default CronService;
