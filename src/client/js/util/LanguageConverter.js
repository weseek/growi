import locales from '@root/resource/locales';

class LanguageConverter {

  constructor(langDetector) {
    this.name = 'languageConverter';
    this.type = 'languageDetector';

    this.langDetector = langDetector;
  }

  detect() {
    const lang = this.langDetector.detect(['userSettingDetector', 'navigator', 'querystring']);

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

    this.langDetector.init(services);
  }

  cacheUserLanguage(lng, caches) {
    return this.langDetector.cacheUserLanguage(lng, caches);
  }

}

export default LanguageConverter;
