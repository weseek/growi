const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:pages');

const express = require('express');

const { query, param } = require('express-validator/check');
const ErrorV3 = require('../../models/vo/error-apiv3');

const router = express.Router();

const PAGE_ITEMS = 30;

/**
 * @swagger
 *  tags:
 *    name: Revisions
 */
module.exports = (crowi) => {
  const certifySharedPage = require('../../middlewares/certify-shared-page')(crowi);
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequired = require('../../middlewares/login-required')(crowi, true);
  const apiV3FormValidator = require('../../middlewares/apiv3-form-validator')(crowi);

  const {
    Revision,
    Page,
    User,
  } = crowi.models;

  const validator = {
    retrieveRevisions: [
      query('page_id').isMongoId().withMessage('pageId is required'),
      query('selectedPage').isInt({ min: 0 }).withMessage('selectedPage must be int'),
    ],
    retrieveRevisionById: [
      query('page_id').isMongoId().withMessage('pageId is required'),
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
    const pageId = req.query.page_id;
    const { isSharedPage } = req;

    const selectedPage = parseInt(req.query.selectedPage) || 1;

    // check whether accessible
    if (!isSharedPage && !(await Page.isAccessiblePageByViewer(pageId, req.user))) {
      return res.apiv3Err(new ErrorV3('Current user is not accessible to this page.', 'forbidden-page'), 403);
    }

    try {
      const page = await Page.findOne({ _id: pageId });

      const paginateResult = await Revision.paginate(
        { path: page.path },
        {
          page: selectedPage,
          limit: PAGE_ITEMS,
          sort: { createdAt: -1 },
          populate: {
            path: 'author',
            select: User.USER_PUBLIC_FIELDS,
          },
        },
      );

      return res.apiv3(paginateResult);
    }
    catch (err) {
      const msg = 'Error occurred in getting revisions by poge id';
      logger.error('Error', err);
      return res.apiv3Err(new ErrorV3(msg, 'faild-to-find-revisions'), 500);
    }

  });

  /**
   * @swagger
   *
   *    /revisions/{id}:
   *      get:
   *        tags: [Revisions]
   *        description: Get one revision by id
   *        parameters:
   *          - in: query
   *            name: pageId
   *            required: true
   *            description: page id
   *            schema:
   *              type: string
   *          - in: path
   *            name: id
   *            required: true
   *            description: revision id
   *            schema:
   *              type: string
   *        responses:
   *          200:
   *            description: Return revision
   *
   */
  router.get('/:id', certifySharedPage, accessTokenParser, loginRequired, validator.retrieveRevisionById, apiV3FormValidator, async(req, res) => {
    const revisionId = req.params.id;
    const pageId = req.query.page_id;
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
