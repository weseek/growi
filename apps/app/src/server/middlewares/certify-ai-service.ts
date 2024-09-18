import type { NextFunction, Request, Response } from 'express';

import { aiServiceTypes } from '~/interfaces/ai';
import { configManager } from '~/server/service/config-manager';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:middlewares:certify-ai-service');

export const certifyAiService = (req: Request, res: Response & { apiv3Err }, next: NextFunction): void => {
  const aiEnabled = configManager.getConfig('crowi', 'app:aiEnabled');
  const aiServiceType = configManager.getConfig('crowi', 'app:aiServiceType');

  if (!aiEnabled) {
    const message = 'AI_ENABLED is not true';
    logger.error(message);
    return res.apiv3Err(message, 400);
  }

  if (aiServiceType == null || !aiServiceTypes.includes(aiServiceType)) {
    const message = 'AI_SERVICE_TYPE is missing or contains an invalid value';
    logger.error(message);
    return res.apiv3Err(message, 400);
  }

  next();
};
