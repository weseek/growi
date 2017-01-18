module.exports = {
  name: 'userSettingDetector',

  lookup: function(req, res, options) {
    var language;

    if (req.user) {
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
