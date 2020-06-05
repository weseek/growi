// TODO remove this setting after implemented all
/* eslint-disable no-unused-vars */
const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:share-links');

const express = require('express');

const router = express.Router();

const { body } = require('express-validator/check');

const ErrorV3 = require('../../models/vo/error-apiv3');

/**
 * @swagger
 *  tags:
 *    name: ShareLinks
 */

module.exports = (crowi) => {
  const loginRequired = require('../../middleware/login-required')(crowi);
  const csrf = require('../../middleware/csrf')(crowi);

  const { ShareLink } = crowi.models;

  const { ApiV3FormValidator } = crowi.middlewares;

  // TDOO write swagger
  router.get('/', /* loginRequired, csrf, */ ApiV3FormValidator, async(req, res) => {
    const { pageId } = req.query;
    try {
      const paginateResult = await Page.paginate(
        {
          _id: { $in: pageId },
        },
      );
      return res.apiv3({ paginateResult });
    }
    catch (err) {
      const msg = 'Error occurred in get share link';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'get-shareLink-failed'));
    }
  });


  // TDOO write swagger
  router.post('/', loginRequired, async(req, res) => {
    const { pageId } = req.body;
    // TODO GW-2609 publish the share link
  });

  // TDOO write swagger
  router.delete('/all', loginRequired, async(req, res) => {
    const { pageId } = req.body;
    // TODO GW-2694 Delete all share links
  });

  /**
  * @swagger
  *
  *    /share-links/{id}:
  *      delete:
  *        tags: [ShareLinks]
  *        description: delete one share link related one page
  *        parameters:
  *          - name: id
  *            in: path
  *            required: true
  *            description: id of share link
  *            schema:
  *              type: string
  *        responses:
  *          200:
  *            description: Succeeded to delete one share link
  */
  router.delete('/:id', loginRequired, csrf, async(req, res) => {
    const { id } = req.params;

    try {
      const deletedShareLink = await ShareLink.findOneAndRemove({ _id: id });
      return res.apiv3(deletedShareLink);
    }
    catch (err) {
      const msg = 'Error occurred in delete share link';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'delete-shareLink-failed'));
    }

  });


  return router;
};
