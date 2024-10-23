const pkg = require('../../package.json');

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
