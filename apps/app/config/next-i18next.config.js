const path = require('path');

const { AllLang, Lang } = require('@growi/core');
const { isServer } = require('@growi/core/dist/utils');
const I18nextChainedBackend = require('i18next-chained-backend').default;
const I18NextHttpBackend = require('i18next-http-backend');
const I18NextLocalStorageBackend = require('i18next-localstorage-backend').default;
const i18NextLocizeBackend = require('i18next-locize-backend');

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
    backends: isServer() ? [] : [I18NextLocalStorageBackend, I18NextHttpBackend, i18NextLocizeBackend],
    backendOptions: [
      // options for i18next-localstorage-backend
      { expirationTime: isDev ? 0 : 24 * 60 * 60 * 1000 }, // 1 day in production
      // options for i18next-http-backend
      { loadPath: '/static/locales/{{lng}}/{{ns}}.json' },
      // options for i18next-locize-backend
      {
        projectId: '89632551-6541-4261-a4f5-66ee56bec3df',
        api: '6fc5f3ee-7a02-4449-bf91-c9759283a8f5',
      },
    ],
  },
};
