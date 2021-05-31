class LanguageConverter {

  constructor(langDetector) {
    this.name = 'languageConverter';
    this.type = 'languageDetector';

    this.langDetector = langDetector;
  }
  //  browserLanguageIdMapping = {
  //   zh: 'zh_CN',
  //   ja: 'ja_JP',
  //   en: 'en_US',
  // };

  detect() {
    const lang = this.langDetector.detect(['userSettingDetector', 'querystring']);
    // detect id from browserLanguageIdMapping
    // return browserLanguageIdMapping[found.find(v => Object.keys(browserLanguageIdMapping).includes(v))];

    return lang;
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
