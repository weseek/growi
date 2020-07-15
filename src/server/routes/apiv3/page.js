const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:page'); // eslint-disable-line no-unused-vars

const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

// const ErrorV3 = require('../../models/vo/error-apiv3');

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
  const loginRequired = require('../../middlewares/login-required')(crowi);
  const csrf = require('../../middlewares/csrf')(crowi);
  const apiV3FormValidator = require('../../middlewares/apiv3-form-validator')(crowi);

  const globalNotificationService = crowi.getGlobalNotificationService();
  const { Page, GlobalNotificationSetting } = crowi.models;

  const validator = {
    likes: [
      body('pageId').isString(),
      body('bool').isBoolean(),
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
  router.put('/likes', accessTokenParser, loginRequired, csrf, validator.likes, apiV3FormValidator, async(req, res) => {
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
  router.get('/export', async(req, res) => {
    try {
      const { pageId, revisionId } = req.query;
      let markdown;

      // TODO: GW-3061
      if (revisionId) {
        markdown = '#Revision';
      }
      else if (pageId) {
        markdown = '#Page';
      }
      else {
        return res.apiv3Err('Should provided pageId or revisionId');
      }

      return res.apiv3({ markdown });
    }
    catch (err) {
      logger.error('Failed to get markdown', err);
      return res.apiv3Err(err, 500);
    }
  });

  /**
   * @swagger
   *
   *    /page/archive:
   *      post:
   *        tags: [Page]
   *        summary: /page/archive
   *        description: create page archive
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  rootPagePath:
   *                    type: string
   *                    description: path of the root page
   *                  isCommentDownload:
   *                    type: boolean
   *                    description: whether archive data contains comments
   *                  isAttachmentFileDownload:
   *                    type: boolean
   *                    description: whether archive data contains attachments
   *                  isSubordinatedPageDownload:
   *                    type: boolean
   *                    description: whether archive data children pages
   *                  fileType:
   *                    type: string
   *                    description: file type of archive data(.md, .pdf)
   *                  hierarchyType:
   *                    type: string
   *                    description: method of select children pages archive data contains('allSubordinatedPage', 'decideHierarchy')
   *                  hierarchyValue:
   *                    type: number
   *                    description: depth of hierarchy(use when hierarchyType is 'decideHierarchy')
   *        responses:
   *          200:
   *            description: create page archive
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/Page'
   */
  router.post('/archive', accessTokenParser, loginRequired, csrf, validator.archive, apiV3FormValidator, async(req, res) => {
    const PageArchive = crowi.model('PageArchive');
    const {
      rootPagePath,
      isCommentDownload,
      isAttachmentFileDownload,
      fileType,
    } = req.body;
    const owner = req.user._id;

    const numOfPages = 1; // TODO 最終的にzipファイルに取り込むページ数を入れる

    const createdPageArchive = PageArchive.create({
      owner,
      fileType,
      rootPagePath,
      numOfPages,
      hasComment: isCommentDownload,
      hasAttachment: isAttachmentFileDownload,
    });
    const searchWord = new RegExp(`^${rootPagePath}`);
    let archivePageData = await Page.find({ path: { $in: searchWord } });
    archivePageData = archivePageData.map(element => element.id);
    // create Archiveした時にその配下のページのPage IDを現時点ではコンソールログで出力している。
    console.log(archivePageData);

    console.log(createdPageArchive);
    return res.apiv3({ });

  });

  router.get('/count-children-pages', accessTokenParser, loginRequired, async(req, res) => {

    // TO DO implement correct number at another task

    const { pageId } = req.query;
    console.log(pageId);

    const dummy = 6;
    return res.apiv3({ dummy });
  });

  return router;
};
