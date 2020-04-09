const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:page'); // eslint-disable-line no-unused-vars

const express = require('express');
// const { body } = require('express-validator');

const router = express.Router();

// const ErrorV3 = require('../../models/vo/error-apiv3');

/**
 * @swagger
 *  tags:
 *    name: Page
 */
module.exports = (crowi) => {
  const accessTokenParser = require('../../middleware/access-token-parser')(crowi);
  const loginRequired = require('../../middleware/login-required')(crowi);
  const csrf = require('../../middleware/csrf')(crowi);

  const globalNotificationService = crowi.getGlobalNotificationService();
  const { Page, GlobalNotificationSetting } = crowi.models;
  // const { ApiV3FormValidator } = crowi.middlewares;

  // TODO swagger
  router.put('/likes', accessTokenParser, loginRequired, csrf, async(req, res) => {
    const { pageId, isLiked } = req.body;

    let page;
    try {
      page = await Page.findByIdAndViewer(pageId, req.user);
      if (page == null) {
        return res.apiv3Err(`Page '${pageId}' is not found or forbidden`);
      }
      if (isLiked) {
        page = await page.unlike(req.user);
      }
      else {
        page = await page.like(req.user);
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

  return router;
};
