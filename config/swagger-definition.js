const pkg = require('../package.json');

module.exports = {
  openapi: '3.0.1',
  info: {
    title: 'GROWI REST API v3',
    version: pkg.version,
  },
  basePath: '/api/v3/',
};
