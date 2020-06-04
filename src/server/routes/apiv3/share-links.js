// TODO remove this setting after implemented all
/* eslint-disable no-unused-vars */
const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:share-links');

const express = require('express');

const router = express.Router();

const { body, query } = require('express-validator/check');

const ErrorV3 = require('../../models/vo/error-apiv3');

const validator = {};

const today = new Date();

/**
 * @swagger
 *  tags:
 *    name: ShareLinks
 */

module.exports = (crowi) => {
  const loginRequired = require('../../middleware/login-required')(crowi);
  const csrf = require('../../middleware/csrf')(crowi);

  const ShareLink = crowi.model('ShareLink');

  // TDOO write swagger
  router.get('/', loginRequired, async(req, res) => {
    const { pageId } = req.query;
    // TODO GW-2616 get all share links associated with the page
  });

  validator.shareLinkStatus = [
    // validate page id is not empty.
    body('pageId').not().isEmpty(),

    // validate expireation date is not empty, is not before today and is date.
    body('expiration').not().isEmpty().isBefore(today.toString),

    // validate the length of description is max 100.
    body('description').isLength({ min: 0, max: 100 }),
  ];

  /**
   * @swagger
   *
   *  paths:
   *    /share-links/:
   *      post:
   *        tags: [ShareLinks]
   *        description: Create new share link
   */

  router.post('/', /* loginRequired, validator.shareLinkStatus, */ async(req, res) => {
    const { pageId, expiration, description } = req.body;
    const ShareLink = crowi.model('ShareLink');

    try {
      const postedShareLink = await ShareLink.create({ relatedPage: pageId, expiration_date: expiration, desc: description });
      return res.apiv3(postedShareLink);
    }
    catch (err) {
      const msg = 'Error occured in post share link';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'post-shareLink-failed'));
    }
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
