import { createHmac, timingSafeEqual } from 'crypto';
import { stringify } from 'qs';
import { Response, NextFunction } from 'express';

import createError from 'http-errors';
import loggerFactory from '../utils/logger';
import { RequestFromSlack } from '../interfaces/request-from-slack';

const logger = loggerFactory('@growi/slack:middlewares:verify-slack-request');

/**
 * Verify if the request came from slack
 * See: https://api.slack.com/authentication/verifying-requests-from-slack
 */
export const verifySlackRequest = (req: RequestFromSlack, res: Response, next: NextFunction): Record<string, any> | void => {
  const signingSecret = req.slackSigningSecret;

  if (signingSecret == null) {
    const message = 'No signing secret.';
    logger.warn(message, { body: req.body });
    return next(createError(400, message));
  }

  // take out slackSignature and timestamp from header
  const slackSignature = req.headers['x-slack-signature'];
  const timestamp = req.headers['x-slack-request-timestamp'];

  if (slackSignature == null || timestamp == null) {
    const message = 'Forbidden. Enter from Slack workspace';
    logger.warn(message, { body: req.body });
    return next(createError(403, message));
  }

  // protect against replay attacks
  const time = Math.floor(new Date().getTime() / 1000);
  if (Math.abs(time - timestamp) > 300) {
    const message = 'Verification failed.';
    logger.warn(message, { body: req.body });
    return next(createError(403, message));
  }

  // generate growi signature
  const sigBaseString = `v0:${timestamp}:${stringify(req.body, { format: 'RFC1738' })}`;
  const hasher = createHmac('sha256', signingSecret);
  hasher.update(sigBaseString, 'utf8');
  const hashedSigningSecret = hasher.digest('hex');
  const growiSignature = `v0=${hashedSigningSecret}`;

  // compare growiSignature and slackSignature
  if (timingSafeEqual(Buffer.from(growiSignature, 'utf8'), Buffer.from(slackSignature, 'utf8'))) {
    return next();
  }

  const message = 'Verification failed.';
  logger.warn(message, { body: req.body });
  return next(createError(403, message));
};
