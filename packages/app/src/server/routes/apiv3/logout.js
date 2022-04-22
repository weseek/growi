import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:routes:apiv3:forgotPassword'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();

module.exports = (crowi) => {
  router.post('/', async(req, res) => {
    return req.session.destroy();
  });

  return router;
};
