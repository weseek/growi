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
  const { ApiV3FormValidator } = crowi.middlewares;
  const ShareLink = crowi.model('ShareLink');

  // TDOO write swagger
  router.get('/', loginRequired, async(req, res) => {
    const { pageId } = req.query;
    // TODO GW-2616 get all share links associated with the page
  });

  validator.shareLinkStatus = [
    // validate the page id is null
    body('pageId').not().isEmpty().withMessage('Page Id is null'),

    // validate expireation date is not empty, is not before today and is date.
    body('expiration').isAfter(today.toString()).withMessage('Your Selected date is past'),

    // validate the length of description is max 100.
    body('description').isLength({ min: 0, max: 100 }).withMessage('Max length is 100'),

  ];

  /**
   * @swagger
   *
   *  paths:
   *    /share-link/:
   *      post:
   *        tags: [ShareLink]
   *        description: Create new share link
   *        parameters:
   *          - name: pageId
   *            in: query
   *            required: true
   *            description: page id of share link
   *            schema:
   *              type: string
   *          - name: expiration
   *            in: query
   *            description: expiration date of share link
   *            schema:
   *              type: date
   *          - name: description
   *            in: query
   *            description: description of share link
   *            schema:
   *              type: string
   *        responses:
   *          200:
   *            description: Succeeded to create one share link
   */

  router.post('/', loginRequired, csrf, validator.shareLinkStatus, ApiV3FormValidator, async(req, res) => {
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
