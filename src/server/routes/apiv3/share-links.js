// TODO remove this setting after implemented all
/* eslint-disable no-unused-vars */
const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:share-links');

const express = require('express');

const router = express.Router();

const { body } = require('express-validator/check');

const ErrorV3 = require('../../models/vo/error-apiv3');

const validator = {};

const today = new Date();

/**
 * @swagger
 *  tags:
 *    name: ShareLink
 */

module.exports = (crowi) => {
  const loginRequired = require('../../middlewares/login-required')(crowi);
  const adminRequired = require('../../middlewares/admin-required')(crowi);
  const csrf = require('../../middlewares/csrf')(crowi);
  const apiV3FormValidator = require('../../middlewares/apiv3-form-validator')(crowi);
  const ShareLink = crowi.model('ShareLink');


  /**
   * @swagger
   *
   *  paths:
   *    /share-links/:
   *      post:
   *        tags: [ShareLink]
   *        description: get share links
   *        parameters:
   *          - name: relatedPage
   *            in: query
   *            required: true
   *            description: page id of share link
   *            schema:
   *              type: string
   *        responses:
   *          200:
   *            description: Succeeded to get share links
   */
  router.get('/', loginRequired, async(req, res) => {
    const { relatedPage } = req.query;
    try {
      const shareLinksResult = await ShareLink.find({ relatedPage: { $in: relatedPage } }).populate({ path: 'relatedPage', select: 'path' });
      return res.apiv3({ shareLinksResult });
    }
    catch (err) {
      const msg = 'Error occurred in get share link';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'get-shareLink-failed'));
    }
  });

  validator.shareLinkStatus = [
    // validate the page id is null
    body('relatedPage').not().isEmpty().withMessage('Page Id is null'),
    // validate expireation date is not empty, is not before today and is date.
    body('expiredAt').if(value => value != null).isAfter(today.toString()).withMessage('Your Selected date is past'),
    // validate the length of description is max 100.
    body('description').isLength({ min: 0, max: 100 }).withMessage('Max length is 100'),
  ];

  /**
   * @swagger
   *
   *  paths:
   *    /share-links/:
   *      post:
   *        tags: [ShareLink]
   *        description: Create new share link
   *        parameters:
   *          - name: relatedPage
   *            in: query
   *            required: true
   *            description: page id of share link
   *            schema:
   *              type: string
   *          - name: expiredAt
   *            in: query
   *            description: expiration date of share link
   *            schema:
   *              type: string
   *          - name: description
   *            in: query
   *            description: description of share link
   *            schema:
   *              type: string
   *        responses:
   *          200:
   *            description: Succeeded to create one share link
   */

  router.post('/', loginRequired, csrf, validator.shareLinkStatus, apiV3FormValidator, async(req, res) => {
    const { relatedPage, expiredAt, description } = req.body;
    const ShareLink = crowi.model('ShareLink');

    try {
      const postedShareLink = await ShareLink.create({ relatedPage, expiredAt, description });
      return res.apiv3(postedShareLink, 201);
    }
    catch (err) {
      const msg = 'Error occured in post share link';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'post-shareLink-failed'));
    }
  });

  /**
  * @swagger
  *
  *    /share-links/:
  *      delete:
  *        tags: [ShareLinks]
  *        summary: /share-links/
  *        description: delete all share links related one page
  *        parameters:
  *          - name: relatedPage
  *            in: query
  *            required: true
  *            description: page id of share link
  *            schema:
  *              type: string
  *        responses:
  *          200:
  *            description: Succeeded to delete o all share links related one page
  */
  router.delete('/', loginRequired, csrf, async(req, res) => {
    const { relatedPage } = req.query;

    try {
      const deletedShareLink = await ShareLink.remove({ relatedPage });
      return res.apiv3(deletedShareLink);
    }
    catch (err) {
      const msg = 'Error occured in delete share link';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'delete-shareLink-failed'));
    }
  });

  /**
  * @swagger
  *
  *    /share-links/all:
  *      delete:
  *        tags: [ShareLinks]
  *        description: delete all share links
  *        responses:
  *          200:
  *            description: Succeeded to remove all share links
  */
  router.delete('/all', loginRequired, adminRequired, csrf, async(req, res) => {

    try {
      const deletedShareLink = await ShareLink.deleteMany({});
      const { deletedCount } = deletedShareLink;
      return res.apiv3({ deletedCount });
    }
    catch (err) {
      const msg = 'Error occurred in delete all share link';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'delete-all-shareLink-failed'));
    }
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
      return res.apiv3({ deletedShareLink });
    }
    catch (err) {
      const msg = 'Error occurred in delete share link';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'delete-shareLink-failed'));
    }

  });


  return router;
};
