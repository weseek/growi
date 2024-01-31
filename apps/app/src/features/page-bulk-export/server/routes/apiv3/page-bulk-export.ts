import { ErrorV3 } from '@growi/core/dist/models';
import { Router, Request } from 'express';
import { body, validationResult } from 'express-validator';

import Crowi from '~/server/crowi';
import { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import loggerFactory from '~/utils/logger';

import { pageBulkExportService } from '../../service/page-bulk-export';

const logger = loggerFactory('growi:routes:apiv3:page-bulk-export');

const router = Router();

interface AuthorizedRequest extends Request {
  user?: any
}

module.exports = (crowi: Crowi): Router => {
  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);

  const validators = {
    pageBulkExport: [
      body('path').exists({ checkFalsy: true }).isString(),
      body('format').exists({ checkFalsy: true }).isString(),
    ],
  };

  router.post('/', loginRequiredStrictly, validators.pageBulkExport, async(req: AuthorizedRequest, res: ApiV3Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { path, format } = req.body;

    try {
      // temporal await, remove it after multi-part upload is implemented in https://redmine.weseek.co.jp/issues/78038
      await pageBulkExportService?.bulkExportWithBasePagePath(path);

      return res.apiv3({}, 204);
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(new ErrorV3('Error occurred in exporting page tree'));
    }
  });

  return router;

};
