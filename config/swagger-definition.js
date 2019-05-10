const pkg = require('../package.json');

module.exports = {
  openapi: '3.0.1',
  info: {
    title: 'GROWI REST API v3',
    version: pkg.version,
  },
  externalDocs: {
    description: 'GROWI Docs',
    url: 'https://docs.growi.org',
  },
  basePath: '/api/v3/',
};
