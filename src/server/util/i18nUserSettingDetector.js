const { getLocaleAliasToIdMap } = require('@commons/util/locale-utils');

const aliasToIdMap = getLocaleAliasToIdMap();

module.exports = {
  name: 'userSettingDetector',

  lookup(req, res, options) {
    if (req.user == null) {
      return null;
    }

    // convert locale alias to corrent locale id for backward compatibility -- 2020.06.21 Yuki Takei
    const { userLang } = req.user;
    const convertedLocaleId = aliasToIdMap[userLang];

    return convertedLocaleId || req.user.lang || null;
  },

  cacheUserlanguage(req, res, lng, options) {
    // nothing to do
  },
};
