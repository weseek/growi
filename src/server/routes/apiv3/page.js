const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:page'); // eslint-disable-line no-unused-vars

const express = require('express');
const { body, query } = require('express-validator');

const router = express.Router();

const ErrorV3 = require('../../models/vo/error-apiv3');

/**
 * @swagger
 *  tags:
 *    name: Page
 */

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      Page:
 *        description: Page
 *        type: object
 *        properties:
 *          _id:
 *            type: string
 *            description: page ID
 *            example: 5e07345972560e001761fa63
 *          __v:
 *            type: number
 *            description: DB record version
 *            example: 0
 *          commentCount:
 *            type: number
 *            description: count of comments
 *            example: 3
 *          createdAt:
 *            type: string
 *            description: date created at
 *            example: 2010-01-01T00:00:00.000Z
 *          creator:
 *            $ref: '#/components/schemas/User'
 *          extended:
 *            type: object
 *            description: extend data
 *            example: {}
 *          grant:
 *            type: number
 *            description: grant
 *            example: 1
 *          grantedUsers:
 *            type: array
 *            description: granted users
 *            items:
 *              type: string
 *              description: user ID
 *            example: ["5ae5fccfc5577b0004dbd8ab"]
 *          lastUpdateUser:
 *            $ref: '#/components/schemas/User'
 *          liker:
 *            type: array
 *            description: granted users
 *            items:
 *              type: string
 *              description: user ID
 *            example: []
 *          path:
 *            type: string
 *            description: page path
 *            example: /
 *          redirectTo:
 *            type: string
 *            description: redirect path
 *            example: ""
 *          revision:
 *            type: string
 *            description: page revision
 *          seenUsers:
 *            type: array
 *            description: granted users
 *            items:
 *              type: string
 *              description: user ID
 *            example: ["5ae5fccfc5577b0004dbd8ab"]
 *          status:
 *            type: string
 *            description: status
 *            enum:
 *              - 'wip'
 *              - 'published'
 *              - 'deleted'
 *              - 'deprecated'
 *            example: published
 *          updatedAt:
 *            type: string
 *            description: date updated at
 *            example: 2010-01-01T00:00:00.000Z
 *
 *      LikeParams:
 *        description: LikeParams
 *        type: object
 *        properties:
 *          pageId:
 *            type: string
 *            description: page ID
 *            example: 5e07345972560e001761fa63
 *          bool:
 *            type: boolean
 *            description: boolean for like status
 */
module.exports = (crowi) => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi, true);
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const csrf = require('../../middlewares/csrf')(crowi);
  const apiV3FormValidator = require('../../middlewares/apiv3-form-validator')(crowi);

  const globalNotificationService = crowi.getGlobalNotificationService();
  const { Page, GlobalNotificationSetting, User } = crowi.models;
  const { exportService } = crowi;

  const validator = {
    likes: [
      body('pageId').isString(),
      body('bool').isBoolean(),
    ],
    likeInfo: [
      query('_id').isMongoId(),
    ],
    export: [
      query('format').isString().isIn(['md', 'pdf']),
      query('revisionId').isString(),
    ],
    archive: [
      body('rootPagePath').isString(),
      body('isCommentDownload').isBoolean(),
      body('isAttachmentFileDownload').isBoolean(),
      body('isSubordinatedPageDownload').isBoolean(),
      body('fileType').isString().isIn(['pdf', 'markdown']),
      body('hierarchyType').isString().isIn(['allSubordinatedPage', 'decideHierarchy']),
      body('hierarchyValue').isNumeric(),
    ],
  };

  /**
   * @swagger
   *
   *    /page/likes:
   *      put:
   *        tags: [Page]
   *        summary: /page/likes
   *        description: Update liked status
   *        operationId: updateLikedStatus
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/LikeParams'
   *        responses:
   *          200:
   *            description: Succeeded to update liked status.
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/Page'
   */
  router.put('/likes', accessTokenParser, loginRequiredStrictly, csrf, validator.likes, apiV3FormValidator, async(req, res) => {
    const { pageId, bool } = req.body;

    let page;
    try {
      page = await Page.findByIdAndViewer(pageId, req.user);
      if (page == null) {
        return res.apiv3Err(`Page '${pageId}' is not found or forbidden`);
      }
      if (bool) {
        page = await page.like(req.user);
      }
      else {
        page = await page.unlike(req.user);
      }
    }
    catch (err) {
      logger.error('update-like-failed', err);
      return res.apiv3Err(err, 500);
    }

    try {
      // global notification
      await globalNotificationService.fire(GlobalNotificationSetting.EVENT.PAGE_LIKE, page, req.user);
    }
    catch (err) {
      logger.error('Like notification failed', err);
    }

    const result = { page };
    result.seenUser = page.seenUsers;
    return res.apiv3({ result });
  });

  router.get('/like-info', loginRequired, validator.likeInfo, async(req, res) => {
    const pageId = req.query._id;
    const userId = req.user._id;
    try {
      const page = await Page.findById(pageId);
      const users = await Page.findById(pageId).populate('liker', User.USER_PUBLIC_FIELDS);
      const sumOfLikers = page.liker.length;
      const isLiked = page.liker.includes(userId);

      return res.apiv3({ users, sumOfLikers, isLiked });
    }
    catch (err) {
      logger.error('error like info', err);
      return res.apiv3Err(err, 500);
    }
  });

  /**
  * @swagger
  *
  *    /pages/export:
  *      get:
  *        tags: [Export]
  *        description: return page's markdown
  *        responses:
  *          200:
  *            description: Return page's markdown
  */
  router.get('/export/:pageId', loginRequiredStrictly, validator.export, async(req, res) => {
    const { pageId } = req.params;
    const { format, revisionId = null } = req.query;
    let revision;

    try {
      const Page = crowi.model('Page');
      const page = await Page.findByIdAndViewer(pageId, req.user);

      if (page == null) {
        const isPageExist = await Page.count({ _id: pageId }) > 0;
        if (isPageExist) {
          // This page exists but req.user has not read permission
          return res.apiv3Err(new ErrorV3(`Haven't the right to see the page ${pageId}.`), 403);
        }
        return res.apiv3Err(new ErrorV3(`Page ${pageId} is not exist.`), 404);
      }

      const revisionIdForFind = revisionId || page.revision;

      const Revision = crowi.model('Revision');
      revision = await Revision.findById(revisionIdForFind);
    }
    catch (err) {
      logger.error('Failed to get page data', err);
      return res.apiv3Err(err, 500);
    }

    const fileName = revision.id;
    let stream;

    try {
      stream = exportService.getReadStreamFromRevision(revision, format);
    }
    catch (err) {
      logger.error('Failed to create readStream', err);
      return res.apiv3Err(err, 500);
    }

    res.set({
      'Content-Disposition': `attachment;filename*=UTF-8''${fileName}.${format}`,
    });

    return stream.pipe(res);
  });

  // TODO GW-2746 bulk export pages
  // /**
  //  * @swagger
  //  *
  //  *    /page/archive:
  //  *      post:
  //  *        tags: [Page]
  //  *        summary: /page/archive
  //  *        description: create page archive
  //  *        requestBody:
  //  *          content:
  //  *            application/json:
  //  *              schema:
  //  *                properties:
  //  *                  rootPagePath:
  //  *                    type: string
  //  *                    description: path of the root page
  //  *                  isCommentDownload:
  //  *                    type: boolean
  //  *                    description: whether archive data contains comments
  //  *                  isAttachmentFileDownload:
  //  *                    type: boolean
  //  *                    description: whether archive data contains attachments
  //  *                  isSubordinatedPageDownload:
  //  *                    type: boolean
  //  *                    description: whether archive data children pages
  //  *                  fileType:
  //  *                    type: string
  //  *                    description: file type of archive data(.md, .pdf)
  //  *                  hierarchyType:
  //  *                    type: string
  //  *                    description: method of select children pages archive data contains('allSubordinatedPage', 'decideHierarchy')
  //  *                  hierarchyValue:
  //  *                    type: number
  //  *                    description: depth of hierarchy(use when hierarchyType is 'decideHierarchy')
  //  *        responses:
  //  *          200:
  //  *            description: create page archive
  //  *            content:
  //  *              application/json:
  //  *                schema:
  //  *                  $ref: '#/components/schemas/Page'
  //  */
  // router.post('/archive', accessTokenParser, loginRequired, csrf, validator.archive, apiV3FormValidator, async(req, res) => {
  //   const PageArchive = crowi.model('PageArchive');

  //   const {
  //     rootPagePath,
  //     isCommentDownload,
  //     isAttachmentFileDownload,
  //     fileType,
  //   } = req.body;
  //   const owner = req.user._id;

  //   const numOfPages = 1; // TODO 最終的にzipファイルに取り込むページ数を入れる

  //   const createdPageArchive = PageArchive.create({
  //     owner,
  //     fileType,
  //     rootPagePath,
  //     numOfPages,
  //     hasComment: isCommentDownload,
  //     hasAttachment: isAttachmentFileDownload,
  //   });

  //   console.log(createdPageArchive);
  //   return res.apiv3({ });

  // });

  // router.get('/count-children-pages', accessTokenParser, loginRequired, async(req, res) => {

  //   // TO DO implement correct number at another task

  //   const { pageId } = req.query;
  //   console.log(pageId);

  //   const dummy = 6;
  //   return res.apiv3({ dummy });
  // });

  return router;
};
