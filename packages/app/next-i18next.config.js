const path = require('path');

const i18nextConfigs = {
  i18n: {
    defaultLocale: 'en_US',
    locales: ['ja_JP', 'zh_CN'],
  },
  defaultNS: 'translation',
  localePath: path.resolve('./public/static/locales'),
};

module.exports = {
  ...i18nextConfigs,
  allLocales: [i18nextConfigs.i18n.defaultLocale].concat(i18nextConfigs.i18n.locales),
};
