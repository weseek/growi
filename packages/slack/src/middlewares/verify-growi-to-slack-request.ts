import { Response, NextFunction } from 'express';

import loggerFactory from '../utils/logger';
import { RequestFromGrowi } from '../interfaces/request-between-growi-and-proxy';

const logger = loggerFactory('@growi/slack:middlewares:verify-slack-request');

/**
 * Verify if the request came from slack
 * See: https://api.slack.com/authentication/verifying-requests-from-slack
 */
export const verifyGrowiToSlackRequest = (req: RequestFromGrowi, res: Response, next: NextFunction): Record<string, any> | void => {
  const str = req.headers['x-growi-gtop-tokens'];

  if (str == null) {
    const message = 'The value of header \'x-growi-gtop-tokens\' must not be empty.';
    logger.warn(message, { body: req.body });
    return res.status(400).send({ message });
  }

  const tokens = str.split(',').map(value => value.trim());
  if (tokens.length === 0) {
    const message = 'The value of header \'x-growi-gtop-tokens\' must include at least one or more tokens.';
    logger.warn(message, { body: req.body });
    return res.status(400).send({ message });
  }

  req.tokenGtoPs = tokens;
  return next();
};
