module.exports = {
  name: 'userSettingDetector',

  lookup(req, res, options) {
    if (req.user == null) {
      return null;
    }
    return req.user.lang || null;
  },

  cacheUserlanguage(req, res, lng, options) {
    // nothing to do
  },
};
