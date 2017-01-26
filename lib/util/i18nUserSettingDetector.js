module.exports = {
  name: 'userSettingDetector',

  lookup: function(req, res, options) {
    var lang = null;

    if (req.user) {
      if ('lang' in req.user) {
        lang = req.user.lang || null;
      }
    }

    return lang;
  },

  cacheUserlanguage: function(req, res, lng, options) {
    // nothing to do
  }
};
