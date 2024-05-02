const { Lang, AllLang } = require('@growi/core');

/** @type {Lang} */
const defaultLang = Lang.en_US;

/** @type {import('i18next').InitOptions} */
const initOptions = {
  fallbackLng: defaultLang.toString(),
  supportedLngs: AllLang,
  defaultNS: 'translation',
};

module.exports = {
  defaultLang,
  initOptions,
};
