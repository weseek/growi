import path from 'path';

import { isServer, AllLang, Lang } from '@growi/core';
import I18nextChainedBackend from 'i18next-chained-backend';
import I18NextHttpBackend from 'i18next-http-backend';
import I18NextLocalStorageBackend from 'i18next-localstorage-backend';

const isDev = process.env.NODE_ENV === 'development';

export const i18n = {
  defaultLocale: Lang.en_US,
  locales: AllLang,
};
export const defaultNS = 'translation';
export const localePath = path.resolve('./public/static/locales');

export const serializeConfig = false;
export const use = isServer() ? [] : [I18nextChainedBackend];
export const backend = {
  backends: isServer() ? [] : [I18NextLocalStorageBackend, I18NextHttpBackend],
  backendOptions: [
    // options for i18next-localstorage-backend
    { expirationTime: isDev ? 0 : 24 * 60 * 60 * 1000 }, // 1 day in production
    // options for i18next-http-backend
    { loadPath: '/static/locales/{{lng}}/{{ns}}.json' },
  ],
};
