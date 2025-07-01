import { ErrorV3 } from '@growi/core/dist/models';
import { body, param } from 'express-validator';

import { SupportedAction } from '~/interfaces/activity';
import { configManager } from '~/server/service/config-manager';
import loggerFactory from '~/utils/logger';

import { generateAddActivityMiddleware } from '../../middlewares/add-activity';
import { apiV3FormValidator } from '../../middlewares/apiv3-form-validator';

import { CONFIGURABLE_MIME_TYPES_FOR_DISPOSITION } from './configurable-mime-types';

const logger = loggerFactory('growi:routes:apiv3:markdown-setting');
const express = require('express');

const router = express.Router();

const validator = {
  updateContentDisposition: [
    param('mimeType').exists().notEmpty().withMessage('MIME type is required')
      .bail()
      .matches(/^.+\/.+$/)
      .custom(value => CONFIGURABLE_MIME_TYPES_FOR_DISPOSITION.includes(value))
      .withMessage('Invalid or unconfigurable MIME type specified.'),

    body('isInline')
      .isBoolean().withMessage('`isInline` must be a boolean.')
      .toBoolean(),
  ],
};

module.exports = (crowi) => {
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const addActivity = generateAddActivityMiddleware(crowi);
  const activityEvent = crowi.event('activity');


  router.get('/', loginRequiredStrictly, adminRequired, async(req, res) => {
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


  router.put('/:mimeType(*)',
    loginRequiredStrictly,
    adminRequired,
    addActivity,
    validator.updateContentDisposition, // Validate path and body
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

      catch (err) {
        const msg = `Error occurred in updating content disposition for MIME type: ${mimeType}`;
        logger.error(msg, err);
        return res.apiv3Err(new ErrorV3(msg, 'update-content-disposition-failed'));
      }
    });

  return router;
};
