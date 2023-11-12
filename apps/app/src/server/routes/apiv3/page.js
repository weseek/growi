import path from 'path';

import {
  AllSubscriptionStatusType, SubscriptionStatusType,
} from '@growi/core';
import { ErrorV3 } from '@growi/core/dist/models';
import { convertToNewAffiliationPath } from '@growi/core/dist/utils/page-path-utils';
import sanitize from 'sanitize-filename';


import { SupportedAction, SupportedTargetModel } from '~/interfaces/activity';
import { generateAddActivityMiddleware } from '~/server/middlewares/add-activity';
import { apiV3FormValidator } from '~/server/middlewares/apiv3-form-validator';
import { excludeReadOnlyUser } from '~/server/middlewares/exclude-read-only-user';
import Subscription from '~/server/models/subscription';
import UserGroup from '~/server/models/user-group';
import { generateDefaultPreNotify } from '~/server/service/preNotify';
import loggerFactory from '~/utils/logger';


const logger = loggerFactory('growi:routes:apiv3:page'); // eslint-disable-line no-unused-vars

const express = require('express');
const { body, query, param } = require('express-validator');

const router = express.Router();

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
 *
 *      PageInfo:
 *        description: PageInfo
 *        type: object
 *        required:
 *          - sumOfLikers
 *          - likerIds
 *          - sumOfSeenUsers
 *          - seenUserIds
 *        properties:
 *          isLiked:
 *            type: boolean
 *            description: Whether the page is liked by the logged in user
 *          sumOfLikers:
 *            type: number
 *            description: Number of users who have liked the page
 *          likerIds:
 *            type: array
 *            items:
 *              type: string
 *            description: Ids of users who have liked the page
 *            example: ["5e07345972560e001761fa63"]
 *          sumOfSeenUsers:
 *            type: number
 *            description: Number of users who have seen the page
 *          seenUserIds:
 *            type: array
 *            items:
 *              type: string
 *            description: Ids of users who have seen the page
 *            example: ["5e07345972560e001761fa63"]
 *
 *      PageParams:
 *        description: PageParams
 *        type: object
 *        required:
 *          - pageId
 *        properties:
 *          pageId:
 *            type: string
 *            description: page ID
 *            example: 5e07345972560e001761fa63
 */
module.exports = (crowi) => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi, true);
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);
  const certifySharedPage = require('../../middlewares/certify-shared-page')(crowi);
  const addActivity = generateAddActivityMiddleware(crowi);

  const configManager = crowi.configManager;

  const globalNotificationService = crowi.getGlobalNotificationService();
  const { Page, GlobalNotificationSetting } = crowi.models;
  const { pageService, exportService } = crowi;

  const activityEvent = crowi.event('activity');

  const validator = {
    getPage: [
      query('pageId').optional().isString(),
      query('path').optional().isString(),
      query('findAll').optional().isBoolean(),
    ],
    likes: [
      body('pageId').isString(),
      body('bool').isBoolean(),
    ],
    info: [
      query('pageId').isMongoId().withMessage('pageId is required'),
    ],
    isGrantNormalized: [
      query('pageId').isMongoId().withMessage('pageId is required'),
    ],
    applicableGrant: [
      query('pageId').isMongoId().withMessage('pageId is required'),
    ],
    updateGrant: [
      param('pageId').isMongoId().withMessage('pageId is required'),
      body('grant').isInt().withMessage('grant is required'),
      body('grantedGroup').optional().isMongoId().withMessage('grantedGroup must be a mongo id'),
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
    exist: [
      query('fromPath').isString(),
      query('toPath').isString(),
    ],
    subscribe: [
      body('pageId').isString(),
      body('status').isIn(AllSubscriptionStatusType),
    ],
    subscribeStatus: [
      query('pageId').isString(),
    ],
    contentWidth: [
      body('expandContentWidth').isBoolean(),
    ],
  };

  /**
   * @swagger
   *
   *    /page:
   *      get:
   *        tags: [Page]
   *        operationId: getPage
   *        summary: /page
   *        description: get page by pagePath or pageId
   *        parameters:
   *          - name: pageId
   *            in: query
   *            description: page id
   *            schema:
   *              $ref: '#/components/schemas/Page/properties/_id'
   *          - name: path
   *            in: query
   *            description: page path
   *            schema:
   *              $ref: '#/components/schemas/Page/properties/path'
   *        responses:
   *          200:
   *            description: Page data
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/Page'
   */
  router.get('/', certifySharedPage, accessTokenParser, loginRequired, validator.getPage, apiV3FormValidator, async(req, res) => {
    const { user } = req;
    const {
      pageId, path, findAll, revisionId,
    } = req.query;

    if (pageId == null && path == null) {
      return res.apiv3Err(new ErrorV3('Either parameter of path or pageId is required.', 'invalid-request'));
    }

    let page;
    let pages;
    try {
      if (pageId != null) { // prioritized
        page = await Page.findByIdAndViewer(pageId, user);
      }
      else if (!findAll) {
        page = await Page.findByPathAndViewer(path, user, null, true);
      }
      else {
        pages = await Page.findByPathAndViewer(path, user, null, false);
      }
    }
    catch (err) {
      logger.error('get-page-failed', err);
      return res.apiv3Err(err, 500);
    }

    if (page == null && (pages == null || pages.length === 0)) {
      return res.apiv3Err('Page is not found', 404);
    }

    if (page != null) {
      try {
        page.initLatestRevisionField(revisionId);

        // populate
        page = await page.populateDataToShowRevision();
      }
      catch (err) {
        logger.error('populate-page-failed', err);
        return res.apiv3Err(err, 500);
      }
    }

    return res.apiv3({ page, pages });
  });

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
  router.put('/likes', accessTokenParser, loginRequiredStrictly, addActivity, validator.likes, apiV3FormValidator, async(req, res) => {
    const { pageId, bool: isLiked } = req.body;

    let page;
    try {
      page = await Page.findByIdAndViewer(pageId, req.user);
      if (page == null) {
        return res.apiv3Err(`Page '${pageId}' is not found or forbidden`);
      }

      if (isLiked) {
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

    const result = { page };
    result.seenUser = page.seenUsers;

    const parameters = {
      targetModel: SupportedTargetModel.MODEL_PAGE,
      target: page,
      action: isLiked ? SupportedAction.ACTION_PAGE_LIKE : SupportedAction.ACTION_PAGE_UNLIKE,
    };

    activityEvent.emit('update', res.locals.activity._id, parameters, page, generateDefaultPreNotify);


    res.apiv3({ result });

    if (isLiked) {
      try {
        // global notification
        await globalNotificationService.fire(GlobalNotificationSetting.EVENT.PAGE_LIKE, page, req.user);
      }
      catch (err) {
        logger.error('Like notification failed', err);
      }
    }
  });

  /**
   * @swagger
   *
   *    /page/info:
   *      get:
   *        tags: [Page]
   *        summary: /page/info
   *        description: Retrieve current page info
   *        operationId: getPageInfo
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/PageParams'
   *        responses:
   *          200:
   *            description: Successfully retrieved current page info.
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/PageInfo'
   *          500:
   *            description: Internal server error.
   */
  router.get('/info', certifySharedPage, loginRequired, validator.info, apiV3FormValidator, async(req, res) => {
    const { user, isSharedPage } = req;
    const { pageId } = req.query;

    try {
      const pageWithMeta = await pageService.findPageAndMetaDataByViewer(pageId, null, user, true, isSharedPage);

      if (pageWithMeta == null) {
        return res.apiv3Err(`Page '${pageId}' is not found or forbidden`);
      }

      return res.apiv3(pageWithMeta.meta);
    }
    catch (err) {
      logger.error('get-page-info', err);
      return res.apiv3Err(err, 500);
    }

  });

  /**
   * @swagger
   *
   *    /page/is-grant-normalized:
   *      get:
   *        tags: [Page]
   *        summary: /page/info
   *        description: Retrieve current page's isGrantNormalized value
   *        operationId: getIsGrantNormalized
   *        parameters:
   *          - name: pageId
   *            in: query
   *            description: page id
   *            schema:
   *              $ref: '#/components/schemas/Page/properties/_id'
   *        responses:
   *          200:
   *            description: Successfully retrieved current isGrantNormalized.
   *            content:
   *              application/json:
   *                schema:
   *                  type: object
   *                  properties:
   *                    isGrantNormalized:
   *                      type: boolean
   *          400:
   *            description: Bad request. Page is unreachable or empty.
   *          500:
   *            description: Internal server error.
   */
  router.get('/is-grant-normalized', loginRequiredStrictly, validator.isGrantNormalized, apiV3FormValidator, async(req, res) => {
    const { pageId } = req.query;

    const Page = crowi.model('Page');
    const page = await Page.findByIdAndViewer(pageId, req.user, null, false);

    if (page == null) {
      // Empty page should not be related to grant API
      return res.apiv3Err(new ErrorV3('Page is unreachable or empty.', 'page_unreachable_or_empty'), 400);
    }

    const {
      path, grant, grantedUsers, grantedGroup,
    } = page;

    let isGrantNormalized;
    try {
      isGrantNormalized = await crowi.pageGrantService.isGrantNormalized(req.user, path, grant, grantedUsers, grantedGroup, false, false);
    }
    catch (err) {
      logger.error('Error occurred while processing isGrantNormalized.', err);
      return res.apiv3Err(err, 500);
    }

    const currentPageUserGroup = await UserGroup.findOne({ _id: grantedGroup });
    const currentPageGrant = {
      grant,
      grantedGroup: currentPageUserGroup != null
        ? {
          id: currentPageUserGroup._id,
          name: currentPageUserGroup.name,
        }
        : null,
    };

    // page doesn't have parent page
    if (page.parent == null) {
      const grantData = {
        isForbidden: false,
        currentPageGrant,
        parentPageGrant: null,
      };
      return res.apiv3({ isGrantNormalized, grantData });
    }

    const parentPage = await Page.findByIdAndViewer(page.parent, req.user, null, false);

    // user isn't allowed to see parent's grant
    if (parentPage == null) {
      const grantData = {
        isForbidden: true,
        currentPageGrant,
        parentPageGrant: null,
      };
      return res.apiv3({ isGrantNormalized, grantData });
    }

    const parentPageUserGroup = await UserGroup.findOne({ _id: parentPage.grantedGroup });
    const parentPageGrant = {
      grant: parentPage.grant,
      grantedGroup: parentPageUserGroup != null
        ? {
          id: parentPageUserGroup._id,
          name: parentPageUserGroup.name,
        }
        : null,
    };

    const grantData = {
      isForbidden: false,
      currentPageGrant,
      parentPageGrant,
    };

    return res.apiv3({ isGrantNormalized, grantData });
  });

  router.get('/applicable-grant', loginRequiredStrictly, validator.applicableGrant, apiV3FormValidator, async(req, res) => {
    const { pageId } = req.query;

    const Page = crowi.model('Page');
    const page = await Page.findByIdAndViewer(pageId, req.user, null);

    if (page == null) {
      // Empty page should not be related to grant API
      return res.apiv3Err(new ErrorV3('Page is unreachable or empty.', 'page_unreachable_or_empty'), 400);
    }

    let data;
    try {
      data = await crowi.pageGrantService.calcApplicableGrantData(page, req.user);
    }
    catch (err) {
      logger.error('Error occurred while processing calcApplicableGrantData.', err);
      return res.apiv3Err(err, 500);
    }

    return res.apiv3(data);
  });

  router.put('/:pageId/grant', loginRequiredStrictly, excludeReadOnlyUser, validator.updateGrant, apiV3FormValidator, async(req, res) => {
    const { pageId } = req.params;
    const { grant, grantedGroup } = req.body;

    const Page = crowi.model('Page');

    const page = await Page.findByIdAndViewer(pageId, req.user, null, false);

    if (page == null) {
      // Empty page should not be related to grant API
      return res.apiv3Err(new ErrorV3('Page is unreachable or empty.', 'page_unreachable_or_empty'), 400);
    }

    let data;
    try {
      const shouldUseV4Process = false;
      const grantData = { grant, grantedGroup };
      data = await this.crowi.pageService.updateGrant(page, req.user, grantData, shouldUseV4Process);
    }
    catch (err) {
      logger.error('Error occurred while processing calcApplicableGrantData.', err);
      return res.apiv3Err(err, 500);
    }

    return res.apiv3(data);
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
    let pagePath;

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
      pagePath = page.path;

      // Error if pageId and revison's pageIds do not match
      if (page._id.toString() !== revision.pageId.toString()) {
        return res.apiv3Err(new ErrorV3("Haven't the right to see the page."), 403);
      }
    }
    catch (err) {
      logger.error('Failed to get page data', err);
      return res.apiv3Err(err, 500);
    }

    // replace forbidden characters to '_'
    // refer to https://kb.acronis.com/node/56475?ckattempt=1
    let fileName = sanitize(path.basename(pagePath), { replacement: '_' });


    // replace root page name to '_top'
    if (fileName === '') {
      fileName = '_top';
    }

    let stream;

    try {
      stream = exportService.getReadStreamFromRevision(revision, format);
    }
    catch (err) {
      logger.error('Failed to create readStream', err);
      return res.apiv3Err(err, 500);
    }

    res.set({
      'Content-Disposition': `attachment;filename*=UTF-8''${encodeURIComponent(fileName)}.${format}`,
    });

    const parameters = {
      ip:  req.ip,
      endpoint: req.originalUrl,
      action: SupportedAction.ACTION_PAGE_EXPORT,
      user: req.user?._id,
      snapshot: {
        username: req.user?.username,
      },
    };
    await crowi.activityService.createActivity(parameters);

    return stream.pipe(res);
  });

  /**
   * @swagger
   *
   *    /page/exist-paths:
   *      get:
   *        tags: [Page]
   *        summary: /page/exist-paths
   *        description: Get already exist paths
   *        operationId: getAlreadyExistPaths
   *        parameters:
   *          - name: fromPath
   *            in: query
   *            description: old parent path
   *            schema:
   *              type: string
   *          - name: toPath
   *            in: query
   *            description: new parent path
   *            schema:
   *              type: string
   *        responses:
   *          200:
   *            description: Succeeded to retrieve pages.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    existPaths:
   *                      type: object
   *                      description: Paths are already exist in DB
   *          500:
   *            description: Internal server error.
   */
  router.get('/exist-paths', loginRequired, validator.exist, apiV3FormValidator, async(req, res) => {
    const { fromPath, toPath } = req.query;

    try {
      const fromPage = await Page.findByPath(fromPath, true);
      if (fromPage == null) {
        return res.apiv3Err(new ErrorV3('fromPage is not exist', 'from-page-is-not-exist'), 400);
      }

      const fromPageDescendants = await Page.findManageableListWithDescendants(fromPage, req.user, {}, true);

      const toPathDescendantsArray = fromPageDescendants.map((subordinatedPage) => {
        return convertToNewAffiliationPath(fromPath, toPath, subordinatedPage.path);
      });

      const existPages = await Page.findListByPathsArray(toPathDescendantsArray);
      const existPaths = existPages.map(page => page.path);

      return res.apiv3({ existPaths });

    }
    catch (err) {
      logger.error('Failed to get exist path', err);
      return res.apiv3Err(err, 500);
    }

  });

  /**
   * @swagger
   *
   *    /page/subscribe:
   *      put:
   *        tags: [Page]
   *        summary: /page/subscribe
   *        description: Update subscription status
   *        operationId: updateSubscriptionStatus
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  pageId:
   *                    $ref: '#/components/schemas/Page/properties/_id'
   *        responses:
   *          200:
   *            description: Succeeded to update subscription status.
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/Page'
   *          500:
   *            description: Internal server error.
   */
  router.put('/subscribe', accessTokenParser, loginRequiredStrictly, addActivity, validator.subscribe, apiV3FormValidator, async(req, res) => {
    const { pageId, status } = req.body;
    const userId = req.user._id;

    try {
      const subscription = await Subscription.subscribeByPageId(userId, pageId, status);

      const parameters = {};
      if (SubscriptionStatusType.SUBSCRIBE === status) {
        Object.assign(parameters, { action: SupportedAction.ACTION_PAGE_SUBSCRIBE });
      }
      else if (SubscriptionStatusType.UNSUBSCRIBE === status) {
        Object.assign(parameters, { action: SupportedAction.ACTION_PAGE_UNSUBSCRIBE });
      }
      if ('action' in parameters) {
        activityEvent.emit('update', res.locals.activity._id, parameters);
      }

      return res.apiv3({ subscription });
    }
    catch (err) {
      logger.error('Failed to update subscribe status', err);
      return res.apiv3Err(err, 500);
    }
  });


  router.put('/:pageId/content-width', accessTokenParser, loginRequiredStrictly, excludeReadOnlyUser,
    validator.contentWidth, apiV3FormValidator, async(req, res) => {
      const { pageId } = req.params;
      const { expandContentWidth } = req.body;

      const isContainerFluidBySystem = configManager.getConfig('crowi', 'customize:isContainerFluid');

      try {
        const updateQuery = expandContentWidth === isContainerFluidBySystem
          ? { $unset: { expandContentWidth } } // remove if the specified value is the same to the system's one
          : { $set: { expandContentWidth } };

        const page = await Page.updateOne({ _id: pageId }, updateQuery);
        return res.apiv3({ page });
      }
      catch (err) {
        logger.error('update-content-width-failed', err);
        return res.apiv3Err(err, 500);
      }
    });

  return router;
};
