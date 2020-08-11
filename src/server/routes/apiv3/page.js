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
  const loginRequired = require('../../middlewares/login-required')(crowi);
  const csrf = require('../../middlewares/csrf')(crowi);
  const apiV3FormValidator = require('../../middlewares/apiv3-form-validator')(crowi);

  const globalNotificationService = crowi.getGlobalNotificationService();
  const { Page, GlobalNotificationSetting } = crowi.models;
  const { exportService } = crowi;

  const validator = {
    likes: [
      body('pageId').isString(),
      body('bool').isBoolean(),
    ],
    export: [
      query('revisionId').isString(),
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
  router.get('/export/:pageId', validator.export, async(req, res) => {
    try {
      const { pageId } = req.params;
      const { format, revisionId = null } = req.query;

      if (pageId == null) {
        return res.apiv3Err(new ErrorV3('Should provided pageId or both pageId and revisionId.'));
      }

      const isPageExist = await Page.count({ _id: pageId }) > 0;
      if (!isPageExist) {
        return res.apiv3Err(new ErrorV3(`Page ${pageId} is not exist.`), 404);
      }

      const isAccessible = await Page.isAccessiblePageByViewer(pageId, req.user);
      if (!isAccessible) {
        return res.apiv3Err(new ErrorV3(`Haven't the right to see the page ${pageId}.`), 403);
      }


      let revisionIdForFind;
      if (revisionId == null) {
        const Page = crowi.model('Page');
        const page = await Page.findByIdAndViewer(pageId);
        revisionIdForFind = page.revision;
      }
      else {
        revisionIdForFind = revisionId;
      }

      const Revision = crowi.model('Revision');
      const revision = await Revision.findById(revisionIdForFind);

      const markdown = revision.body;

      const fileName = pageId != null ? pageId : revisionId;
      return exportService.getReadStreamAsFileFromString(res, markdown, fileName, format);
    }
    catch (err) {
      logger.error('Failed to get markdown', err);
      return res.apiv3Err(err, 500);
    }
  });

  return router;
};
