import path from 'path';

import { GrowiPluginType } from '@growi/core';
import { TemplateSummary } from '@growi/pluginkit/dist/v4';
import { scanAllTemplates, getMarkdown } from '@growi/pluginkit/dist/v4/server';
import express from 'express';
import { param, query } from 'express-validator';

import { PLUGIN_STORING_PATH } from '~/features/growi-plugin/server/consts';
import { GrowiPlugin } from '~/features/growi-plugin/server/models';
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


// cache object
let presetTemplateSummaries: TemplateSummary[];


module.exports = (crowi) => {
  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);

  router.get('/', loginRequiredStrictly, validator.list, apiV3FormValidator, async(req, res: ApiV3Response) => {
    const { includeInvalidTemplates } = req.query;

    // scan preset templates
    if (presetTemplateSummaries == null) {
      const presetTemplatesRoot = resolveFromRoot('../../node_modules/@growi/preset-templates');

      try {
        presetTemplateSummaries = await scanAllTemplates(presetTemplatesRoot, {
          returnsInvalidTemplates: includeInvalidTemplates,
        });
      }
      catch (err) {
        logger.error(err);
        presetTemplateSummaries = [];
      }
    }

    // load plugin templates
    let pluginsTemplateSummaries: TemplateSummary[] = [];
    try {
      const plugins = await GrowiPlugin.findEnabledPluginsByType(GrowiPluginType.Template);
      pluginsTemplateSummaries = plugins.flatMap(p => p.meta.templateSummaries);
    }
    catch (err) {
      logger.error(err);
    }

    return res.apiv3({
      summaries: [
        ...presetTemplateSummaries,
        ...pluginsTemplateSummaries,
      ],
    });
  });

  router.get('/preset-templates/:templateId/:locale', loginRequiredStrictly, validator.get, apiV3FormValidator, async(req, res: ApiV3Response) => {
    const {
      templateId, locale,
    } = req.params;

    const presetTemplatesRoot = resolveFromRoot('../../node_modules/@growi/preset-templates');

    try {
      const markdown = await getMarkdown(presetTemplatesRoot, templateId, locale);
      return res.apiv3({ markdown });
    }
    catch (err) {
      res.apiv3Err(err);
    }
  });

  router.get('/plugin-templates/:organizationId/:reposId/:templateId/:locale', loginRequiredStrictly, validator.get, apiV3FormValidator, async(
      req, res: ApiV3Response,
  ) => {
    const {
      organizationId, reposId, templateId, locale,
    } = req.params;

    const pluginRoot = path.join(PLUGIN_STORING_PATH, `${organizationId}/${reposId}`);

    try {
      const markdown = await getMarkdown(pluginRoot, templateId, locale);
      return res.apiv3({ markdown });
    }
    catch (err) {
      res.apiv3Err(err);
    }
  });

  return router;
};
