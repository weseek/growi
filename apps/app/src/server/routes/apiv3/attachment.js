import { ErrorV3 } from '@growi/core/dist/models';

import loggerFactory from '~/utils/logger';

import { apiV3FormValidator } from '../../middlewares/apiv3-form-validator';

const logger = loggerFactory('growi:routes:apiv3:attachment'); // eslint-disable-line no-unused-vars
const express = require('express');

const router = express.Router();
const { query } = require('express-validator');

const { serializeUserSecurely } = require('../../models/serializers/user-serializer');

/**
 * @swagger
 *  tags:
 *    name: Attachment
 */

module.exports = (crowi) => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi, true);
  const Page = crowi.model('Page');
  const User = crowi.model('User');
  const Attachment = crowi.model('Attachment');

  const validator = {
    attachment: [
      query('attachmentId').isMongoId().withMessage('attachmentId is required'),
    ],
    retrieveAttachments: [
      query('pageId').isMongoId().withMessage('pageId is required'),
      query('pageNumber').optional().isInt().withMessage('pageNumber must be a number'),
      query('limit').optional().isInt({ max: 100 }).withMessage('You should set less than 100 or not to set limit.'),
    ],
  };

  /**
   * @swagger
   *
   *    /attachment:
   *      get:
   *        tags: [Attachment]
   *        description: Get attachment
   *        responses:
   *          200:
   *            description: Return attachment
   *        parameters:
   *          - name: attachemnt_id
   *            in: query
   *            required: true
   *            description: attachment id
   *            schema:
   *              type: string
   */
  router.get('/', accessTokenParser, loginRequired, validator.attachment, apiV3FormValidator, async(req, res) => {
    try {
      const attachmentId = req.query.attachmentId;

      const attachment = await Attachment.findById(attachmentId).populate('creator').exec();

      if (attachment == null) {
        const message = 'Attachment not found';
        return res.apiv3Err(message, 404);
      }

      if (attachment.creator != null && attachment.creator instanceof User) {
        attachment.creator = serializeUserSecurely(attachment.creator);
      }

      return res.apiv3({ attachment });
    }
    catch (err) {
      logger.error('Attachment retrieval failed', err);
      return res.apiv3Err(err, 500);
    }
  });

  /**
   * @swagger
   *
   *    /attachment/list:
   *      get:
   *        tags: [Attachment]
   *        description: Get attachment list
   *        responses:
   *          200:
   *            description: Return attachment list
   *        parameters:
   *          - name: page_id
   *            in: query
   *            required: true
   *            description: page id
   *            schema:
   *              type: string
   */
  router.get('/list', accessTokenParser, loginRequired, validator.retrieveAttachments, apiV3FormValidator, async(req, res) => {

    const limit = req.query.limit || await crowi.configManager.getConfig('crowi', 'customize:showPageLimitationS') || 10;
    const pageNumber = req.query.pageNumber || 1;
    const offset = (pageNumber - 1) * limit;

    try {
      const pageId = req.query.pageId;
      // check whether accessible
      const isAccessible = await Page.isAccessiblePageByViewer(pageId, req.user);
      if (!isAccessible) {
        const msg = 'Current user is not accessible to this page.';
        return res.apiv3Err(new ErrorV3(msg, 'attachment-list-failed'), 403);
      }

      // directly get paging-size from db. not to delivery from client side.

      const paginateResult = await Attachment.paginate(
        { page: pageId },
        {
          limit,
          offset,
          populate: 'creator',
        },
      );

      paginateResult.docs.forEach((doc) => {
        if (doc.creator != null && doc.creator instanceof User) {
          doc.creator = serializeUserSecurely(doc.creator);
        }
      });

      return res.apiv3({ paginateResult });
    }
    catch (err) {
      logger.error('Attachment not found', err);
      return res.apiv3Err(err, 500);
    }
  });

  /**
   * @swagger
   *
   *    /attachment/limit:
   *      get:
   *        tags: [Attachment]
   *        operationId: getAttachmentLimit
   *        summary: /attachment/limit
   *        description: Get available capacity of uploaded file with GridFS
   *        parameters:
   *          - in: query
   *            name: fileSize
   *            schema:
   *              type: number
   *              description: file size
   *              example: 23175
   *            required: true
   *        responses:
   *          200:
   *            description: Succeeded to get available capacity of uploaded file with GridFS.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    isUploadable:
   *                      type: boolean
   *                      description: uploadable
   *                      example: true
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
  /**
   * @api {get} /attachment/limit get available capacity of uploaded file with GridFS
   * @apiName AddAttachment
   * @apiGroup Attachment
   */
  router.get('/limit', accessTokenParser, loginRequired, apiV3FormValidator, async(req, res) => {
    const { fileUploadService } = crowi;
    const fileSize = Number(req.query.fileSize);
    return res.apiv3(await fileUploadService.checkLimit(fileSize));
  });

  return router;
};
