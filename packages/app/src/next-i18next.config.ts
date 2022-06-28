import path from 'path';

import I18nextChainedBackend from 'i18next-chained-backend';
import I18NextHttpBackend from 'i18next-http-backend';
import I18NextLocalStorageBackend from 'i18next-localstorage-backend';

const isServer = typeof window === 'undefined';

export const
  i18n = {
    defaultLocale: 'en_US',
    locales: ['en_US', 'ja_JP', 'zh_CN'],
  };
export const defaultNS = 'translation';
export const localePath = path.resolve('./public/static/locales');

export const serializeConfig = false;
export const use = isServer ? [] : [I18nextChainedBackend];
export const
  backend = {
    backends: isServer ? [] : [I18NextLocalStorageBackend, I18NextHttpBackend],
    backendOptions: [
      // options for i18next-localstorage-backend
      { expirationTime: 60 * 60 * 1000 }, // 1 hour
      // options for i18next-http-backend
      { loadPath: '/static/locales/{{lng}}/{{ns}}.json', },
    ],
  };
