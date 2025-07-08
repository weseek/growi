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


  /**
   * @swagger
  * /markdown-setting:
  * get:
  *  tags: [Markdown Settings]
  *  summary: Get content disposition settings for configurable MIME types
  *  description: Retrieve the current `inline` or `attachment` disposition setting for each configurable MIME type.
  *  security:
  *    - cookieAuth: []
  *    - adminRequired: []
  *  responses:
  *    200:
  *      description: Successfully retrieved content disposition settings.
  *      content:
  *        application/json:
  *          schema:
  *            type: object
  *            properties:
  *              contentDispositionSettings:
  *                type: object
  *                description: An object mapping configurable MIME types to their current inline disposition status.
  *                additionalProperties:
  *                  type: boolean
  *                  description: true if inline, false if attachment.
  *                example:
  *                  image/png: true
  *                  application/pdf: false
  *                  text/plain: true
  *    401:
  *      $ref: '#/components/responses/401'
  *    403:
  *    $ref: '#/components/responses/403'
  *  500:
  *     $ref: '#/components/responses/500'
  *
   */
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


  /**
 * @swagger
 *
 * /markdown-setting/{mimeType}:
 *    put:
 *      tags: [Content Disposition Settings]
 *      summary: Update content disposition setting for a specific MIME type
 *      description: Set the `inline` or `attachment` disposition for a given configurable MIME type.
 *      security:
 *        - cookieAuth: []
 *        - adminRequired: []
 *      parameters:
 *        - $ref: '#/components/parameters/MimeTypePathParam'
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - isInline
 *              properties:
 *                isInline:
 *                  type: boolean
 *                  description: Set to `true` for inline disposition, `false` for attachment disposition (e.g., prompts download).
 *                  example: true
 *   responses:
 *     200:
 *       description: Successfully updated content disposition setting.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mimeType:
 *                 type: string
 *                 description: The updated MIME type.
 *                 example: image/png
 *               isInline:
 *                 type: boolean
 *                 description: The new disposition status (`true` for inline, `false` for attachment).
 *                 example: true
 *     400:
 *       $ref: '#/components/responses/400'
 *     401:
 *       $ref: '#/components/responses/401'
 *     403:
 *       $ref: '#/components/responses/403'
 *     500:
 *       $ref: '#/components/responses/500'
 */
  router.put('/:mimeType(*)',
    loginRequiredStrictly,
    adminRequired,
    addActivity,
    validator.updateContentDisposition,
    apiV3FormValidator,
    async(req, res) => {
      const { mimeType } = req.params;
      const { isInline } = req.body;

      const configKey = `attachments:contentDisposition:${mimeType}:inline`;

      try {
        // Update the configuration in the database
        await configManager.updateConfigs({ [configKey]: isInline });

        // Retrieve the updated value to send back in the response
        const updatedIsInline = await crowi.configManager.getConfig(configKey);

        const parameters = {
          action: SupportedAction.ACTION_ADMIN_ATTACHMENT_DISPOSITION_UPDATE,
          mimeType,
          isInline: updatedIsInline,
        };
        activityEvent.emit('update', res.locals.activity._id, parameters);

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
