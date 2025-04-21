import { body } from 'express-validator';
import mongoose from 'mongoose';

import loggerFactory from '~/utils/logger';

import { GlobalNotificationSettingEvent } from '../models/GlobalNotificationSetting';
import { PathAlreadyExistsError } from '../models/errors';
import PageTagRelation from '../models/page-tag-relation';
import UpdatePost from '../models/update-post';

/**
 * @swagger
 *  tags:
 *    name: Pages
 */

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *
 *      UpdatePost:
 *        description: UpdatePost
 *        type: object
 *        properties:
 *          _id:
 *            type: string
 *            description: update post ID
 *            example: 5e0734e472560e001761fa68
 *          __v:
 *            type: number
 *            description: DB record version
 *            example: 0
 *          pathPattern:
 *            type: string
 *            description: path pattern
 *            example: /test
 *          patternPrefix:
 *            type: string
 *            description: patternPrefix prefix
 *            example: /
 *          patternPrefix2:
 *            type: string
 *            description: path
 *            example: test
 *          channel:
 *            type: string
 *            description: channel
 *            example: general
 *          provider:
 *            type: string
 *            description: provider
 *            enum:
 *              - slack
 *            example: slack
 *          creator:
 *            $ref: '#/components/schemas/User'
 *          createdAt:
 *            type: string
 *            description: date created at
 *            example: 2010-01-01T00:00:00.000Z
 */

/* eslint-disable no-use-before-define */
/** @param {import('~/server/crowi').default} crowi Crowi instance */
module.exports = (crowi, app) => {
  const logger = loggerFactory('growi:routes:page');

  const { pagePathUtils } = require('@growi/core/dist/utils');

  /** @type {import('../models/page').PageModel} */
  const Page = crowi.model('Page');

  const PageRedirect = mongoose.model('PageRedirect');

  const ApiResponse = require('../util/apiResponse');

  const globalNotificationService = crowi.getGlobalNotificationService();

  const actions = {};

  // async function showPageForPresentation(req, res, next) {
  //   const id = req.params.id;
  //   const { revisionId } = req.query;

  //   let page = await Page.findByIdAndViewer(id, req.user, null, true, true);

  //   if (page == null) {
  //     next();
  //   }

  //   // empty page
  //   if (page.isEmpty) {
  //     // redirect to page (path) url
  //     const url = new URL('https://dummy.origin');
  //     url.pathname = page.path;
  //     Object.entries(req.query).forEach(([key, value], i) => {
  //       url.searchParams.append(key, value);
  //     });
  //     return res.safeRedirect(urljoin(url.pathname, url.search));

  //   }

  //   const renderVars = {};

  //   // populate
  //   page = await page.populateDataToMakePresentation(revisionId);

  //   if (page != null) {
  //     addRenderVarsForPresentation(renderVars, page);
  //   }

  //   return res.render('page_presentation', renderVars);
  // }


  /**
   * switch action
   *   - presentation mode
   *   - by behaviorType
   */
  // actions.showPage = async function(req, res, next) {
  //   // presentation mode
  //   if (req.query.presentation) {
  //     return showPageForPresentation(req, res, next);
  //   }
  //   // delegate to showPageForGrowiBehavior
  //   return showPageForGrowiBehavior(req, res, next);
  // };


  const api = {};
  const validator = {};

  actions.api = api;
  actions.validator = validator;

  /**
   * @swagger
   *
   *    /pages.getPageTag:
   *      get:
   *        tags: [Pages]
   *        operationId: getPageTag
   *        summary: /pages.getPageTag
   *        description: Get page tag
   *        parameters:
   *          - in: query
   *            name: pageId
   *            schema:
   *              $ref: '#/components/schemas/Page/properties/_id'
   *        responses:
   *          200:
   *            description: Succeeded to get page tags.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *                    tags:
   *                      $ref: '#/components/schemas/Tags'
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
  /**
   * @api {get} /pages.getPageTag get page tags
   * @apiName GetPageTag
   * @apiGroup Page
   *
   * @apiParam {String} pageId
   */
  api.getPageTag = async(req, res) => {
    const result = {};
    try {
      result.tags = await PageTagRelation.listTagNamesByPage(req.query.pageId);
    }
    catch (err) {
      return res.json(ApiResponse.error(err));
    }
    return res.json(ApiResponse.success(result));
  };

  /**
   * @swagger
   *
   *    /pages.updatePost:
   *      get:
   *        tags: [Pages]
   *        operationId: getUpdatePostPage
   *        summary: /pages.updatePost
   *        description: Get UpdatePost setting list
   *        parameters:
   *          - in: query
   *            name: path
   *            schema:
   *              $ref: '#/components/schemas/Page/properties/path'
   *        responses:
   *          200:
   *            description: Succeeded to get UpdatePost setting list.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *                    updatePost:
   *                      $ref: '#/components/schemas/UpdatePost'
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
  /**
   * @api {get} /pages.updatePost
   * @apiName Get UpdatePost setting list
   * @apiGroup Page
   *
   * @apiParam {String} path
   */
  api.getUpdatePost = (req, res) => {
    const path = req.query.path;

    if (!path) {
      return res.json(ApiResponse.error({}));
    }

    UpdatePost.findSettingsByPath(path)
      .then((data) => {
        // biome-ignore lint/style/noParameterAssign: ignore
        data = data.map((e) => {
          return e.channel;
        });
        logger.debug('Found updatePost data', data);
        const result = { updatePost: data };
        return res.json(ApiResponse.success(result));
      })
      .catch((err) => {
        logger.debug('Error occured while get setting', err);
        return res.json(ApiResponse.error({}));
      });
  };

  validator.remove = [
    body('completely')
      .custom(v => v === 'true' || v === true || v == null)
      .withMessage('The body property "completely" must be "true" or true. (Omit param for false)'),
    body('recursively')
      .custom(v => v === 'true' || v === true || v == null)
      .withMessage('The body property "recursively" must be "true" or true. (Omit param for false)'),
  ];

  /**
   * @api {post} /pages.remove Remove page
   * @apiName RemovePage
   * @apiGroup Page
   *
   * @apiParam {String} page_id Page Id.
   * @apiParam {String} revision_id
   */
  api.remove = async(req, res) => {
    const pageId = req.body.page_id;
    const previousRevision = req.body.revision_id || null;

    const { recursively: isRecursively, completely: isCompletely } = req.body;

    const options = {};

    const activityParameters = {
      ip: req.ip,
      endpoint: req.originalUrl,
    };

    /** @type {import('../models/page').PageDocument | undefined} */
    const page = await Page.findByIdAndViewer(pageId, req.user, null, true);

    if (page == null) {
      return res.json(ApiResponse.error(`Page '${pageId}' is not found or forbidden`, 'notfound_or_forbidden'));
    }

    if (page.isEmpty && !isRecursively) {
      return res.json(ApiResponse.error('Empty pages cannot be single deleted', 'single_deletion_empty_pages'));
    }

    const creatorId = await crowi.pageService.getCreatorIdForCanDelete(page);

    logger.debug('Delete page', page._id, page.path);

    try {
      if (isCompletely) {
        const userRelatedGroups = await crowi.pageGrantService.getUserRelatedGroups(req.user);
        const canDeleteCompletely = crowi.pageService.canDeleteCompletely(page, creatorId, req.user, isRecursively, userRelatedGroups);
        if (!canDeleteCompletely) {
          return res.json(ApiResponse.error('You cannot delete this page completely', 'complete_deletion_not_allowed_for_user'));
        }

        if (pagePathUtils.isUsersHomepage(page.path)) {
          if (!crowi.pageService.canDeleteUserHomepageByConfig()) {
            return res.json(ApiResponse.error('Could not delete user homepage'));
          }
          if (!await crowi.pageService.isUsersHomepageOwnerAbsent(page.path)) {
            return res.json(ApiResponse.error('Could not delete user homepage'));
          }
        }

        await crowi.pageService.deleteCompletely(page, req.user, options, isRecursively, false, activityParameters);
      }
      else {
        // behave like not found
        const notRecursivelyAndEmpty = page.isEmpty && !isRecursively;
        if (notRecursivelyAndEmpty) {
          return res.json(ApiResponse.error(`Page '${pageId}' is not found.`, 'notfound'));
        }

        if (!page.isEmpty && !page.isUpdatable(previousRevision)) {
          return res.json(ApiResponse.error('Someone could update this page, so couldn\'t delete.', 'outdated'));
        }

        if (!crowi.pageService.canDelete(page, creatorId, req.user, isRecursively)) {
          return res.json(ApiResponse.error('You cannot delete this page', 'user_not_admin'));
        }

        if (pagePathUtils.isUsersHomepage(page.path)) {
          if (!crowi.pageService.canDeleteUserHomepageByConfig()) {
            return res.json(ApiResponse.error('Could not delete user homepage'));
          }
          if (!await crowi.pageService.isUsersHomepageOwnerAbsent(page.path)) {
            return res.json(ApiResponse.error('Could not delete user homepage'));
          }
        }

        await crowi.pageService.deletePage(page, req.user, options, isRecursively, activityParameters);
      }
    }
    catch (err) {
      logger.error('Error occured while get setting', err);
      return res.json(ApiResponse.error('Failed to delete page.', err.message));
    }

    logger.debug('Page deleted', page.path);
    const result = {};
    result.path = page.path;
    result.isRecursively = isRecursively;
    result.isCompletely = isCompletely;

    res.json(ApiResponse.success(result));

    try {
      // global notification
      await globalNotificationService.fire(GlobalNotificationSettingEvent.PAGE_DELETE, page, req.user);
    }
    catch (err) {
      logger.error('Delete notification failed', err);
    }
  };

  validator.revertRemove = [
    body('recursively')
      .optional()
      .custom(v => v === 'true' || v === true || v == null)
      .withMessage('The body property "recursively" must be "true" or true. (Omit param for false)'),
  ];

  /**
   * @api {post} /pages.revertRemove Revert removed page
   * @apiName RevertRemovePage
   * @apiGroup Page
   *
   * @apiParam {String} page_id Page Id.
   */
  api.revertRemove = async(req, res, options) => {
    const pageId = req.body.page_id;

    // get recursively flag
    const isRecursively = req.body.recursively;

    const activityParameters = {
      ip: req.ip,
      endpoint: req.originalUrl,
    };

    let page;
    try {
      page = await Page.findByIdAndViewer(pageId, req.user);
      if (page == null) {
        throw new Error(`Page '${pageId}' is not found or forbidden`, 'notfound_or_forbidden');
      }
      page = await crowi.pageService.revertDeletedPage(page, req.user, {}, isRecursively, activityParameters);
    }
    catch (err) {
      if (err instanceof PathAlreadyExistsError) {
        logger.error('Path already exists', err);
        return res.json(ApiResponse.error(err, 'already_exists', err.targetPath));
      }
      logger.error('Error occured while get setting', err);
      return res.json(ApiResponse.error(err));
    }

    const result = {};
    result.page = page; // TODO consider to use serializePageSecurely method -- 2018.08.06 Yuki Takei

    return res.json(ApiResponse.success(result));
  };

  /**
   * @api {post} /pages.unlink Remove the redirecting page
   * @apiName UnlinkPage
   * @apiGroup Page
   *
   * @apiParam {String} page_id Page Id.
   * @apiParam {String} revision_id
   */
  api.unlink = async(req, res) => {
    const path = req.body.path;

    try {
      await PageRedirect.removePageRedirectsByToPath(path);
      logger.debug('Redirect Page deleted', path);
    }
    catch (err) {
      logger.error('Error occured while get setting', err);
      return res.json(ApiResponse.error('Failed to delete redirect page.'));
    }

    const result = { path };
    return res.json(ApiResponse.success(result));
  };

  return actions;
};
