const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:pages');

const express = require('express');

const { query, param } = require('express-validator/check');
const ErrorV3 = require('../../models/vo/error-apiv3');

const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: Revisions
 */
module.exports = (crowi) => {
  const certifySharedPage = require('../../middlewares/certify-shared-file')(crowi);
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi);
  const apiV3FormValidator = require('../../middlewares/apiv3-form-validator')(crowi);

  const {
    Revision,
    Page,
    User,
  } = crowi.models;

  const validator = {
    retrieveRevisions: [
      query('pageId').isMongoId().withMessage('pageId is required'),
    ],
    retrieveRevisionById: [
      query('pageId').isMongoId().withMessage('pageId is required'),
      param('id').isMongoId().withMessage('id is required'),
    ],
  };

  /**
   * @swagger
   *
   *    /revisions/list:
   *      get:
   *        tags: [Revisions]
   *        description: Get revisions by page id
   *        parameters:
   *          - in: query
   *            name: pageId
   *            schema:
   *              type: string
   *              description:  page id
   *        responses:
   *          200:
   *            description: Return revisions belong to page
   *
   */
  router.get('/list', certifySharedPage, accessTokenParser, loginRequired, validator.retrieveRevisions, apiV3FormValidator, async(req, res) => {
    const { pageId } = req.query;
    const { isSharedPage } = req;

    // check whether accessible
    if (!isSharedPage && !(await Page.isAccessiblePageByViewer(pageId, req.user))) {
      return res.apiv3Err(new ErrorV3('Current user is not accessible to this page.', 'forbidden-page'), 403);
    }

    try {
      const page = await Page.findOne({ _id: pageId });
      const revisions = await Revision.findRevisionIdList(page.path);
      return res.apiv3({ revisions });
    }
    catch (err) {
      const msg = 'Error occurred in getting revisions by poge id';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'faild-to-find-revisions'), 500);
    }

  });

  router.get('/:id', accessTokenParser, loginRequired, validator.retrieveRevisionById, apiV3FormValidator, async(req, res) => {
    const revisionId = req.params.id;
    const { pageId } = req.query;
    const { isSharedPage } = req;

    // check whether accessible
    if (!isSharedPage && !(await Page.isAccessiblePageByViewer(pageId, req.user))) {
      return res.apiv3Err(new ErrorV3('Current user is not accessible to this page.', 'forbidden-page'), 403);
    }

    try {
      const revision = await Revision.findById(revisionId).populate('author', User.USER_PUBLIC_FIELDS);
      return res.apiv3({ revision });
    }
    catch (err) {
      const msg = 'Error occurred in getting revision data by id';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'faild-to-find-revision'), 500);
    }

  });

  return router;
};
