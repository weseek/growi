// TODO remove this setting after implemented all
/* eslint-disable no-unused-vars */
// const loggerFactory = require('@alias/logger');

// const logger = loggerFactory('growi:routes:apiv3:share-links');

const express = require('express');

const router = express.Router();

/**
 * @swagger
 *  tags:
 *    name: ShareLinks
 */

module.exports = (crowi) => {
  const loginRequired = require('../../middleware/login-required')(crowi);

  // TDOO write swagger
  router.get('/', loginRequired, async(req, res) => {
    const { pageId } = req.query;
    // TODO GW-2616 get all share links associated with the page
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

  // TDOO write swagger
  router.delete('/:id', loginRequired, async(req, res) => {
    const { pageId } = req.body;
    // TODO GW-2610 Remove specific share link
  });


  return router;
};
