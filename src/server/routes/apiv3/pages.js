const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:pages'); // eslint-disable-line no-unused-vars

const express = require('express');
const mongoose = require('mongoose');

const Page = mongoose.model('Page');
const { PageQueryBuilder } = Page;


const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: Pages
 */
module.exports = (crowi) => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi, true);
  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const csrf = require('../../middlewares/csrf')(crowi);

  const Page = crowi.model('Page');

  function validateCrowi() {
    if (crowi == null) {
      throw new Error('"crowi" is null. Init User model with "crowi" argument first.');
    }
  }

  async function addConditionToFilteringByViewerToEdit(builder, user) {
    validateCrowi();

    // determine UserGroup condition
    let userGroups = null;
    if (user != null) {
      const UserGroupRelation = crowi.model('UserGroupRelation');
      userGroups = await UserGroupRelation.findAllUserGroupIdsRelatedToUser(user);
    }

    return builder.addConditionToFilteringByViewer(user, userGroups, false, false, false);
  }

  /**
   * @swagger
   *
   *    /pages/recent:
   *      get:
   *        tags: [Pages]
   *        description: Get recently updated pages
   *        responses:
   *          200:
   *            description: Return pages recently updated
   *
   */
  router.get('/recent', loginRequired, async(req, res) => {
    const limit = 20;
    const offset = parseInt(req.query.offset) || 0;

    const queryOptions = {
      offset,
      limit,
      includeTrashed: false,
      isRegExpEscapedFromPath: true,
      sort: 'updatedAt',
      desc: -1,
    };

    try {
      const result = await Page.findListWithDescendants('/', req.user, queryOptions);
      if (result.pages.length > limit) {
        result.pages.pop();
      }

      return res.apiv3(result);
    }
    catch (err) {
      res.code = 'unknown';
      logger.error('Failed to get recent pages', err);
      return res.apiv3Err(err, 500);
    }
  });

  /**
  * @swagger
  *
  *    /pages/empty-trash:
  *      delete:
  *        tags: [Pages]
  *        description: empty trash
  *        responses:
  *          200:
  *            description: Succeeded to remove all trash pages
  */
  router.delete('/empty-trash', loginRequired, adminRequired, csrf, async(req, res) => {
    try {
      const pages = await Page.completelyDeletePageRecursively('/trash', req.user);
      return res.apiv3({ pages });
    }
    catch (err) {
      res.code = 'unknown';
      logger.error('Failed to delete trash pages', err);
      return res.apiv3Err(err, 500);
    }
  });

  router.get('/duplicate', accessTokenParser, loginRequired, async(req, res) => {
    const { path } = req.query;
    const builder = new PageQueryBuilder(this.find());

    // const result = await Page.findListWithDescendants(path, req.user);
    // const pages = result.pages;
    // const duplicatePaths = pages.map(element => element.path);
    // console.log(duplicatePaths);
    // console.log(req.user);

    await addConditionToFilteringByViewerToEdit(builder);
    console.log(builder);
    return res.apiv3({ path });
  });

  return router;
};
