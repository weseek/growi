import { ErrorV3 } from '@growi/core/dist/models';
import type { NextFunction, Response } from 'express';

import type Crowi from '~/server/crowi';
import type { AccessTokenParserReq } from '~/server/middlewares/access-token-parser/interfaces';
import isSimpleRequest from '~/server/util/is-simple-request';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:middleware:certify-origin');
const certifyOrigin = (crowi: Crowi): ((req: AccessTokenParserReq, res: Response & { apiv3Err }, next: NextFunction) => void) => {

  const { configManager } = crowi;
  const appSiteUrl = configManager?.getConfig('crowi', 'app:siteUrl');
  return (req: AccessTokenParserReq, res: Response & { apiv3Err }, next: NextFunction): void => {

    const isSameOriginReq = req.headers.origin == null || req.headers.origin === appSiteUrl;
    req.isSameOriginReq = isSameOriginReq;
    const accessToken = req.query.access_token ?? req.body.access_token;

    if (!isSameOriginReq && req.headers.origin != null && isSimpleRequest(req)) {
      const message = 'Invalid request (origin check failed but simple request)';
      logger.error(message);
      return res.apiv3Err(new ErrorV3(message));
    }

    if (!isSameOriginReq && accessToken == null && !isSimpleRequest(req)) {
      const message = 'Invalid request (origin check failed and no access token)';
      logger.error(message);
      return res.apiv3Err(new ErrorV3(message));
    }

    next();
  };
};
export default certifyOrigin;
