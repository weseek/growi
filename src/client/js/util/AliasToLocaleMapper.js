import locales from '@root/resource/locales';

const aliasesMapping = {};
Object.values(locales).forEach((locale) => {
  locale.meta.aliases.forEach((aliase) => {
    aliasesMapping[aliase] = locale.meta.id;
  });
});

class AliasToLocaleMapper {

  constructor(langDetector) {
    this.name = 'aliasToLocaleMapper';
    this.type = 'languageDetector';

    this.langDetector = langDetector;
  }

  detect() {
    const lang = this.langDetector.detect();
    if (lang == null) {
      return;
    }

    if (Object.values(aliasesMapping).includes(lang)) {
      return lang;
    }

    return aliasesMapping[lang];
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

export default AliasToLocaleMapper;
