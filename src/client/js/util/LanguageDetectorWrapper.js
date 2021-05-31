import locales from '@root/resource/locales';

class LanguageDetectorWrapper {

  constructor(langDetector) {
    this.name = 'languageDetectorWrapper';
    this.type = 'languageDetector';

    this.langDetector = langDetector;
  }

  detect() {
    const lang = this.langDetector.detect();
    if (lang == null) {
      return;
    }

    const browserLanguageIdMapping = {};
    Object.values(locales).forEach((locale) => {
      browserLanguageIdMapping[locale.meta.browserLanguageId] = locale.meta.id;
    });
    if (Object.values(browserLanguageIdMapping).includes(lang)) {
      return lang;
    }
    return browserLanguageIdMapping[lang];
  }

  init(services, options = {}, i18nOptions = {}) {
    this.services = services;
    this.i18nOptions = i18nOptions;

    this.langDetector.init(services, { order: ['userSettingDetector', 'navigator', 'querystring'] });
  }

  cacheUserLanguage(lng, caches) {
    return this.langDetector.cacheUserLanguage(lng, caches);
  }

}

export default LanguageDetectorWrapper;
