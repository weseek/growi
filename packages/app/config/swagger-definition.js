const pkg = require('../package.json');

const apiVersion = process.env.API_VERSION || '3';
const basePath = (apiVersion === '1' ? '/_api' : `/_api/v${apiVersion}`);

module.exports = {
  openapi: '3.0.1',
  info: {
    title: `GROWI REST API v${apiVersion}`,
    version: pkg.version,
  },
  servers: [
    {
      url: 'https://demo.growi.org{basePath}',
      variables: {
        basePath: {
          default: basePath,
          description: 'base path',
        },
      },
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
