import { scanAllTemplateStatus, getMarkdown } from '@growi/pluginkit/dist/v4/server';
import express from 'express';
import { param, query } from 'express-validator';

import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import { ApiV3Response } from '~/server/routes/apiv3/interfaces/apiv3-response';
import loggerFactory from '~/utils/logger';
import { resolveFromRoot } from '~/utils/project-dir-utils';

const logger = loggerFactory('growi:routes:apiv3:templates');

const router = express.Router();

const validator = {
  list: [
    query('includeInvalidTemplates').optional().isBoolean(),
  ],
  get: [
    param('templateId').isString(),
    param('locale').isString(),
  ],
};

module.exports = (crowi) => {
  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);

  router.get('/', loginRequiredStrictly, validator.list, apiV3FormValidator, async(req, res: ApiV3Response) => {
    const { includeInvalidTemplates } = req.query;

    const presetTemplatesRoot = resolveFromRoot('../../node_modules/@growi/preset-templates');
    const summaries = await scanAllTemplateStatus(presetTemplatesRoot, {
      returnsInvalidTemplates: includeInvalidTemplates,
    });

    return res.apiv3({ summaries });
  });

  router.get('/preset-templates/:templateId/:locale', loginRequiredStrictly, validator.get, apiV3FormValidator, async(req, res: ApiV3Response) => {
    const {
      templateId, locale,
    } = req.params;

    const presetTemplatesRoot = resolveFromRoot('../../node_modules/@growi/preset-templates');
    const markdown = await getMarkdown(presetTemplatesRoot, templateId, locale);

    return res.apiv3({ markdown });
  });

  router.get('/plugin-templates/:pluginId/:templateId/:locale', loginRequiredStrictly, validator.get, apiV3FormValidator, async(req, res: ApiV3Response) => {
    const {
      pluginId, templateId, locale,
    } = req.params;

    return res.apiv3({});
  });

  return router;
};
