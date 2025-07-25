const pkg = require('../../package.json');

module.exports = {
  openapi: '3.0.1',
  info: {
    title: 'GROWI REST API v3',
    version: pkg.version,
  },
  servers: [
    {
      url: '{server}/_api/v3',
      variables: {
        server: {
          default: 'https://demo.growi.org',
          description: 'The base URL for the GROWI API except for the version path (/_api/v3). This can be set to your GROWI instance URL.',
        },
      },
    },
    {
      url: 'https://demo.growi.org/_api/v3',
    },
  ],
  security: [
    {
      bearer: [],
      accessTokenInQuery: [],
    },
  ],
  components: {
    securitySchemes: {
      bearer: {
        type: 'http',
        scheme: 'bearer',
        description: 'Access token generated by each GROWI users',
      },
      accessTokenInQuery: {
        type: 'apiKey',
        name: 'access_token',
        in: 'query',
        description: 'Access token generated by each GROWI users',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'connect.sid',
      },
      transferHeaderAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-growi-transfer-key',
      },
    },
  },
  'x-tagGroups': [
    {
      name: 'User API',
      tags: [
        'Attachment',
        'Bookmarks',
        'BookmarkFolders',
        'Page',
        'Pages',
        'PageListing',
        'Revisions',
        'ShareLinks',
        'Users',
        'UserUISettings',
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
        'Activity',
        'AdminHome',
        'AppSettings',
        'ExternalUserGroups',
        'SecuritySetting',
        'MarkDownSetting',
        'CustomizeSetting',
        'Import',
        'Export',
        'GROWI to GROWI Transfer',
        'MongoDB',
        'NotificationSetting',
        'Plugins',
        'SlackIntegration',
        'SlackIntegrationSettings',
        'SlackIntegrationSettings (with proxy)',
        'SlackIntegrationSettings (without proxy)',
        'SlackIntegrationLegacySetting',
        'ShareLink Management',
        'Templates',
        'Staff',
        'UserGroupRelations',
        'UserGroups',
        'Users Management',
        'FullTextSearch Management',
        'Install',
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
