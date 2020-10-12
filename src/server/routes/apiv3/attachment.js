const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:attachment'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();
const { query } = require('express-validator');

const ErrorV3 = require('../../models/vo/error-apiv3');

/**
 * @swagger
 *  tags:
 *    name: Attachment
 */

module.exports = (crowi) => {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi);
  const Page = crowi.model('Page');
  const User = crowi.model('User');
  const Attachment = crowi.model('Attachment');
  const apiV3FormValidator = require('../../middlewares/apiv3-form-validator')(crowi);

  const validator = {
    retrieveAttachments: [
      query('pageId').isMongoId().withMessage('pageId is required'),
      query('pageLimitationS').custom((value) => {
        if (value == null) {
          return 10;
        }
        if (value > 100) {
          throw new Error('You should set less than 100 or not to set pageLimitationS.');
        }
        return value;
      }),
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

    const pageLimitationS = req.query.pageLimitationS || await crowi.configManager.getConfig('crowi', 'customize:showPageLimitationS') || 10;
    const selectedPage = req.query.selectedPage;
    const offset = (selectedPage - 1) * pageLimitationS;

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
          limit: pageLimitationS,
          offset,
          populate: {
            path: 'creator',
            select: User.USER_PUBLIC_FIELDS,
          },
        },
      );
      paginateResult.docs.forEach((doc) => {
        if (doc.creator != null && doc.creator instanceof User) {
          doc.creator = doc.creator.toObject();
        }
      });

      return res.apiv3({ paginateResult });
    }
    catch (err) {
      logger.error('Attachment not found', err);
      return res.apiv3Err(err, 500);
    }
  });

  return router;
};
