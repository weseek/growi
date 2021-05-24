import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import locales from '@root/resource/locales';

// extract metadata list from 'resource/locales/${locale}/meta.json'
export const localeMetadatas = Object.values(locales).map(locale => locale.meta);

const browserLanguageIdMapping = {
  zh: 'zh_CN',
  ja: 'ja_JP',
  en: 'en_US',
};

export const i18nFactory = (userLocaleId) => {
  // setup LanguageDetector
  const langDetector = new LanguageDetector();
  langDetector.addDetector({
    name: 'userSettingDetector',
    lookup(options) {
      return userLocaleId;
    },
  });
  // Defined detection from the browser to convert id
  // See Reference: https://github.com/i18next/i18next-browser-languageDetector/blob/master/src/browserLookups/navigator.js
  langDetector.addDetector({
    name: 'userBrowserDetector',
    lookup(options) {
      const found = [];

      if (typeof navigator !== 'undefined') {
        if (navigator.languages) { // chrome only; not an array, so can't use .push.apply instead of iterating
          for (let i = 0; i < navigator.languages.length; i++) {
            found.push(navigator.languages[i]);
          }
        }
        if (navigator.userLanguage) {
          found.push(navigator.userLanguage);
        }
        if (navigator.language) {
          found.push(navigator.language);
        }
      }

      if (found.length === 0) {
        return undefined;
      }
      // detect id from browserLanguageIdMapping
      return browserLanguageIdMapping[found.find(v => Object.keys(browserLanguageIdMapping).includes(v))];
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
        order: ['userSettingDetector', 'userBrowserDetector', 'querystring'],
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
