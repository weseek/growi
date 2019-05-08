module.exports = {
  openapi: '3.0.1',
  info: {
    title: 'GROWI API Docs',
    version: '3.0.0',
  },
  externalDocs: {
    description: 'GROWI Docs',
    url: 'https://docs.growi.org',
  },
  basePath: '/api/v3/',
  apis: [
    'src/server/routes/apiv3/**/*.js',
  ],
};
