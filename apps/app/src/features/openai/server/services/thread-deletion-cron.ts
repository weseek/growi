import nodeCron from 'node-cron';

import { configManager } from '~/server/service/config-manager';
import loggerFactory from '~/utils/logger';
import { getRandomIntInRange } from '~/utils/rand';

import { getOpenaiService, type IOpenaiService } from './openai';

const logger = loggerFactory('growi:service:thread-deletion-cron');

class ThreadDeletionCronService {

  cronJob: nodeCron.ScheduledTask;

  openaiService: IOpenaiService;

  threadDeletionCronExpression: string;

  threadDeletionBarchSize: number;

  threadDeletionApiCallInterval: number;

  sleep = (msec: number): Promise<void> => new Promise(resolve => setTimeout(resolve, msec));

  startCron(): void {
    const isAiEnabled = configManager.getConfig('crowi', 'app:aiEnabled');
    if (!isAiEnabled) {
      return;
    }

    const openaiService = getOpenaiService();
    if (openaiService == null) {
      throw new Error('OpenAI service is not initialized');
    }

    this.openaiService = openaiService;
    this.threadDeletionCronExpression = configManager.getConfig('crowi', 'openai:threadDeletionCronExpression');
    this.threadDeletionBarchSize = configManager.getConfig('crowi', 'openai:threadDeletionBarchSize');
    this.threadDeletionApiCallInterval = configManager.getConfig('crowi', 'openai:threadDeletionApiCallInterval');

    this.cronJob?.stop();
    this.cronJob = this.generateCronJob();
    this.cronJob.start();
  }

  private async executeJob(): Promise<void> {
    // Must be careful of OpenAI's rate limit
    await this.openaiService.deleteExpiredThreads(this.threadDeletionBarchSize, this.threadDeletionApiCallInterval);
  }

  private generateCronJob() {
    return nodeCron.schedule(this.threadDeletionCronExpression, async() => {
      try {
        // Sleep for a random number of minutes between 0 and 60 to distribute request load
        const randomMilliseconds = getRandomIntInRange(0, 60) * 60 * 1000;
        this.sleep(randomMilliseconds);

        await this.executeJob();
      }
      catch (e) {
        logger.error(e);
      }
    });
  }

}

export default ThreadDeletionCronService;
