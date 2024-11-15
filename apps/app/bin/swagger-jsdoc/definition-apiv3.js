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
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'connect.sid',
      },
    },
  },
  'x-tagGroups': [
    {
      name: 'User API',
      tags: [
        'Attachment',
        'Bookmarks',
        'Page',
        'Pages',
        'Revisions',
        'ShareLinks',
        'Users',
        '',
        '',
      ],
    },
    {
      name: 'User Personal Settings API',
      tags: [
        'GeneralSetting',
        'EditorSetting',
        'InAppNotificationSettings',
        '',
        '',
        '',
        '',
        '',
      ],
    },
    {
      name: 'System Management API',
      tags: [
        'Home',
        'AppSettings',
        'SecuritySetting',
        'MarkDownSetting',
        'CustomizeSetting',
        'Import',
        'Export',
        'MongoDB',
        'NotificationSetting',
        'SlackIntegrationSettings',
        'SlackIntegrationSettings (with proxy)',
        'SlackIntegrationSettings (without proxy)',
        'SlackIntegrationLegacySetting',
        'ShareLink Management',
        'UserGroupRelations',
        'UserGroups',
        'Users Management',
        'FullTextSearch Management',
      ],
    },
    {
      name: 'Public API',
      tags: [
        'Healthcheck',
        'Statistics',
        '',
        '',
        '',
        '',
        '',
        '',
      ],
    },
  ],
};
