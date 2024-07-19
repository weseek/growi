import type { ScheduledTask } from 'node-cron';
import nodeCron from 'node-cron';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:service:cron');

abstract class CronService {

  cronJob: ScheduledTask;

  startCron(cronSchedule: string, preExecute?: () => void): void {
    this.cronJob?.stop();
    this.cronJob = this.generateCronJob(cronSchedule, preExecute);
    this.cronJob.start();
  }

  stopCron(): void {
    this.cronJob.stop();
  }

  abstract executeJob(): Promise<void>;

  protected generateCronJob(cronSchedule: string, preExecute?: () => void): ScheduledTask {
    return nodeCron.schedule(cronSchedule, async() => {
      await preExecute?.();
      try {
        this.executeJob();
      }
      catch (e) {
        logger.error(e);
      }
    });
  }

}

export default CronService;
