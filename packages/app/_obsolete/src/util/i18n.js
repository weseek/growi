
/* eslint-disable */
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import locales from '^/public/static/locales';

const aliasesMapping = {};
Object.values(locales).forEach((locale) => {
  if (locale.meta.aliases == null) {
    return;
  }
  locale.meta.aliases.forEach((alias) => {
    aliasesMapping[alias] = locale.meta.id;
  });
});

/*
* Note: This file will be deleted. use "^/config/next-i18next.config" instead
*/
// extract metadata list from 'public/static/locales/${locale}/meta.json'
export const localeMetadatas = Object.values(locales).map(locale => locale.meta);

export const i18nFactory = (userLocaleId) => {
  // setup LanguageDetector
  const langDetector = new LanguageDetector();
  langDetector.addDetector({
    name: 'userSettingDetector',
    lookup(options) {
      return userLocaleId;
    },
  });
  // Wrapper to convert lang after detected from browser
  langDetector.addDetector({
    name: 'navigatorWrapperToConvertByAlias',
    lookup(options) {
      const results = langDetector.detectors.navigator.lookup(options);
      const lang = results[0];
      if (lang == null) {
        return;
      }

      return aliasesMapping[lang] || lang;
    },
  });

  i18n
    .use(langDetector)
    .use(initReactI18next) // if not using I18nextProvider
    .init({
      debug: (process.env.NODE_ENV !== 'production'),
      resources: locales,
      load: 'currentOnly',

      fallbackLng: 'en_US',
      detection: {
        order: ['userSettingDetector', 'navigatorWrapperToConvertByAlias', 'querystring'],
      },

      interpolation: {
        escapeValue: false, // not needed for react!!
      },

      // react i18next special options (optional)
      react: {
        wait: false,
        withRef: true,
        bindI18n: 'languageChanged loaded',
        bindStore: 'added removed',
        nsMode: 'default',
      },
    });

  return i18n;
};
