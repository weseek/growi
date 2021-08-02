import loggerFactory from '~/utils/logger';
import swaggerDefinition from '^/config/swagger-definition';

const express = require('express');
const swaggerJSDoc = require('swagger-jsdoc');

const logger = loggerFactory('growi:routes:apiv3:docs'); // eslint-disable-line no-unused-vars

const router = express.Router();

// paths to scan
const APIS = [
  'src/server/routes/apiv3/**/*.js',
  'src/server/models/**/*.js',
];

module.exports = (crowi) => {

  // skip if disabled
  if (!crowi.configManager.getConfig('crowi', 'app:publishOpenAPI')) {
    return router;
  }

  // generate swagger spec
  const options = {
    swaggerDefinition,
    apis: APIS,
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
