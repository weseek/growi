import { isCreatablePage, isUserPage } from '@growi/core/dist/utils/page-path-utils';

import { SupportedAction } from '~/interfaces/activity';
import { AttachmentType } from '~/server/interfaces/attachment';
import loggerFactory from '~/utils/logger';

/* eslint-disable no-use-before-define */


const logger = loggerFactory('growi:routes:attachment');

const { serializePageSecurely } = require('../models/serializers/page-serializer');
const { serializeRevisionSecurely } = require('../models/serializers/revision-serializer');
const ApiResponse = require('../util/apiResponse');

/**
 * @swagger
 *  tags:
 *    name: Attachments
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

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      AttachmentProfile:
 *        description: Attachment
 *        type: object
 *        properties:
 *          id:
 *            type: string
 *            description: attachment ID
 *            example: 5e0734e072560e001761fa67
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
 *            example: image/png
 *          fileName:
 *            type: string
 *            description: file name
 *            example: 601b7c59d43a042c0117e08dd37aad0a.png
 *          originalName:
 *            type: string
 *            description: original file name
 *            example: profile.png
 *          creator:
 *            $ref: '#/components/schemas/User/properties/_id'
 *          page:
 *            type: string
 *            description: page ID attached at
 *            example: null
 *          createdAt:
 *            type: string
 *            description: date created at
 *            example: 2010-01-01T00:00:00.000Z
 *          fileSize:
 *            type: number
 *            description: file size
 *            example: 3494332
 *          filePathProxied:
 *            type: string
 *            description: file path proxied
 *            example: "/attachment/5e0734e072560e001761fa67"
 *          downloadPathProxied:
 *            type: string
 *            description: download path proxied
 *            example: "/download/5e0734e072560e001761fa67"
 */

module.exports = function(crowi, app) {
  const Attachment = crowi.model('Attachment');
  const Page = crowi.model('Page');
  const User = crowi.model('User');
  const GlobalNotificationSetting = crowi.model('GlobalNotificationSetting');
  const { attachmentService, globalNotificationService } = crowi;

  const activityEvent = crowi.event('activity');

  /**
   * Check the user is accessible to the related page
   *
   * @param {User} user
   * @param {Attachment} attachment
   */
  async function isAccessibleByViewer(user, attachment) {
    if (attachment.page != null) {
      // eslint-disable-next-line no-return-await
      return await Page.isAccessiblePageByViewer(attachment.page, user);
    }
    return true;
  }

  /**
   * Check the user is accessible to the related page
   *
   * @param {User} user
   * @param {Attachment} attachment
   */
  async function isDeletableByUser(user, attachment) {
    // deletable if creator is null
    if (attachment.creator == null) {
      return true;
    }

    const ownerId = attachment.creator._id || attachment.creator;
    if (attachment.page == null) { // when profile image
      return user.id === ownerId.toString();
    }

    // eslint-disable-next-line no-return-await
    return await Page.isAccessiblePageByViewer(attachment.page, user);
  }

  /**
   * Common method to response
   *
   * @param {Request} req
   * @param {Response} res
   * @param {User} user
   * @param {Attachment} attachment
   * @param {boolean} forceDownload
   */
  async function responseForAttachment(req, res, attachment, forceDownload) {
    const { fileUploadService } = crowi;

    if (attachment == null) {
      return res.json(ApiResponse.error('attachment not found'));
    }

    const user = req.user;
    const isAccessible = await isAccessibleByViewer(user, attachment);
    if (!isAccessible) {
      return res.json(ApiResponse.error(`Forbidden to access to the attachment '${attachment.id}'. This attachment might belong to other pages.`));
    }

    // add headers before evaluating 'req.fresh'
    setHeaderToRes(res, attachment, forceDownload);

    // return 304 if request is "fresh"
    // see: http://expressjs.com/en/5x/api.html#req.fresh
    if (req.fresh) {
      return res.sendStatus(304);
    }

    if (fileUploadService.canRespond()) {
      return fileUploadService.respond(res, attachment);
    }

    let fileStream;
    try {
      fileStream = await fileUploadService.findDeliveryFile(attachment);
    }
    catch (e) {
      logger.error(e);
      return res.json(ApiResponse.error(e.message));
    }

    const parameters = {
      ip:  req.ip,
      endpoint: req.originalUrl,
      action: SupportedAction.ACTION_ATTACHMENT_DOWNLOAD,
      user: req.user?._id,
      snapshot: {
        username: req.user?.username,
      },
    };
    await crowi.activityService.createActivity(parameters);

    return fileStream.pipe(res);
  }

  /**
   * set http response header
   *
   * @param {Response} res
   * @param {Attachment} attachment
   * @param {boolean} forceDownload
   */
  function setHeaderToRes(res, attachment, forceDownload) {
    res.set({
      ETag: `Attachment-${attachment._id}`,
      'Last-Modified': attachment.createdAt.toUTCString(),
    });

    if (attachment.fileSize) {
      res.set({
        'Content-Length': attachment.fileSize,
      });
    }

    // download
    if (forceDownload) {
      res.set({
        'Content-Disposition': `attachment;filename*=UTF-8''${encodeURIComponent(attachment.originalName)}`,
      });
    }
    // reference
    else {
      res.set({
        'Content-Type': attachment.fileFormat,
        // eslint-disable-next-line max-len
        'Content-Security-Policy': "script-src 'unsafe-hashes'; style-src 'self' 'unsafe-inline'; object-src 'none'; require-trusted-types-for 'script'; media-src 'self'; default-src 'none';",
        'Content-Disposition': `inline;filename*=UTF-8''${encodeURIComponent(attachment.originalName)}`,
      });
    }
  }


  const actions = {};
  const api = {};

  actions.api = api;

  api.download = async function(req, res) {
    const id = req.params.id;

    const attachment = await Attachment.findById(id);

    return responseForAttachment(req, res, attachment, true);
  };

  /**
   * @api {get} /attachments.get get attachments
   * @apiName get
   * @apiGroup Attachment
   *
   * @apiParam {String} id
   */
  api.get = async function(req, res) {
    const id = req.params.id;

    const attachment = await Attachment.findById(id);

    return responseForAttachment(req, res, attachment);
  };

  api.getBrandLogo = async function(req, res) {
    const brandLogoAttachment = await Attachment.findOne({ attachmentType: AttachmentType.BRAND_LOGO });

    if (brandLogoAttachment == null) {
      return res.status(404).json(ApiResponse.error('Brand logo does not exist'));
    }

    return responseForAttachment(req, res, brandLogoAttachment);
  };

  /**
   * @api {get} /attachments.obsoletedGetForMongoDB get attachments from mongoDB
   * @apiName get
   * @apiGroup Attachment
   *
   * @apiParam {String} pageId, fileName
   */
  api.obsoletedGetForMongoDB = async function(req, res) {
    if (crowi.configManager.getConfig('crowi', 'app:fileUploadType') !== 'mongodb') {
      return res.status(400);
    }

    const pageId = req.params.pageId;
    const fileName = req.params.fileName;
    const filePath = `attachment/${pageId}/${fileName}`;

    const attachment = await Attachment.findOne({ filePath });

    return responseForAttachment(req, res, attachment);
  };


  /**
   * @swagger
   *
   *    /attachments.add:
   *      post:
   *        tags: [Attachments, CrowiCompatibles]
   *        operationId: addAttachment
   *        summary: /attachments.add
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
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
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
   * @api {post} /attachments.add Add attachment to the page
   * @apiName AddAttachments
   * @apiGroup Attachment
   *
   * @apiParam {String} page_id
   * @apiParam {File} file
   */
  api.add = async function(req, res) {
    const pageId = req.body.page_id || null;
    const pagePath = req.body.path || null;

    // check params
    if (pageId == null && pagePath == null) {
      return res.json(ApiResponse.error('Either page_id or path is required.'));
    }
    if (req.file == null) {
      return res.json(ApiResponse.error('File error.'));
    }

    const file = req.file;

    try {
      const page = await Page.findById(pageId);

      // check the user is accessible
      const isAccessible = await Page.isAccessiblePageByViewer(page.id, req.user);
      if (!isAccessible) {
        return res.json(ApiResponse.error(`Forbidden to access to the page '${page.id}'`));
      }

      const attachment = await attachmentService.createAttachment(file, req.user, pageId, AttachmentType.WIKI_PAGE);

      const result = {
        page: serializePageSecurely(page),
        revision: serializeRevisionSecurely(page.revision),
        attachment: attachment.toObject({ virtuals: true }),
      };

      activityEvent.emit('update', res.locals.activity._id, { action: SupportedAction.ACTION_ATTACHMENT_ADD });

      res.json(ApiResponse.success(result));
    }
    catch (err) {
      logger.error(err);
      return res.json(ApiResponse.error(err.message));
    }
  };

  /**
   * @swagger
   *
   *    /attachments.uploadProfileImage:
   *      post:
   *        tags: [Attachments]
   *        operationId: uploadProfileImage
   *        summary: /attachments.uploadProfileImage
   *        description: Upload profile image
   *        requestBody:
   *          content:
   *            "multipart/form-data":
   *              schema:
   *                properties:
   *                  file:
   *                    type: string
   *                    format: binary
   *                    description: attachment data
   *                  user:
   *                    type: string
   *                    description: user to set profile image
   *              encoding:
   *                path:
   *                  contentType: application/x-www-form-urlencoded
   *            "*\/*":
   *              schema:
   *                properties:
   *                  file:
   *                    type: string
   *                    format: binary
   *                    description: attachment data
   *                  user:
   *                    type: string
   *                    description: user to set profile
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
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *                    attachment:
   *                      $ref: '#/components/schemas/AttachmentProfile'
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
  /**
   * @api {post} /attachments.uploadProfileImage Add attachment for profile image
   * @apiName UploadProfileImage
   * @apiGroup Attachment
   *
   * @apiParam {File} file
   */
  api.uploadProfileImage = async function(req, res) {
    // check params
    if (req.file == null) {
      return res.json(ApiResponse.error('File error.'));
    }
    if (!req.user) {
      return res.json(ApiResponse.error('param "user" must be set.'));
    }

    const file = req.file;

    // check type
    const acceptableFileType = /image\/.+/;
    if (!file.mimetype.match(acceptableFileType)) {
      return res.json(ApiResponse.error('File type error. Only image files is allowed to set as user picture.'));
    }

    let attachment;
    try {
      req.user.deleteImage();
      attachment = await attachmentService.createAttachment(file, req.user, null, AttachmentType.PROFILE_IMAGE);
      await req.user.updateImage(attachment);
    }
    catch (err) {
      logger.error(err);
      return res.json(ApiResponse.error(err.message));
    }

    const result = {
      attachment: attachment.toObject({ virtuals: true }),
    };

    return res.json(ApiResponse.success(result));
  };

  /**
   * @swagger
   *
   *    /attachments.remove:
   *      post:
   *        tags: [Attachments, CrowiCompatibles]
   *        operationId: removeAttachment
   *        summary: /attachments.remove
   *        description: Remove attachment
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  attachment_id:
   *                    $ref: '#/components/schemas/Attachment/properties/_id'
   *                required:
   *                  - attachment_id
   *        responses:
   *          200:
   *            description: Succeeded to remove attachment.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
  /**
   * @api {post} /attachments.remove Remove attachments
   * @apiName RemoveAttachments
   * @apiGroup Attachment
   *
   * @apiParam {String} attachment_id
   */
  api.remove = async function(req, res) {
    const id = req.body.attachment_id;

    const attachment = await Attachment.findById(id);

    if (attachment == null) {
      return res.json(ApiResponse.error('attachment not found'));
    }

    const isDeletable = await isDeletableByUser(req.user, attachment);
    if (!isDeletable) {
      return res.json(ApiResponse.error(`Forbidden to remove the attachment '${attachment.id}'`));
    }

    try {
      await attachmentService.removeAttachment(attachment);
    }
    catch (err) {
      logger.error(err);
      return res.status(500).json(ApiResponse.error('Error while deleting file'));
    }

    activityEvent.emit('update', res.locals.activity._id, { action: SupportedAction.ACTION_ATTACHMENT_REMOVE });

    return res.json(ApiResponse.success({}));
  };

  /**
   * @swagger
   *
   *    /attachments.removeProfileImage:
   *      post:
   *        tags: [Attachments]
   *        operationId: removeProfileImage
   *        summary: /attachments.removeProfileImage
   *        description: Remove profile image
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  user:
   *                    type: string
   *                    description: user to remove profile image
   *        responses:
   *          200:
   *            description: Succeeded to add attachment.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
  /**
   * @api {post} /attachments.removeProfileImage Remove profile image attachments
   * @apiGroup Attachment
   * @apiParam {String} attachment_id
   */
  api.removeProfileImage = async function(req, res) {
    const user = req.user;
    const attachment = await Attachment.findById(user.imageAttachment);

    if (attachment == null) {
      return res.json(ApiResponse.error('attachment not found'));
    }

    const isDeletable = await isDeletableByUser(user, attachment);
    if (!isDeletable) {
      return res.json(ApiResponse.error(`Forbidden to remove the attachment '${attachment.id}'`));
    }

    try {
      await user.deleteImage();
    }
    catch (err) {
      logger.error(err);
      return res.status(500).json(ApiResponse.error('Error while deleting image'));
    }

    return res.json(ApiResponse.success({}));
  };

  return actions;
};
