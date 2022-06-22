import path from 'path';

export const
  i18n = {
    defaultLocale: 'en_US',
    locales: ['ja_JP', 'zh_CN'],
  };
export const defaultNS = 'translation';
export const localePath = path.resolve('./public/static/locales');
export const allLocales = [i18n.defaultLocale].concat(i18n.locales);
