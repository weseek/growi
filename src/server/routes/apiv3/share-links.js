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
    // TODO GW-2616
  });


  // TDOO write swagger
  router.post('/', loginRequired, async(req, res) => {
    // TODO GW-2609
  });

  // TDOO write swagger
  router.delete('/all', loginRequired, async(req, res) => {
    // TODO GW-2694
  });

  // TDOO write swagger
  router.delete('/:id', loginRequired, async(req, res) => {
    // TODO GW-2610
  });


  return router;
};
