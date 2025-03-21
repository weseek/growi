import nodeCron from 'node-cron';

import { AccessToken } from '~/server/models/access-token';
import { configManager } from '~/server/service/config-manager';
import loggerFactory from '~/utils/logger';
import { getRandomIntInRange } from '~/utils/rand';

const logger = loggerFactory('growi:service:access-token-deletion-cron');

export class AccessTokenDeletionCronService {

  cronJob: nodeCron.ScheduledTask;

  // デフォルトで毎日深夜0時に実行 (UTC で 15:00)
  accessTokenDeletionCronExpression = '0 15 * * *';

  // デフォルトで最大30分のランダム遅延
  accessTokenDeletionCronMaxMinutesUntilRequest = 30;

  sleep = (msec: number): Promise<void> => new Promise(resolve => setTimeout(resolve, msec));

  startCron(): void {
    this.accessTokenDeletionCronExpression = configManager.getConfig('accessToken:deletionCronExpression');
    this.accessTokenDeletionCronMaxMinutesUntilRequest = configManager.getConfig('accessToken:deletionCronMaxMinutesUntilRequest');

    this.cronJob?.stop();
    this.cronJob = this.generateCronJob();
    this.cronJob.start();

    logger.info('Access token deletion cron started');
  }

  private async executeJob(): Promise<void> {
    try {
      await AccessToken.deleteExpiredToken();
      logger.info('Expired access tokens have been deleted');
    }
    catch (e) {
      logger.error('Failed to delete expired access tokens:', e);
    }
  }

  private generateCronJob() {
    return nodeCron.schedule(this.accessTokenDeletionCronExpression, async() => {
      try {
        // Random fractional sleep to distribute request timing among GROWI apps
        const randomMilliseconds = getRandomIntInRange(0, this.accessTokenDeletionCronMaxMinutesUntilRequest) * 60 * 1000;
        await this.sleep(randomMilliseconds);

        await this.executeJob();
      }
      catch (e) {
        logger.error('Error occurred during access token deletion cron job:', e);
      }
    });
  }

}

export const startCron = (): void => {
  logger.info('Starting cron service for access token deletion');
  const accessTokenDeletionCronService = new AccessTokenDeletionCronService();
  accessTokenDeletionCronService.startCron();
};
