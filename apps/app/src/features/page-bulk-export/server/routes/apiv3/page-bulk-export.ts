import { ErrorV3 } from '@growi/core/dist/models';
import type { Request } from 'express';
import { Router } from 'express';
import { body, validationResult } from 'express-validator';

import type Crowi from '~/server/crowi';
import type { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
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
    const activityParameters = {
      ip: req.ip,
      endpoint: req.originalUrl,
    };

    try {
      await pageBulkExportService?.createAndStartPageBulkExportJob(path, req.user, activityParameters);
      return res.apiv3({}, 204);
    }
    catch (err) {
      logger.error(err);
      return res.apiv3Err(new ErrorV3('Failed to start bulk export'));
    }
  });

  return router;

};
