module.exports = {
  name: 'userSettingDetector',

  lookup: function(req, res, options) {
    var language;

    if ('user' in req && typeof req.user !== 'undefined' && req.user !== false) {
      if ('language' in req.user) {
        language = req.user.language;
      }
    }

    return language;
  },

  cacheUserLanguage: function(req, res, lng, options) {
    // nothing to do
  }
};
