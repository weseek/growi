import { ErrorV3 } from '@growi/core/dist/models';

import { SupportedAction } from '~/interfaces/activity';
import { configManager } from '~/server/service/config-manager';
import loggerFactory from '~/utils/logger';

import { generateAddActivityMiddleware } from '../../middlewares/add-activity';
import { apiV3FormValidator } from '../../middlewares/apiv3-form-validator';


const logger = loggerFactory('growi:routes:apiv3:markdown-setting');

const express = require('express');

const router = express.Router();

const { body } = require('express-validator');


module.exports = (crowi) => {
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const addActivity = generateAddActivityMiddleware(crowi);
  const activityEvent = crowi.event('activity');


  router.get('/', loginRequiredStrictly, adminRequired, async(req, res) => {
    const contentDispositionSettings = {
      // change to mime types
      isEnabledLinebreaks: await crowi.configManager.getConfig('markdown:isEnabledLinebreaks'),
      isEnabledLinebreaksInComments: await crowi.configManager.getConfig('markdown:isEnabledLinebreaksInComments'),
      adminPreferredIndentSize: await crowi.configManager.getConfig('markdown:adminPreferredIndentSize'),
      isIndentSizeForced: await crowi.configManager.getConfig('markdown:isIndentSizeForced'),
      isEnabledXss: await crowi.configManager.getConfig('markdown:rehypeSanitize:isEnabledPrevention'),
      xssOption: await crowi.configManager.getConfig('markdown:rehypeSanitize:option'),
      tagWhitelist: await crowi.configManager.getConfig('markdown:rehypeSanitize:tagNames'),
      attrWhitelist: await crowi.configManager.getConfig('markdown:rehypeSanitize:attributes'),
    };

    return res.apiv3({ contentDispositionSettings });
  });

  // add functions for adding and removing allowed mime types
  // add function for setting predetermined allowed mime types in lists
  // Recommended, Strict, Moderately strict, Lax, etc

  return router;
};
