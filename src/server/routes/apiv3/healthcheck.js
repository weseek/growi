const loggerFactory = require('@alias/logger');
const logger = loggerFactory('growi:routes:apiv3:healthcheck');   // eslint-disable-line no-unused-vars

const express = require('express');
const router = express.Router();

const helmet = require('helmet');

module.exports = (crowi) => {

  router.get('/', helmet.noCache(), async function(req, res) {
    const connectToMiddlewares = req.query.connectToMiddlewares;

    // return 200 w/o connecting to MongoDB and Elasticsearch
    if (connectToMiddlewares == null) {
      res.status(200).send({ status: 'OK' });
      return;
    }

    try {
      // connect to MongoDB
      const Config = crowi.models.Config;
      await Config.findOne({});
      // connect to Elasticsearch
      const search = crowi.getSearcher();
      const esInfo = await search.getInfo();

      res.status(200).send({ mongo: 'OK', esInfo });
    }
    catch (err) {
      res.status(503).send({err});
    }
  });

  return router;
};
