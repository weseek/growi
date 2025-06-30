import { ErrorV3 } from '@growi/core/dist/models';

import { SupportedAction } from '~/interfaces/activity';
import { configManager } from '~/server/service/config-manager';
import loggerFactory from '~/utils/logger';

import { generateAddActivityMiddleware } from '../../middlewares/add-activity';
import { apiV3FormValidator } from '../../middlewares/apiv3-form-validator';

import { CONFIGURABLE_MIME_TYPES_FOR_DISPOSITION } from './configurable-mime-types';

// set config definitions
// change to content disposition settings
const logger = loggerFactory('growi:routes:apiv3:markdown-setting');
const express = require('express');

const router = express.Router();
const { body } = require('express-validator');


module.exports = (crowi) => {
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const addActivity = generateAddActivityMiddleware(crowi);
  const activityEvent = crowi.event('activity');


  router.get('/content-disposition', loginRequiredStrictly, adminRequired, async(req, res) => {
    const promises = CONFIGURABLE_MIME_TYPES_FOR_DISPOSITION.map(async(mimeType) => {
      const configKey = `attachments:contentDisposition:${mimeType}:inline`;
      try {
        const value = await crowi.configManager.getConfig(configKey);
        return { mimeType, value };
      }

      catch (err) {
        logger.warn(`Could not retrieve config for ${configKey}: ${err.message}`);
        return { mimeType, value: false };
      }
    });

    const results = await Promise.all(promises);

    const contentDispositionSettings = {};
    for (const result of results) {
      contentDispositionSettings[result.mimeType] = result.value;
    }

    return res.apiv3({ contentDispositionSettings });
  });

  // sets any specified mime type
  // needs body { isInline: boolean }
  router.put('/content-disposition/:mimeType',
    loginRequiredStrictly,
    adminRequired,
    addActivity,
    // validator.updateContentDisposition, // Validate path and body
    apiV3FormValidator,
    async(req, res) => {
      const { mimeType } = req.params; // Get mimeType from URL path
      const { isInline } = req.body; // Get isInline from request body

      const configKey = `attachments:contentDisposition:${mimeType}:inline`;

      try {
        // Update the configuration in the database
        await configManager.updateConfigs({ [configKey]: isInline });

        // Retrieve the updated value to send back in the response (best practice)
        const updatedIsInline = await crowi.configManager.getConfig(configKey);

        // Emit activity event for auditing
        const parameters = {
          action: SupportedAction.ACTION_ADMIN_ATTACHMENT_DISPOSITION_UPDATE, // need to define this SupportedAction
          mimeType,
          isInline: updatedIsInline,
        };
        activityEvent.emit('update', res.locals.activity._id, parameters);

        // Return success response
        return res.apiv3({ mimeType, isInline: updatedIsInline });
      }
      // Moved catch to new line for brace-style
      catch (err) {
        const msg = `Error occurred in updating content disposition for MIME type: ${mimeType}`;
        logger.error(msg, err);
        return res.apiv3Err(new ErrorV3(msg, 'update-content-disposition-failed'));
      }
    });

  // add function for setting predetermined allowed mime types in lists
  // Recommended, Strict, Moderately strict, Lax, etc

  return router;
};
