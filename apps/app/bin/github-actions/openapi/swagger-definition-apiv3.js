const path = require('node:path');

const pkg = require('../../package.json');

const apisBasePath = path.resolve(process.env.WORKSPACE_ROOT ?? '../../', 'apps/app');

console.log(`apisBasePath: ${apisBasePath}`);
module.exports = {
  openapi: '3.0.1',
  info: {
    title: 'GROWI REST API v3',
    version: pkg.version,
  },
  servers: [
    {
      url: 'https://demo.growi.org/_api/v3',
    },
  ],
  apis: [
    './src/server/routes/apiv3/**/*.{js,ts}',
    './src/server/models/openapi/**/*.{js,ts}',
  ],
  security: [
    {
      api_key: [],
    },
  ],
  components: {
    securitySchemes: {
      api_key: {
        type: 'apiKey',
        name: 'access_token',
        in: 'query',
      },
    },
  },
};
