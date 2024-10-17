import nodeCron from 'node-cron';

import { configManager } from '~/server/service/config-manager';
import loggerFactory from '~/utils/logger';

import { getOpenaiService, type IOpenaiService } from './openai';


const logger = loggerFactory('growi:service:thread-deletion-cron');

const DELETE_LIMIT = 100;

class ThreadDeletionCronService {

  cronJob: nodeCron.ScheduledTask;

  openaiService: IOpenaiService;

  startCron(): void {
    const isAiEnabled = configManager.getConfig('crowi', 'app:aiEnabled');
    if (!isAiEnabled) {
      return;
    }

    const openaiService = getOpenaiService();
    if (openaiService == null) {
      throw new Error('openaiService is not initialized');
    }

    // Executed at 0 minutes of every hour
    // const cronSchedule = '0 * * * *';

    // debug mode
    const cronSchedule = '* * * * *';

    this.cronJob?.stop();
    this.cronJob = this.generateCronJob(cronSchedule);
    this.cronJob.start();
  }

  private async executeJob(): Promise<void> {
    // Delete only 100 by rateLimit countermeasure on OpenAI side
    await this.openaiService.deleteExpiredThreads(DELETE_LIMIT);
  }

  private generateCronJob(cronSchedule: string) {
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

export default ThreadDeletionCronService;
