import { ErrorV3 } from '@growi/core/dist/models';
import { serializeUserSecurely } from '@growi/core/dist/models/serializers';
import express from 'express';
import multer from 'multer';
import autoReap from 'multer-autoreap';

import { SupportedAction } from '~/interfaces/activity';
import { AttachmentType } from '~/server/interfaces/attachment';
import { Attachment } from '~/server/models/attachment';
import { serializePageSecurely, serializeRevisionSecurely } from '~/server/models/serializers';
import loggerFactory from '~/utils/logger';

import { generateAddActivityMiddleware } from '../../middlewares/add-activity';
import { apiV3FormValidator } from '../../middlewares/apiv3-form-validator';
import { certifySharedPageAttachmentMiddleware } from '../../middlewares/certify-shared-page-attachment';
import { excludeReadOnlyUser } from '../../middlewares/exclude-read-only-user';


const logger = loggerFactory('growi:routes:apiv3:attachment'); // eslint-disable-line no-unused-vars

const router = express.Router();
const {
  query, param, body,
} = require('express-validator');


/**
 * @swagger
 *  tags:
 *    name: Attachment
 */


/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      Attachment:
 *        description: Attachment
 *        type: object
 *        properties:
 *          _id:
 *            type: string
 *            description: attachment ID
 *            example: 5e0734e072560e001761fa67
 *          __v:
 *            type: number
 *            description: attachment version
 *            example: 0
 *          fileFormat:
 *            type: string
 *            description: file format in MIME
 *            example: text/plain
 *          fileName:
 *            type: string
 *            description: file name
 *            example: 601b7c59d43a042c0117e08dd37aad0aimage.txt
 *          originalName:
 *            type: string
 *            description: original file name
 *            example: file.txt
 *          creator:
 *            $ref: '#/components/schemas/User'
 *          page:
 *            type: string
 *            description: page ID attached at
 *            example: 5e07345972560e001761fa63
 *          createdAt:
 *            type: string
 *            description: date created at
 *            example: 2010-01-01T00:00:00.000Z
 *          fileSize:
 *            type: number
 *            description: file size
 *            example: 3494332
 *          url:
 *            type: string
 *            description: attachment URL
 *            example: http://localhost/files/5e0734e072560e001761fa67
 *          filePathProxied:
 *            type: string
 *            description: file path proxied
 *            example: "/attachment/5e0734e072560e001761fa67"
 *          downloadPathProxied:
 *            type: string
 *            description: download path proxied
 *            example: "/download/5e0734e072560e001761fa67"
 */

module.exports = (crowi) => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi, true);
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const Page = crowi.model('Page');
  const User = crowi.model('User');
  const { attachmentService } = crowi;
  const uploads = multer({ dest: `${crowi.tmpDir}uploads` });
  const addActivity = generateAddActivityMiddleware(crowi);

  const activityEvent = crowi.event('activity');

  const validator = {
    retrieveAttachment: [
      param('id').isMongoId().withMessage('attachment id is required'),
    ],
    retrieveAttachments: [
      query('pageId').isMongoId().withMessage('pageId is required'),
      query('pageNumber').optional().isInt().withMessage('pageNumber must be a number'),
      query('limit').optional().isInt({ max: 100 }).withMessage('You should set less than 100 or not to set limit.'),
    ],
    retrieveFileLimit: [
      query('fileSize').isNumeric().exists({ checkNull: true }).withMessage('fileSize is required'),
    ],
    retrieveAddAttachment: [
      body('page_id').isString().exists({ checkNull: true }).withMessage('page_id is required'),
    ],
  };

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
  router.get('/limit', accessTokenParser, loginRequiredStrictly, validator.retrieveFileLimit, apiV3FormValidator, async(req, res) => {
    const { fileUploadService } = crowi;
    const fileSize = Number(req.query.fileSize);
    try {
      return res.apiv3(await fileUploadService.checkLimit(fileSize));
    }
    catch (err) {
      logger.error('File limit retrieval failed', err);
      return res.apiv3Err(err, 500);
    }
  });

  /**
   * @swagger
   *
   *    /attachment:
   *      post:
   *        tags: [Attachment, CrowiCompatibles]
   *        operationId: addAttachment
   *        summary: /attachment
   *        description: Add attachment to the page
   *        requestBody:
   *          content:
   *            "multipart/form-data":
   *              schema:
   *                properties:
   *                  page_id:
   *                    nullable: true
   *                    type: string
   *                  path:
   *                    nullable: true
   *                    type: string
   *                  file:
   *                    type: string
   *                    format: binary
   *                    description: attachment data
   *              encoding:
   *                path:
   *                  contentType: application/x-www-form-urlencoded
   *            "*\/*":
   *              schema:
   *                properties:
   *                  page_id:
   *                    nullable: true
   *                    type: string
   *                  path:
   *                    nullable: true
   *                    type: string
   *                  file:
   *                    type: string
   *                    format: binary
   *                    description: attachment data
   *              encoding:
   *                path:
   *                  contentType: application/x-www-form-urlencoded
   *        responses:
   *          200:
   *            description: Succeeded to add attachment.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    page:
   *                      $ref: '#/components/schemas/Page'
   *                    attachment:
   *                      $ref: '#/components/schemas/Attachment'
   *                    url:
   *                      $ref: '#/components/schemas/Attachment/properties/url'
   *                    pageCreated:
   *                      type: boolean
   *                      description: whether the page was created
   *                      example: false
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
  /**
   * @api {post} /attachment Add attachment to the page
   * @apiName AddAttachment
   * @apiGroup Attachment
   *
   * @apiParam {String} page_id
   * @apiParam {String} path
   * @apiParam {File} file
   */
  router.post('/', uploads.single('file'), autoReap, accessTokenParser, loginRequiredStrictly, excludeReadOnlyUser,
    validator.retrieveAddAttachment, apiV3FormValidator, addActivity,
    async(req, res) => {

      const pageId = req.body.page_id;

      // check params
      const file = req.file || null;
      if (file == null) {
        return res.apiv3Err('File error.');
      }

      try {
        const page = await Page.findById(pageId);

        // check the user is accessible
        const isAccessible = await Page.isAccessiblePageByViewer(page.id, req.user);
        if (!isAccessible) {
          return res.apiv3Err(`Forbidden to access to the page '${page.id}'`);
        }

        const attachment = await attachmentService.createAttachment(file, req.user, pageId, AttachmentType.WIKI_PAGE);

        const result = {
          page: serializePageSecurely(page),
          revision: serializeRevisionSecurely(page.revision),
          attachment: attachment.toObject({ virtuals: true }),
        };

        activityEvent.emit('update', res.locals.activity._id, { action: SupportedAction.ACTION_ATTACHMENT_ADD });

        res.apiv3(result);
      }
      catch (err) {
        logger.error(err);
        return res.apiv3Err(err.message);
      }
    });

  /**
   * @swagger
   *
   *    /attachment/{id}:
   *      get:
   *        tags: [Attachment]
   *        description: Get attachment
   *        responses:
   *          200:
   *            description: Return attachment
   *        parameters:
   *          - name: id
   *            in: path
   *            required: true
   *            description: attachment id
   *            schema:
   *              type: string
   */
  router.get('/:id', accessTokenParser, certifySharedPageAttachmentMiddleware, loginRequired, validator.retrieveAttachment, apiV3FormValidator,
    async(req, res) => {
      try {
        const attachmentId = req.params.id;

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

  return router;
};
