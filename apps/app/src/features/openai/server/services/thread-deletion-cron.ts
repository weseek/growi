import nodeCron from 'node-cron';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:service:thread-deletion-cron');

class ThreadDeletionCronService {

  cronJob: nodeCron.ScheduledTask;

  startCron(): void {
    // Executed at 0 minutes of every hour
    // const cronSchedule = '0 * * * *';

    // debug mode
    const cronSchedule = '* * * * *';

    this.cronJob?.stop();
    this.cronJob = this.generateCronJob(cronSchedule);
    this.cronJob.start();
  }

  stopCron(): void {
    this.cronJob.stop();
  }

  async executeJob(): Promise<void> {
    // implement
  }

  private generateCronJob(cronSchedule: string) {
    return nodeCron.schedule(cronSchedule, async() => {
      try {
        this.executeJob();
      }
      catch (e) {
        logger.error(e);
      }
    });
  }

}

export default ThreadDeletionCronService;
