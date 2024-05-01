const { Lang, AllLang } = require('@growi/core');

/** @type {Lang} */
export const defaultLang = Lang.en_US;

/** @type {import('i18next').InitOptions} */
export const initOptions = {
  fallbackLng: defaultLang.toString(),
  supportedLngs: AllLang,
  defaultNS: 'translation',
};
