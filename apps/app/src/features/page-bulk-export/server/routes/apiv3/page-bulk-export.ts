import { ErrorV3 } from '@growi/core/dist/models';
import { Router, Request } from 'express';
import { param, validationResult } from 'express-validator';

import Crowi from '~/server/crowi';
import { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:routes:apiv3:external-user-group');

const router = Router();

interface AuthorizedRequest extends Request {
  user?: any
}

module.exports = (crowi: Crowi): Router => {
  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);

  const validators = {
    pageBulkExport: [
      param('path').exists({ checkFalsy: true }).isString(),
      param('format').exists({ checkFalsy: true }).isString(),
    ],
  };

  router.post('/', loginRequiredStrictly, validators.pageBulkExport, async(req: AuthorizedRequest, res: ApiV3Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { path, format } = req.params;

    try {
      await crowi.exportService?.bulkExportWithBasePagePath(path);

      return res.apiv3(204);
    }
    catch (err) {
      const msg = 'Error occurred in fetching external user group list';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg));
    }
  });

  return router;

};
