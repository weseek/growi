const loggerFactory = require('@alias/logger');

const logger = loggerFactory('growi:routes:apiv3:docs'); // eslint-disable-line no-unused-vars

const express = require('express');

const router = express.Router();

module.exports = (crowi) => {

  // skip if disabled
  if (!crowi.configManager.getConfig('crowi', 'app:publishOpenAPI')) {
    return router;
  }

  const swaggerJSDoc = require('swagger-jsdoc');
  const swaggerDefinition = require('@root/config/swagger-definition');

  // generate swagger spec
  const options = {
    swaggerDefinition,
    apis: swaggerDefinition.apis,
  };
  const swaggerSpec = swaggerJSDoc(options);

  // publish swagger spec
  router.get('/swagger-spec.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // publish redoc
  router.get('/', (req, res) => {
    res.render('redoc');
  });

  return router;
};
