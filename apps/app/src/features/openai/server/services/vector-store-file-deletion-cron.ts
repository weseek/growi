import nodeCron from 'node-cron';

import { configManager } from '~/server/service/config-manager';
import loggerFactory from '~/utils/logger';
import { getRandomIntInRange } from '~/utils/rand';

import { getOpenaiService, type IOpenaiService } from './openai';

const logger = loggerFactory('growi:service:vector-store-file-deletion-cron');

class VectorStoreFileDeletionCronService {

  cronJob: nodeCron.ScheduledTask;

  openaiService: IOpenaiService;

  vectorStoreFileDeletionCronExpression: string;

  vectorStoreFileDeletionBarchSize: number;

  vectorStoreFileDeletionApiCallInterval: number;

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
    this.vectorStoreFileDeletionCronExpression = configManager.getConfig('crowi', 'openai:vectorStoreFileDeletionCronExpression');
    this.vectorStoreFileDeletionBarchSize = configManager.getConfig('crowi', 'openai:vectorStoreFileDeletionBarchSize');
    this.vectorStoreFileDeletionApiCallInterval = configManager.getConfig('crowi', 'openai:vectorStoreFileDeletionApiCallInterval');

    this.cronJob?.stop();
    this.cronJob = this.generateCronJob();
    this.cronJob.start();
  }

  private async executeJob(): Promise<void> {
    await this.openaiService.deleteObsolatedVectorStoreRelations();
    await this.openaiService.deleteObsoleteVectorStoreFile(this.vectorStoreFileDeletionBarchSize, this.vectorStoreFileDeletionApiCallInterval);
  }

  private generateCronJob() {
    return nodeCron.schedule(this.vectorStoreFileDeletionCronExpression, async() => {
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

export default VectorStoreFileDeletionCronService;
