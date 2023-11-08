const path = require('path');

const { AllLang, Lang } = require('@growi/core');
const { isServer } = require('@growi/core/dist/utils');
const I18nextChainedBackend = require('i18next-chained-backend').default;
const I18NextLocalStorageBackend = require('i18next-localstorage-backend').default;
const i18NextLocizeBackend = require('i18next-locize-backend/cjs');

const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  defaultLang: Lang.en_US,
  i18n: {
    defaultLocale: Lang.en_US,
    locales: AllLang,
  },
  defaultNS: 'translation',
  localePath: path.resolve('./public/static/locales'),
  serializeConfig: false,
  use: isServer() ? [] : [I18nextChainedBackend],
  backend: {
    backends: isServer() ? [] : [I18NextLocalStorageBackend, i18NextLocizeBackend],
    backendOptions: [
      // options for i18next-localstorage-backend
      { expirationTime: isDev ? 0 : 24 * 60 * 60 * 1000 }, // 1 day in production
      // options for i18next-locize-backend
      {
        loadPath: '/static/locales/{{lng}}/{{ns}}.json',
        addPath: 'static/locales/add/{{lng}}/{{ns}}',
        projectId: '2ce91e4f-98e9-43a0-8da7-ae5ebd4d2e49',
        apiKey: '53989b1a-db2d-4084-a765-d33ac45b356e',
        referenceLng: 'ja_JP',
        version: 'latest',
      },
    ],
  },
};
