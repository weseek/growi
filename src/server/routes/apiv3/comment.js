import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:routes:apiv3:comment'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();


module.exports = (crowi) => {

  router.get('/', async(req, res) => {

  });

  return router;
};
