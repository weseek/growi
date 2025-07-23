import { ErrorV3 } from '@growi/core/dist/models';
import { body, param } from 'express-validator';

import { SupportedAction } from '~/interfaces/activity';
import { generateAddActivityMiddleware } from '~/server/middlewares/add-activity';
import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import { configManager } from '~/server/service/config-manager';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:routes:apiv3:content-disposition-settings');
const express = require('express');

const router = express.Router();

const validator = {
  updateContentDisposition: [
    param('mimeType')
      .exists()
      .notEmpty()
      .withMessage('MIME type is required')
      .bail()
      .matches(/^.+\/.+$/)
      .custom((value) => {
        const mimeTypeDefaults = configManager.getConfig('attachments:contentDisposition:mimeTypeDefaults');
        return Object.keys(mimeTypeDefaults).includes(value);
      })
      .withMessage('Invalid or unconfigurable MIME type specified.'),

    body('disposition')
      .isIn(['inline', 'attachment']) // Validate that it's one of these two strings
      .withMessage('`disposition` must be either "inline" or "attachment".'),
  ],
};

/*
 * @swagger
 *
 *  components:
 *    schemas:
 *    parameters:
 *      - $ref: '#/components/parameters/MimeTypePathParam'
  */
module.exports = (crowi) => {
  const loginRequiredStrictly = require('~/server/middlewares/login-required')(crowi);
  const adminRequired = require('~/server/middlewares/admin-required')(crowi);
  const addActivity = generateAddActivityMiddleware();
  const activityEvent = crowi.event('activity');

  /**
 * @swagger
 *
 * /content-disposition-settings:
 *   get:
 *     tags: [Content-Disposition Settings]
 *     summary: Get content disposition settings for configurable MIME types
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved content disposition settings.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 contentDispositionSettings:
 *                   type: object
 *                   additionalProperties:
 *                     type: string
 *                     description: inline or attachment
 *
 */
  router.get('/', loginRequiredStrictly, adminRequired, async(req, res) => {
    try {

      const mimeTypeDefaults = crowi.configManager.getConfig('attachments:contentDisposition:mimeTypeDefaults');
      const contentDispositionSettings: Record<string, 'inline' | 'attachment'> = mimeTypeDefaults;

      return res.apiv3({ contentDispositionSettings });
    }
    catch (err) {
      logger.error('Error retrieving content disposition settings:', err);
      return res.apiv3Err(new ErrorV3('Failed to retrieve content disposition settings', 'get-content-disposition-failed'));
    }
  });

  /**
 * @swagger
 *
 * paths:
 *    /content-disposition-settings/{mimeType}:
 *      put:
 *        tags: [Content Disposition Settings]
 *        summary: Update content disposition setting for a specific MIME type
 *        security:
 *          - cookieAuth: []
 *        parameters:
 *          - $ref: '#/components/parameters/MimeTypePathParam'
 *        requestBody:
 *          required: true
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                required:
 *                  - disposition
 *                properties:
 *                  disposition:
 *                     type: string
 *        responses:
 *          200:
 *            description: Successfully updated content disposition setting
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    setting:
 *                       type: object
 *                       properties:
 *                         mimeType:
 *                           type: string
 *                         disposition:
 *                           type: string
 */
  router.put(
    '/:mimeType(*)',
    loginRequiredStrictly,
    adminRequired,
    addActivity,
    validator.updateContentDisposition,
    apiV3FormValidator,
    async(req, res) => {
      const { mimeType } = req.params;
      const { disposition } = req.body;

      try {
        const currentMimeTypeDefaults = crowi.configManager.getConfig('attachments:contentDisposition:mimeTypeDefaults') as Record<string, 'inline'
          | 'attachment'>;

        const newDisposition: 'inline' | 'attachment' = disposition;

        const updatedMimeTypeDefaults = {
          ...currentMimeTypeDefaults,
          [mimeType]: newDisposition,
        };

        await crowi.configManager.updateConfigs({ 'attachments:contentDisposition:mimeTypeDefaults': updatedMimeTypeDefaults });
        const updatedDispositionFromDb = crowi.configManager.getConfig('attachments:contentDisposition:mimeTypeDefaults')[mimeType];

        const parameters = {
          action: SupportedAction.ACTION_ADMIN_ATTACHMENT_DISPOSITION_UPDATE,
          mimeType,
          disposition: updatedDispositionFromDb,
        };
        activityEvent.emit('update', res.locals.activity._id, parameters);

        return res.apiv3({ mimeType, disposition: updatedDispositionFromDb });
      }
      catch (err) {
        const msg = `Error occurred in updating content disposition for MIME type: ${mimeType}`;
        logger.error(msg, err);
        return res.apiv3Err(
          new ErrorV3(msg, 'update-content-disposition-failed'),
        );
      }
    },
  );

  return router;
};
