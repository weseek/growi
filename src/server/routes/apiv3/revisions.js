const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:pages'); // eslint-disable-line no-unused-vars

const express = require('express');


const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: Revisions
 */
module.exports = (crowi) => {
  const loginRequired = require('../../middlewares/login-required')(crowi, true);

  const Page = crowi.model('Page');

  /**
   * @swagger
   *
   *    /revisions/{id}:
   *      get:
   *        tags: [Revisions]
   *        description: Get revisions by page id
   *        responses:
   *          200:
   *            description: Return revisions belong to page
   *
   */
  router.get('/{id}', loginRequired, async(req, res) => {
    console.log('hoge');
    console.log(req.query);

    const { id } = req.query;
    console.log(id);

    return res.apiv3({ id });
  });

  return router;
};
