const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:bookmarks'); // eslint-disable-line no-unused-vars

const express = require('express');
const { query } = require('express-validator');

const router = express.Router();


router.get('/list', async(req, res) => {
  const pageLimitationM = parseInt(req.query.pageLimitationM) || await crowi.configManager.getConfig('crowi', 'customize:showPageLimitationM') || 30;

  return res.apiv3({ pageLimitationM });
});
